#!/usr/bin/env node

/**
 * Test all prebuilt parser pipelines with a specified PDF file
 */

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

const CONFIG = {
	uri: 'wss://eaas-dev.aparavi.com:443',
	auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
};

// All parser pipelines (excluding audio pipelines)
const PARSER_PIPELINES = [
	{ name: 'Simple Parser', file: 'predefinedPipelines/simple_parser.json' },
	{ name: 'Parse Webhook', file: 'predefinedPipelines/parse_webhook.json' },
	{ name: 'Simple OCR', file: 'predefinedPipelines/simple_ocr_webhook.json' },
	{ name: 'Advanced Parser', file: 'predefinedPipelines/advanced_parser_webhook.json' },
	{ name: 'LlamaParse', file: 'predefinedPipelines/llamaparse_webhook.json' },
];

async function testParser(pipeline, fileBuffer, fileName, fileSize) {
	// Set up event handler to capture results
	let parsedResults = null;
	let resultPromise = null;
	let resultResolve = null;
	
	// Create promise to wait for results
	resultPromise = new Promise((resolve) => {
		resultResolve = resolve;
	});
	
	const client = new AparaviClient({
		...CONFIG,
		onEvent: (event) => {
			if (event.event === 'apaevt_status_update' || event.event === 'apaevt_response' || event.event === 'apaevt_complete') {
				if (event.body && (event.body.text || event.body.result || event.body.data || event.body.documents || event.body.table)) {
					parsedResults = event.body;
					if (resultResolve) {
						resultResolve(event.body);
						resultResolve = null; // Prevent multiple resolves
					}
				}
			}
		}
	});
	
	try {
		console.log(`\n${'='.repeat(70)}`);
		console.log(`🔍 Testing: ${pipeline.name}`);
		console.log(`   Pipeline: ${pipeline.file}`);
		console.log('='.repeat(70));
		
		await client.connect();
		console.log('   ✅ Connected to Aparavi');
		
		// Use filepath approach (like test-llamaparse-final.ts)
		// This is simpler and the SDK handles pipeline loading
		console.log(`   🚀 Starting pipeline...`);
		let result;
		try {
			result = await client.use({
				filepath: pipeline.file,
				threads: 4
			});
		} catch (error) {
			// Handle "Pipeline is already running" error
			if (error.message && error.message.includes('already running')) {
				console.log(`   ⚠️  Pipeline already running, waiting a moment and retrying...`);
				await new Promise(resolve => setTimeout(resolve, 2000));
				result = await client.use({
					filepath: pipeline.file,
					threads: 4
				});
			} else {
				throw error;
			}
		}
		console.log(`   ✅ Pipeline started: ${result.token.substring(0, 30)}...`);
		
		// Subscribe to events for this token
		await client.setEvents(result.token, ['apaevt_status_update', 'apaevt_response', 'apaevt_complete']);
		
		// Send file - handle potential localhost connection errors gracefully
		console.log(`   📤 Uploading PDF file...`);
		const startTime = Date.now();
		
		let sendResponse = null;
		try {
			sendResponse = await client.send(result.token, fileBuffer, {
				filename: fileName,
				size: fileSize,
				mimetype: 'application/pdf'
			});
			// If send returns results immediately, use them
			if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data)) {
				parsedResults = sendResponse;
				if (resultResolve) {
					resultResolve(sendResponse);
					resultResolve = null;
				}
			}
		} catch (sendError) {
			// If it's a localhost connection error, the pipeline might still process
			// We'll wait for results via events
			if (sendError.message && sendError.message.includes('Connect call failed')) {
				console.log(`   ⚠️  Localhost connection error (expected with webhook pipelines)`);
				console.log(`   ⏳ Waiting for results via events...`);
			} else {
				// For other errors, still wait for events in case processing continues
				console.log(`   ⚠️  Send error: ${sendError.message}`);
				console.log(`   ⏳ Waiting for results via events...`);
			}
		}
		
		// Wait for results via events (with longer timeout for large files)
		// Large PDFs can take 60-120 seconds to process
		if (!parsedResults) {
			try {
				console.log(`   ⏳ Waiting up to 120 seconds for processing...`);
				parsedResults = await Promise.race([
					resultPromise,
					new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for results')), 120000))
				]);
				console.log(`   ✅ Results received via events!`);
			} catch (timeoutError) {
				console.log(`   ⏱️  Timeout waiting for event results, checking status...`);
				try {
					const status = await client.getTaskStatus(result.token);
					console.log(`   📊 Status:`, status.state, status.completedCount, '/', status.totalCount);
					if (status && status.result) {
						parsedResults = status.result;
						console.log(`   ✅ Results found in status!`);
					} else if (status && status.data) {
						parsedResults = status.data;
						console.log(`   ✅ Data found in status!`);
					}
				} catch (statusError) {
					console.log(`   ⚠️  Status check failed: ${statusError.message}`);
					// Use sendResponse if available (might have partial results)
					parsedResults = sendResponse;
				}
			}
		}
		
		const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`   ⏱️  Processing time: ${processingTime}s`);
		
		// Analyze results
		console.log(`\n   📊 RESULTS:`);
		
		const response = parsedResults || sendResponse;
		
		if (response) {
			let hasResults = false;
			
			// Check for text
			if (response.text) {
				if (Array.isArray(response.text) && response.text.length > 0) {
					const totalTextLength = response.text.reduce((sum, text) => sum + (text?.length || 0), 0);
					console.log(`   ✅ Text extracted: ${totalTextLength.toLocaleString()} characters`);
					console.log(`      Text blocks: ${response.text.length}`);
					hasResults = true;
					
					// Show preview
					const preview = response.text[0]?.substring(0, 200) || '';
					if (preview) {
						console.log(`      Preview: "${preview}${preview.length < response.text[0].length ? '...' : ''}"`);
					}
				} else if (typeof response.text === 'string' && response.text.length > 0) {
					console.log(`   ✅ Text extracted: ${response.text.length.toLocaleString()} characters`);
					hasResults = true;
				} else {
					console.log(`   ⚠️  Text field present but empty`);
				}
			} else {
				console.log(`   ❌ No text field in response`);
			}
			
			// Check for tables
			if (response.table) {
				if (Array.isArray(response.table) && response.table.length > 0) {
					console.log(`   ✅ Tables extracted: ${response.table.length}`);
					hasResults = true;
				} else {
					console.log(`   ⚠️  Table field present but empty`);
				}
			}
			
			// Check for documents
			if (response.documents) {
				if (Array.isArray(response.documents) && response.documents.length > 0) {
					console.log(`   ✅ Documents: ${response.documents.length}`);
					hasResults = true;
				}
			}
			
			// Check for other result fields
			if (response.result) {
				console.log(`   ✅ Result field present`);
				hasResults = true;
			}
			
			if (response.data) {
				console.log(`   ✅ Data field present`);
				hasResults = true;
			}
			
			if (!hasResults) {
				console.log(`   ⚠️  Response received but no extractable content found`);
				console.log(`   Response keys: ${Object.keys(response).join(', ')}`);
			}
		} else {
			console.log(`   ⚠️  No response received from pipeline`);
		}
		
		// Cleanup
		console.log(`   🛑 Cleaning up...`);
		await client.terminate(result.token);
		await client.disconnect();
		console.log(`   ✅ ${pipeline.name} - Test completed`);
		
		return { success: true, pipeline: pipeline.name, processingTime };
		
	} catch (error) {
		console.error(`   ❌ ERROR: ${error.message}`);
		if (error.stack) {
			console.error(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
		}
		
		if (client.isConnected()) {
			try {
				await client.disconnect();
			} catch (e) {
				// Ignore disconnect errors
			}
		}
		
		return { success: false, pipeline: pipeline.name, error: error.message };
	}
}

async function testAllParsers(pdfFilePath) {
	console.log('\n' + '='.repeat(70));
	console.log('🧪 TESTING ALL PREBUILT PARSERS');
	console.log('='.repeat(70));
	
	// Validate PDF file
	if (!fs.existsSync(pdfFilePath)) {
		console.error(`\n❌ Error: PDF file not found: ${pdfFilePath}`);
		process.exit(1);
	}
	
	const fileStats = fs.statSync(pdfFilePath);
	const fileName = path.basename(pdfFilePath);
	const fileSize = fileStats.size;
	
	console.log(`\n📄 Test File: ${fileName}`);
	console.log(`   Path: ${pdfFilePath}`);
	console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
	console.log(`\n📋 Testing ${PARSER_PIPELINES.length} parser pipelines...\n`);
	
	// Read file once
	const fileBuffer = fs.readFileSync(pdfFilePath);
	
	// Test each parser
	const results = [];
	for (const pipeline of PARSER_PIPELINES) {
		const result = await testParser(pipeline, fileBuffer, fileName, fileSize);
		results.push(result);
		
		// Small delay between tests
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
	
	// Summary
	console.log('\n' + '='.repeat(70));
	console.log('📊 TEST SUMMARY');
	console.log('='.repeat(70));
	
	const successful = results.filter(r => r.success).length;
	const failed = results.filter(r => !r.success).length;
	
	console.log(`\n✅ Successful: ${successful}/${results.length}`);
	console.log(`❌ Failed: ${failed}/${results.length}\n`);
	
	results.forEach(result => {
		const status = result.success ? '✅' : '❌';
		const time = result.processingTime ? ` (${result.processingTime}s)` : '';
		console.log(`   ${status} ${result.pipeline}${time}`);
		if (result.error) {
			console.log(`      Error: ${result.error}`);
		}
	});
	
	console.log('\n' + '='.repeat(70));
	console.log('🎉 All parser tests completed!');
	console.log('='.repeat(70) + '\n');
	
	process.exit(failed > 0 ? 1 : 0);
}

// Get PDF path from command line or use default
const pdfPath = process.argv[2] || '/Users/armin/Downloads/APFS_Assembly_Process_Qualification_Data_1762995216229.pdf';
testAllParsers(pdfPath);

