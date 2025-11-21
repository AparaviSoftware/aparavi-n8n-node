#!/usr/bin/env node

/**
 * Test LlamaParse using the PUBLISHED aparavi-client SDK from npm
 * Following the format from test-llamaparse-final.ts
 */

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

const CONFIG = {
	uri: 'wss://eaas-dev.aparavi.com:443',
	auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
};

// LlamaParse + LVM Pipeline (similar to test-llamaparse-final.ts format)
// But loading from the predefined pipeline file
function loadLlamaParsePipeline() {
	const pipelinePath = path.join(__dirname, 'predefinedPipelines', 'llamaparse_webhook.json');
	const pipelineJson = fs.readFileSync(pipelinePath, 'utf8');
	const pipelineData = JSON.parse(pipelineJson);
	
	// Convert from components format to pipeline format
	if (pipelineData.components && !pipelineData.pipeline) {
		// Find webhook source component
		const webhookComponent = pipelineData.components.find(c => c.provider === 'webhook');
		const sourceId = webhookComponent ? webhookComponent.id : 'webhook_1';
		
		// Return in the format expected by the SDK
		return {
			source: sourceId,
			components: pipelineData.components,
			project_id: pipelineData.id || 'llamaparse-' + Date.now()
		};
	}
	
	// If already in pipeline format, extract components
	if (pipelineData.pipeline) {
		return {
			source: pipelineData.pipeline.source,
			components: pipelineData.pipeline.components,
			project_id: pipelineData.pipeline.project_id || 'llamaparse-' + Date.now()
		};
	}
	
	return pipelineData;
}

async function testLlamaParse(pdfFilePath) {
	console.log('\n🚀 Testing LlamaParse with aparavi-client SDK');
	console.log('   Package: aparavi-client from npm');
	console.log('='.repeat(70));

	if (!fs.existsSync(pdfFilePath)) {
		console.error(`❌ Error: PDF file not found: ${pdfFilePath}`);
		console.error('   Please provide a valid PDF file path as argument');
		process.exit(1);
	}

	const fileStats = fs.statSync(pdfFilePath);
	const fileName = path.basename(pdfFilePath);
	console.log(`\n📄 File: ${fileName}`);
	console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB\n`);

	const client = new AparaviClient(CONFIG);

	try {
		console.log('📡 Connecting to Aparavi server...');
		await client.connect();
		console.log('   ✅ Connected\n');

		// Load pipeline and convert to the format expected by SDK
		const pipelineConfig = loadLlamaParsePipeline();
		const uniqueToken = 'LLAMAPARSE-TEST-' + Date.now();
		
		console.log('🚀 Starting LlamaParse + LVM pipeline...');
		
		// Convert to SDK format - wrap in pipeline object like test-llamaparse-final.ts
		const components = pipelineConfig.components || [];
		
		// Find webhook component and ensure it has the right config
		let webhookComponent = components.find(c => c.provider === 'webhook');
		if (!webhookComponent) {
			throw new Error('No webhook component found in pipeline');
		}
		
		// Ensure the webhook config has ALL required fields (matching test-llamaparse-final.ts format)
		webhookComponent.config.mode = 'Source';
		webhookComponent.config.key = 'webhook://*';
		webhookComponent.config.name = 'Webhook Source';
		webhookComponent.config.type = 'webhook';
		if (!webhookComponent.config.include) {
			webhookComponent.config.include = [{ path: '*' }];
		}
		if (!webhookComponent.config.parameters) {
			webhookComponent.config.parameters = {
				endpoint: '/pipe/process',
				port: 5566
			};
		}
		webhookComponent.config.sync = false;
		
		console.log('   Webhook config:', JSON.stringify(webhookComponent.config, null, 2));
		
		const sourceId = webhookComponent.id;
		
		const pipelineToUse = {
			pipeline: {
				source: sourceId,
				project_id: pipelineConfig.project_id || 'llamaparse-' + Date.now(),
				components: components
			}
		};
		
		console.log('   Source:', sourceId);
		console.log('   Components:', components.length);
		console.log('   Project ID:', pipelineToUse.pipeline.project_id);
		
		const result = await client.use({
			pipeline: pipelineToUse.pipeline,
			token: uniqueToken
		});
		console.log(`   ✅ Pipeline started: ${result.token}\n`);

		console.log('📤 Uploading PDF file...');
		console.log('⏳ Processing with LlamaParse + LVM...');
		console.log('   (This may take 30-90 seconds)\n');

		// Read file buffer
		const fileBuffer = fs.readFileSync(pdfFilePath);
		
		// In Node.js, we can't use File API directly, so use send method
		// But let's try sendFiles if available (requires File polyfill)
		try {
			// Try using sendFiles with File-like object
			if (typeof File !== 'undefined') {
				const file = new File([fileBuffer], fileName, { type: 'application/pdf' });
				const uploadResults = await client.sendFiles(
					[{ file, mimetype: 'application/pdf' }],
					result.token,
					1
				);
				
				if (uploadResults && uploadResults[0] && uploadResults[0].result) {
					handleResults(uploadResults[0].result, fileName);
				} else {
					console.log('⚠️  No results from sendFiles, trying send method...');
					const sendResponse = await client.send(result.token, fileBuffer, {
						filename: fileName,
						size: fileStats.size,
						mimetype: 'application/pdf'
					});
					handleResults(sendResponse, fileName);
				}
			} else {
				// Use send method (works in Node.js)
				const sendResponse = await client.send(result.token, fileBuffer, {
					filename: fileName,
					size: fileStats.size,
					mimetype: 'application/pdf'
				});
				handleResults(sendResponse, fileName);
			}
		} catch (sendError) {
			console.error('Error sending file:', sendError.message);
			throw sendError;
		}

		// Cleanup
		console.log('\n🛑 Cleaning up...');
		try {
			if (client.terminate) {
				await client.terminate(result.token);
			}
		} catch (e) {
			// Ignore terminate errors
		}
		await client.disconnect();
		console.log('   ✅ Done\n');

		console.log('✅ TEST COMPLETED!\n');
		process.exit(0);

	} catch (error) {
		console.error('\n❌ TEST FAILED');
		console.error('Error:', error.message || String(error));
		if (error.stack) {
			console.error('\nStack trace:', error.stack);
		}
		
		try {
			if (client.isConnected && client.isConnected()) {
				await client.disconnect();
			}
		} catch (e) {
			// Ignore disconnect errors
		}
		
		process.exit(1);
	}
}

function handleResults(response, fileName) {
	console.log('✅ Processing complete!\n');

	console.log('='.repeat(70));
	console.log('📊 EXTRACTION RESULTS');
	console.log('='.repeat(70));
	console.log();

	// Show text
	if (response.text && Array.isArray(response.text) && response.text.length > 0) {
		console.log('📝 EXTRACTED TEXT:\n');
		console.log('-'.repeat(70));
		
		// Show first 2000 characters
		const fullText = response.text.join('\n\n');
		const preview = fullText.substring(0, 2000);
		console.log(preview);
		
		if (fullText.length > 2000) {
			console.log('\n... (truncated) ...\n');
		}
		
		console.log('-'.repeat(70));
		console.log(`\n📏 Total length: ${fullText.length.toLocaleString()} characters`);
		console.log(`   Text blocks: ${response.text.length}`);

		// Save full text
		const outputFile = `llamaparse_${fileName.replace('.PDF', '').replace('.pdf', ' journals').replace(/\s+/g, '_')}_${Date.now()}.txt`;
		fs.writeFileSync(outputFile, fullText, 'utf-8');
		console.log(`\n💾 Full text saved to: ${outputFile}`);
		console.log();
	} else {
		console.log('⚠️  No text extracted\n');
	}

	// Show tables
	if (response.table && Array.isArray(response.table) && response.table.length > 0) {
		console.log(`📊 Tables found: ${response.table.length}\n`);
	}

	// Show documents
	if (response.documents && Array.isArray(response.documents)) {
		console.log(`📚 Document objects: ${response.documents.length}\n`);
	}

	console.log('='.repeat(70));
	
	// Also show all keys
	console.log('\n📋 Available response keys:', Object.keys(response));
}

// Get file path from command line or use default
const pdfPath = process.argv[2] || '/Users/armin/Downloads/Preliminary Title Report.PDF';
testLlamaParse(pdfPath);
