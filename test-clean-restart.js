#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testCleanRestart() {
  console.log('🧪 Testing with clean restart...\n');
  
  try {
    // First, try to clean up any existing pipelines
    console.log('🧹 Attempting to clean up existing pipelines...');
    const cleanupClient = new AparaviDTC(apiKey);
    
    try {
      await cleanupClient.tearDownPipeline();
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup failed (this might be normal):', cleanupError.message);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now try with a fresh client
    console.log('\n🔄 Creating fresh client and testing...');
    const client = new AparaviDTC(apiKey);
    
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    
    console.log('🔧 Testing executeSimpleParse...');
    const result = await client.executeSimpleParse(testFile);
    
    console.log('\n✅ SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Cleanup
    await client.tearDown();
    console.log('\n✅ Final cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
}

testCleanRestart().catch(console.error);





