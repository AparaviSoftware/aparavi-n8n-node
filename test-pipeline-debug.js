#!/usr/bin/env node

const axios = require('axios');

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

// Correct format with source field
const pipelinePayload = {
  errors: [],
  warnings: [],
  pipeline: {
    components: components,
    source: 'webhook_1'  // Explicitly set the source
  }
};

async function testPipeline() {
  console.log('🚀 Testing Aparavi DTC Pipeline with Direct Axios Call...\n');
  console.log('Pipeline Payload:');
  console.log(JSON.stringify(pipelinePayload, null, 2));
  console.log('\n');

  try {
    console.log('📤 Sending PUT request to https://eaas.aparavi.com/task...');
    
    const response = await axios.put('https://eaas.aparavi.com/task', pipelinePayload, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error occurred!');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('\n📋 Response Details:');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('\nHeaders:');
      console.error(JSON.stringify(error.response.headers, null, 2));
      console.error('\nData:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('\n📋 No response received');
      console.error('Request:', error.request);
    } else {
      console.error('\n📋 Error setting up request');
      console.error(error);
    }
    
    process.exit(1);
  }
}

testPipeline();


