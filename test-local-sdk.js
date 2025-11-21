#!/usr/bin/env node

// Test with the local SDK that has the project_id fix
const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const util = require('util');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testLocalSDK() {
  console.log('🧪 Testing with Local Aparavi SDK (should have project_id fix)...\n');

  try {
    const client = new AparaviDTC(apiKey);
    
    // Test Simple OCR - predefined pipeline
    console.log('📤 Testing Simple OCR pipeline...');
    const result = await client.executeSimpleOCR('/Users/armin/Documents/aparavi-dtc-node-sdk/tests/files/test-ocr-1.png');
    
    console.log('\n✅ SUCCESS! Pipeline executed without project_id error!');
    console.log('\nResult:');
    console.log(util.inspect(result, { depth: null, colors: true }));
    
    // Clean up
    await client.tearDown();
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testLocalSDK();


