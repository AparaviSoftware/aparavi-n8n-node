#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

// Test all pipeline types
async function testAllPipelines() {
  console.log('🧪 Testing All Updated Pipelines...\n');

  const client = new AparaviClient({
    auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
    uri: 'wss://eaas-dev.aparavi.com:443'
  });

  try {
    await client.connect();
    console.log('✅ Connected to Aparavi\n');

    // Test file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    const fileBuffer = fs.readFileSync(testFile);
    const fileName = path.basename(testFile);
    const fileSize = fileBuffer.length;

    // Test each pipeline type
    const pipelines = [
      { name: 'Simple Parse', file: 'predefinedPipelines/parse_webhook.json' },
      { name: 'Simple OCR', file: 'predefinedPipelines/simple_ocr_webhook.json' },
      { name: 'Advanced Parser', file: 'predefinedPipelines/advanced_parser_webhook.json' },
      { name: 'Audio Transcribe', file: 'predefinedPipelines/simple_audio_transcribe_webhook.json' },
      { name: 'Audio Summary', file: 'predefinedPipelines/audio_and_summary_webhook.json' }
    ];

    for (const pipeline of pipelines) {
      console.log(`🔍 Testing ${pipeline.name}...`);
      
      try {
        // Start pipeline
        const result = await client.use({
          filepath: pipeline.file,
          threads: 4
        });
        console.log(`   ✅ Pipeline started: ${result.token.substring(0, 20)}...`);

        // Send file
        const sendResponse = await client.send(result.token, fileBuffer, {
          filename: fileName,
          size: fileSize,
          mimetype: 'application/pdf'
        });

        // Check if we got results
        if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data)) {
          console.log(`   ✅ ${pipeline.name} - Results received!`);
          if (sendResponse.text && sendResponse.text.length > 0) {
            console.log(`   📄 Text length: ${sendResponse.text[0].length} characters`);
          }
        } else {
          console.log(`   ⚠️ ${pipeline.name} - No results in response`);
        }

        // Clean up
        await client.disconnect();
        await client.connect();
        console.log(`   ✅ ${pipeline.name} - Test completed\n`);

      } catch (error) {
        console.log(`   ❌ ${pipeline.name} - Error: ${error.message}\n`);
      }
    }

    console.log('🎉 All pipeline tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
    console.log('👋 Disconnected');
  }
}

testAllPipelines();






