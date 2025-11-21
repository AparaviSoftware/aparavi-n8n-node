#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');

// Your API key
const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

// Test with the working predefined pipeline first
async function testPredefinedPipeline() {
  console.log('🧪 Test 1: Try predefined Simple OCR pipeline...\n');
  
  try {
    const client = new AparaviDTC(apiKey);
    
    // Use the predefined simple OCR pipeline
    const result = await client.executeSimpleOCR('/tmp/test.png');
    
    console.log('✅ Predefined pipeline worked!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    await client.tearDown();
    
  } catch (error) {
    console.error('❌ Predefined pipeline failed:', error.message);
  }
}

// Test validating the pipeline
async function testValidation() {
  console.log('\n🧪 Test 2: Validate custom pipeline...\n');
  
  const pipelineConfig = {
    errors: [],
    pipeline: {
      components: [
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
          input: [ { from: 'webhook_1', lane: 'image' } ],
          provider: 'ocr',
          ui: {
            data: { class: 'image', type: 'default' },
            edges: [ { source: 'webhook_1', target: 'ocr_1' } ],
            formDataValid: true,
            measured: { height: 160, width: 140 },
            position: { x: 440, y: 220 }
          }
        },
        {
          config: { lanes: [] },
          id: 'response_1',
          input: [ { from: 'ocr_1', lane: 'result' } ],
          provider: 'response',
          ui: {
            data: { class: 'default', type: 'default' },
            edges: [ { source: 'ocr_1', target: 'response_1' } ],
            formDataValid: true,
            measured: { height: 116, width: 140 },
            position: { x: 660, y: 243 }
          }
        }
      ],
      source: 'webhook_1'
    }
  };

  try {
    const client = new AparaviDTC(apiKey);
    
    console.log('Validating pipeline...');
    const result = await client.validate(pipelineConfig);
    
    console.log('✅ Validation result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function main() {
  await testPredefinedPipeline();
  await testValidation();
}

main();


