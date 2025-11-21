#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const fs = require('fs');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testFinalSimpleParse() {
  console.log('🧪 Final Test: Simple Parse with SDK built-in method...\n');
  
  const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
  
  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }
  
  console.log(`📄 Test file: ${testFile}`);
  console.log(`📊 File size: ${fs.statSync(testFile).size} bytes\n`);
  
  try {
    const client = new AparaviDTC(apiKey);
    
    console.log('🔧 Testing executeSimpleParse (SDK built-in method)...');
    const result = await client.executeSimpleParse(testFile);
    
    console.log('\n✅ SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Cleanup
    await client.tearDown();
    console.log('\n✅ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
}

testFinalSimpleParse().catch(console.error);
