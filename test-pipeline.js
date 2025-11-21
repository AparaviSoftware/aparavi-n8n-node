#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');

// Your API key
const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

// Your components (the wrappedJSON you provided)
const components = [
  {
    config: { hideForm: true, mode: 'Source', type: 'webhook' },
    id: 'webhook_1',
    provider: 'webhook',
    ui: {
      data: { class: 'source', type: 'default' },
      formDataValid: true,
      measured: { height: 116, width: 140 },
      position: { x: 220, y: 243 }
    }
  },
  {
    config: { 
      default: {
        doctr: {
          det_arch: 'db_resnet50',
          reco_arch: 'crnn_vgg16_bn'
        },
        language: 'en',
        table: 'Doctr'
      }, 
      multilingual: {
        doctr: {
          det_arch: 'db_resnet50',
          reco_arch: 'crnn_vgg16_bn'
        },
        table: 'Doctr'
      }, 
      profile: 'default' 
    },
    id: 'ocr_1',
    input: [ { id: 'webhook_1', index: 0 } ],
    provider: 'ocr',
    ui: {
      data: { class: 'default', type: 'default' },
      edges: [ { source: 'webhook_1', target: 'ocr_1' } ],
      formDataValid: true,
      measured: { height: 160, width: 140 },
      position: { x: 440, y: 220 }
    }
  },
  {
    config: { lanes: [] },
    id: 'response_1',
    input: [ { id: 'ocr_1', index: 0 } ],
    provider: 'response',
    ui: {
      data: { class: 'default', type: 'default' },
      edges: [ { source: 'ocr_1', target: 'response_1' } ],
      formDataValid: true,
      measured: { height: 116, width: 140 },
      position: { x: 660, y: 243 }
    }
  }
];

// Correct format: wrap components in the proper structure
const pipelineConfig = {
  errors: [],
  pipeline: {
    components: components
  }
};

async function testPipeline() {
  console.log('🚀 Testing Aparavi DTC Pipeline...\n');
  console.log('Pipeline Config:');
  console.log(JSON.stringify(pipelineConfig, null, 2));
  console.log('\n');

  try {
    const client = new AparaviDTC(apiKey);
    
    console.log('📤 Executing pipeline...');
    const result = await client.executePipelineWorkflow(pipelineConfig);
    
    console.log('\n✅ Pipeline execution result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Wait for pipeline to be ready
    console.log('\n⏳ Waiting 2 seconds for pipeline to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now you can send data to it
    console.log('\n📨 Ready to send data to webhook!');
    console.log('Token:', client.token);
    console.log('Type:', client.type);
    
    // Cleanup
    await client.tearDown();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📋 Full error details:');
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Try to get the actual axios error
    if (error.cause) {
      console.error('\n📋 Cause:');
      console.error(JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause), 2));
      
      if (error.cause.response) {
        console.error('\n📋 API Response:');
        console.error('Status:', error.cause.response.status);
        console.error('Headers:', error.cause.response.headers);
        console.error('Data:', JSON.stringify(error.cause.response.data, null, 2));
      }
    }
    process.exit(1);
  }
}

testPipeline();

