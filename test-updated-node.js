#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

// Simulate the n8n node's executePipelineWithEvents function
async function executePipelineWithEvents(client, pipelineName, filePath) {
	await client.connect();
	console.log('✅ Connected to Aparavi');
	
	// Use filepath approach (works better than pipeline object)
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
	} else if (fileName.toLowerCase().endsWith('.wav')) {
		mimetype = 'audio/wav';
	} else if (fileName.toLowerCase().endsWith('.mp3')) {
		mimetype = 'audio/mpeg';
	} else if (fileName.toLowerCase().endsWith('.png')) {
		mimetype = 'image/png';
	} else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
		mimetype = 'image/jpeg';
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

// Helper function to get pipeline file name
function getPipelineFileName(pipelineName) {
	const pipelineMap = {
		simpleOCR: 'predefinedPipelines/simple_ocr.json',
		simpleParse: 'predefinedPipelines/parse_webhook.json', // Use working webhook version
		advancedParser: 'predefinedPipelines/advanced_parser.json',
		audioTranscribe: 'predefinedPipelines/simple_audio_transcribe.json',
		audioSummary: 'predefinedPipelines/audio_and_summary.json',
	};
	
	return pipelineMap[pipelineName] || 'predefinedPipelines/parse_webhook.json';
}

async function testUpdatedNode() {
  console.log('🧪 Testing Updated Node Logic...\n');

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

    // Test simpleParse
    console.log('\n🔍 Testing Simple Parse...');
    const result = await executePipelineWithEvents(client, 'simpleParse', testFile);
    
    console.log('\n✅ Final Result:');
    console.log('Text extracted:', result.text ? 'Yes' : 'No');
    if (result.text && result.text.length > 0) {
      console.log('First 200 chars:', result.text[0].substring(0, 200) + '...');
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

testUpdatedNode();






