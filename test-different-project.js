#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testDifferentProject() {
  console.log('🧪 Testing with different project_id...\n');
  
  try {
    // Load the simple parser pipeline
    const pipelineFile = path.join(__dirname, 'predefinedPipelines', 'simple_parser.json');
    const pipelineConfig = JSON.parse(fs.readFileSync(pipelineFile, 'utf8'));
    
    // Generate a unique project_id
    const uniqueProjectId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🆔 Using unique project_id: ${uniqueProjectId}`);
    
    // Update the project_id
    pipelineConfig.pipeline.project_id = uniqueProjectId;
    
    const client = new AparaviDTC(apiKey);
    
    console.log('🚀 Starting pipeline with unique project_id...');
    await client.executePipelineWorkflow(pipelineConfig);
    console.log('✅ Pipeline started! Token:', client.token);
    
    // Wait for pipeline to initialize
    console.log('\n⏳ Waiting 2 seconds for pipeline to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to send file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    console.log('\n📤 Sending file to pipeline...');
    
    let result;
    if (typeof client.sendFile === 'function') {
      console.log('📤 Using sendFile method...');
      result = await client.sendFile(testFile);
    } else if (client.token && typeof client.send === 'function') {
      console.log('📤 Using send method with token...');
      const fileBuffer = fs.readFileSync(testFile);
      result = await client.send(client.token, fileBuffer);
    } else {
      throw new Error('No suitable method found to send file to pipeline');
    }
    
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
    if (error.cause) {
      console.error('\nCause:', JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause), 2));
    }
    process.exit(1);
  }
}

testDifferentProject().catch(console.error);





