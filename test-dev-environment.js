#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testDevEnvironment() {
  console.log('🧪 Testing Aparavi DTC Dev Environment...\n');
  console.log('🌐 API URL: https://eaas-dev.aparavi.com\n');

  try {
    const client = new AparaviDTC(apiKey);
    
    console.log('📤 Testing Simple Parse pipeline...');
    const result = await client.executeSimpleParse('/Users/armin/Documents/aparavi-dtc-node-sdk/tests/files/SampleFile_SexualHarassment_101.pdf');
    
    console.log('\n✅ SUCCESS! Dev environment is working!');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
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

testDevEnvironment();
