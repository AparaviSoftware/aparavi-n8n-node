#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testSimpleParseFresh() {
  console.log('🧪 Testing Simple Parse with fresh client instance...\n');
  
  const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
  
  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }
  
  console.log(`📄 Test file: ${testFile}`);
  console.log(`📊 File size: ${fs.statSync(testFile).size} bytes\n`);
  
  try {
    // Create a completely fresh client instance
    const client = new AparaviDTC(apiKey);
    
    console.log('🔧 Testing SDK built-in executeSimpleParse method...');
    const result = await client.executeSimpleParse(testFile);
    
    console.log('\n✅ SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Cleanup
    if (typeof client.tearDown === 'function') {
      await client.tearDown();
      console.log('\n✅ Cleanup complete');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    if (error.cause) {
      console.error('\nCause:', JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause), 2));
    }
    process.exit(1);
  }
}

testSimpleParseFresh().catch(console.error);






