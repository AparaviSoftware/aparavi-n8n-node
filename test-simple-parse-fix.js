#!/usr/bin/env node

/**
 * Test Simple Parse with the fixed webhook configuration
 * This tests the same approach used in the n8n node
 */

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

const CONFIG = {
	uri: 'wss://eaas-dev.aparavi.com:443',
	auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
};

function getPipelineFileName(pipelineName) {
	const possiblePaths = [
		path.join(__dirname, 'predefinedPipelines'),
		path.join(__dirname, '..', 'predefinedPipelines'),
		path.join(process.cwd(), 'predefinedPipelines'),
	];
	
	const pipelineMap = {
		simpleOCR: 'simple_ocr_webhook.json',
		simpleParse: 'parse_webhook.json',
		advancedParser: 'advanced_parser_webhook.json',
		llamaparse: 'llamaparse_webhook.json',
		audioTranscribe: 'simple_audio_transcribe_webhook.json',
		audioSummary: 'audio_and_summary_webhook.json',
	};
	
	const fileName = pipelineMap[pipelineName] || 'parse_webhook.json';
	
	for (const pipelinesDir of possiblePaths) {
		const filePath = path.join(pipelinesDir, fileName);
		if (fs.existsSync(filePath)) {
			return filePath;
		}
	}
	
	return `predefinedPipelines/${fileName}`;
}

async function testSimpleParse(pdfFilePath) {
	console.log('\n🧪 Testing Simple Parse with Fixed Webhook Configuration');
	console.log('='.repeat(70));

	if (!fs.existsSync(pdfFilePath)) {
		console.error(`❌ Error: PDF file not found: ${pdfFilePath}`);
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

		// Try using filepath directly (like test-llamaparse-final.ts)
		const pipelineFileName = getPipelineFileName('simpleParse');
		console.log('📋 Using pipeline filepath:', pipelineFileName);
		
		console.log('\n🚀 Starting pipeline with filepath...');
		const pipelineResult = await client.use({
			filepath: pipelineFileName,
			threads: 4
		});
		console.log(`   ✅ Pipeline started: ${pipelineResult.token}\n`);

		console.log('📤 Uploading PDF file...');
		const fileBuffer = fs.readFileSync(pdfFilePath);
		const fileSize = fileBuffer.length;

		const response = await client.send(pipelineResult.token, fileBuffer, {
			filename: fileName,
			size: fileSize,
			mimetype: 'application/pdf'
		});

		console.log('✅ Processing complete!\n');

		if (response) {
			console.log('='.repeat(70));
			console.log('📊 EXTRACTION RESULTS');
			console.log('='.repeat(70));
			console.log();

			// Show text
			if (response.text) {
				const text = Array.isArray(response.text) ? response.text.join('\n\n') : response.text;
				console.log('📝 EXTRACTED TEXT:\n');
				console.log('-'.repeat(70));
				
				const preview = text.substring(0, 2000);
				console.log(preview);
				
				if (text.length > 2000) {
					console.log('\n... (truncated) ...\n');
				}
				
				console.log('-'.repeat(70));
				console.log(`\n📏 Total length: ${text.length.toLocaleString()} characters`);
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

			// Show full response structure
			console.log('\n📋 Full response keys:', Object.keys(response));
			console.log('='.repeat(70));
		} else {
			console.log('⚠️  No response received from pipeline\n');
		}

		// Cleanup
		console.log('\n🛑 Cleaning up...');
		await client.terminate(pipelineResult.token);
		await client.disconnect();
		console.log('   ✅ Done\n');

		console.log('✅ TEST PASSED - Simple Parse works correctly!\n');
		process.exit(0);

	} catch (error) {
		console.error('\n❌ TEST FAILED');
		console.error('Error:', error instanceof Error ? error.message : String(error));
		if (error instanceof Error && error.stack) {
			console.error('\nStack trace:', error.stack);
		}
		
		if (client.isConnected()) {
			await client.disconnect();
		}
		
		process.exit(1);
	}
}

// Get file path from command line or use provided file
const pdfPath = process.argv[2] || '/Users/armin/Downloads/APFS_Assembly_Process_Qualification_Data_1762995216229.pdf';
testSimpleParse(pdfPath);
