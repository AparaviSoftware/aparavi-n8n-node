#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

// Test the llamaparse pipeline directly
async function testLlamaParsePipeline() {
  console.log('🧪 Testing LlamaParse Pipeline...\n');

  try {
    const client = new AparaviClient({
      auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
      uri: 'wss://eaas-dev.aparavi.com:443'
    });

    await client.connect();
    console.log('✅ Connected to Aparavi');

    // Test file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    console.log('📄 Test file:', testFile);
    console.log('📊 File size:', fs.statSync(testFile).size, 'bytes');

    // Start llamaparse pipeline
    console.log('\n🚀 Starting LlamaParse Pipeline...');
    const pipelineResult = await client.use({
      filepath: 'predefinedPipelines/llamaparse_webhook.json',
      threads: 4
    });
    console.log('✅ Pipeline started with token:', pipelineResult.token);

    // Send file to pipeline with metadata
    console.log('📤 Sending file to pipeline...');
    const fileBuffer = fs.readFileSync(testFile);
    const fileName = path.basename(testFile);
    const fileSize = fileBuffer.length;
    
    const sendResponse = await client.send(pipelineResult.token, fileBuffer, {
      filename: fileName,
      size: fileSize,
      mimetype: 'application/pdf'
    });
    console.log('📤 File sent, response received');

    // Check if we got results
    if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data || sendResponse.documents)) {
      console.log('✅ LlamaParse - Results received!');
      if (sendResponse.text && sendResponse.text.length > 0) {
        console.log('📄 Text length:', sendResponse.text[0].length, 'characters');
        console.log('📄 First 500 chars:', sendResponse.text[0].substring(0, 500) + '...');
      }
      if (sendResponse.documents && sendResponse.documents.length > 0) {
        console.log('📋 Documents found:', sendResponse.documents.length);
      }
      if (sendResponse.tables && sendResponse.tables.length > 0) {
        console.log('📊 Tables found:', sendResponse.tables.length);
      }
      if (sendResponse.images && sendResponse.images.length > 0) {
        console.log('🖼️ Images found:', sendResponse.images.length);
      }
      console.log('📋 Available keys:', Object.keys(sendResponse));
    } else {
      console.log('⚠️ LlamaParse - No results in response');
      console.log('📋 Response keys:', Object.keys(sendResponse || {}));
    }

    await client.disconnect();
    console.log('✅ Disconnected from Aparavi');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testLlamaParsePipeline();






