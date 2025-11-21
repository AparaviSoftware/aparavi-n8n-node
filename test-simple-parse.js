#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testSimpleParse() {
  console.log('🧪 Testing Simple Parse with predefined pipeline...\n');
  
  const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
  
  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }
  
  console.log(`📄 Test file: ${testFile}`);
  console.log(`📊 File size: ${fs.statSync(testFile).size} bytes\n`);
  
  try {
    const client = new AparaviDTC(apiKey);
    
    // Load predefined pipeline
    const pipelineFile = path.join(__dirname, 'predefinedPipelines', 'simple_parser.json');
    if (!fs.existsSync(pipelineFile)) {
      console.error(`❌ Pipeline file not found: ${pipelineFile}`);
      process.exit(1);
    }
    
    const pipelineConfig = JSON.parse(fs.readFileSync(pipelineFile, 'utf8'));
    console.log('📋 Loaded predefined pipeline\n');
    
    // Execute pipeline
    console.log('🚀 Starting pipeline...');
    await client.executePipelineWorkflow(pipelineConfig);
    console.log('✅ Pipeline started! Token:', client.token);
    
    // Wait for pipeline to initialize
    console.log('\n⏳ Waiting 2 seconds for pipeline to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to send file
    console.log('\n📤 Sending file to pipeline...');
    
    // Check available methods
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(m => !m.startsWith('_')));
    console.log('Client properties:', Object.keys(client));
    
    // Try different methods
    let result;
    if (typeof client.sendFile === 'function') {
      console.log('📤 Using sendFile method...');
      result = await client.sendFile(testFile);
    } else if (client.token && typeof client.send === 'function') {
      console.log('📤 Using send method with token...');
      const fileBuffer = fs.readFileSync(testFile);
      result = await client.send(client.token, fileBuffer);
    } else if (typeof client.executeSimpleParse === 'function') {
      console.log('📤 Using executeSimpleParse method...');
      result = await client.executeSimpleParse(testFile);
    } else {
      throw new Error('No suitable method found to send file to pipeline');
    }
    
    console.log('\n✅ Result:');
    console.log(JSON.stringify(result, null, 2));
    
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

testSimpleParse();

