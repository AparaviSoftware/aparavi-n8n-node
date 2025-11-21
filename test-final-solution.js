#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

// Simulate the final executePipelineWithEvents function with path resolution
async function executePipelineWithEvents(client, pipelineName, filePath) {
	await client.connect();
	console.log('✅ Connected to Aparavi');
	
	// Use filepath approach with proper path resolution
	const pipelineFileName = getPipelineFileName(pipelineName);
	console.log('🚀 Starting pipeline from file:', pipelineFileName);
	
	const pipelineResult = await client.use({
		filepath: pipelineFileName,
		threads: 4
	});
	console.log('✅ Pipeline started with token:', pipelineResult.token);

	// Send file to pipeline with metadata
	console.log('📤 Sending file to pipeline...');
	const fileBuffer = fs.readFileSync(filePath);
	const fileName = path.basename(filePath);
	const fileSize = fileBuffer.length;
	
	// Determine mimetype based on file extension
	let mimetype = 'application/octet-stream';
	if (fileName.toLowerCase().endsWith('.pdf')) {
		mimetype = 'application/pdf';
	}
	
	const sendResponse = await client.send(pipelineResult.token, fileBuffer, {
		filename: fileName,
		size: fileSize,
		mimetype: mimetype
	});
	console.log('📤 File sent, response:', JSON.stringify(sendResponse, null, 2));

	// The response should contain the parsed results directly
	if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data)) {
		console.log('✅ Parsed results received in response!');
		await client.disconnect();
		console.log('✅ Disconnected from Aparavi');
		return sendResponse;
	}
	
	// If no results in immediate response, wait a bit and check status
	console.log('⏳ Waiting for processing to complete...');
	await new Promise(resolve => setTimeout(resolve, 3000));
	
	try {
		const status = await client.getTaskStatus(pipelineResult.token);
		console.log('📊 Final status:', JSON.stringify(status, null, 2));
	} catch (error) {
		console.log('⚠️ Status check failed:', error.message);
	}
	
	await client.disconnect();
	console.log('✅ Disconnected from Aparavi');
	
	return sendResponse;
}

// Helper function to get pipeline file name with path resolution
function getPipelineFileName(pipelineName) {
	// Try multiple possible paths (works in both source and built package)
	const possiblePaths = [
		path.join(__dirname, '..', '..', 'predefinedPipelines'), // Source
		path.join(__dirname, '..', '..', '..', 'predefinedPipelines'), // Built (from dist/nodes/AparaviUnified)
		path.join(process.cwd(), 'predefinedPipelines'), // Current working directory
		path.join(__dirname, 'predefinedPipelines'), // Same directory
	];
	
	const pipelineMap = {
		simpleOCR: 'simple_ocr_webhook.json',
		simpleParse: 'parse_webhook.json',
		advancedParser: 'advanced_parser_webhook.json',
		audioTranscribe: 'simple_audio_transcribe_webhook.json',
		audioSummary: 'audio_and_summary_webhook.json',
	};
	
	const fileName = pipelineMap[pipelineName] || 'parse_webhook.json';
	
	// Try each possible path
	for (const pipelinesDir of possiblePaths) {
		const filePath = path.join(pipelinesDir, fileName);
		if (fs.existsSync(filePath)) {
			return filePath;
		}
	}
	
	// If not found, return the relative path as fallback
	return `predefinedPipelines/${fileName}`;
}

async function testFinalSolution() {
  console.log('🧪 Testing Final Solution with Path Resolution...\n');

  try {
    const client = new AparaviClient({
      auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
      uri: 'wss://eaas-dev.aparavi.com:443'
    });

    // Test file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    console.log('📄 Test file:', testFile);
    console.log('📊 File size:', fs.statSync(testFile).size, 'bytes');

    // Test simpleParse with the final solution
    console.log('\n🔍 Testing Simple Parse with final solution...');
    const result = await executePipelineWithEvents(client, 'simpleParse', testFile);
    
    console.log('\n✅ Final Result:');
    console.log('Text extracted:', result.text ? 'Yes' : 'No');
    if (result.text && result.text.length > 0) {
      console.log('First 200 chars:', result.text[0].substring(0, 200) + '...');
      console.log('Total text length:', result.text[0].length, 'characters');
    }
    console.log('Full result keys:', Object.keys(result));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testFinalSolution();





