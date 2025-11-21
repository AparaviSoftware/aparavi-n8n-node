#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testPredefinedPipelines() {
  console.log('🧪 Testing Predefined Pipelines with Node SDK...\n');
  
  const pipelinesDir = path.join(__dirname, 'predefinedPipelines');
  const pipelineFiles = [
    { name: 'simple_ocr', file: 'simple_ocr.json' },
    { name: 'simple_parser', file: 'simple_parser.json' },
    { name: 'advanced_parser', file: 'advanced_parser.json' },
    { name: 'simple_audio_transcribe', file: 'simple_audio_transcribe.json' },
    { name: 'audio_and_summary', file: 'audio_and_summary.json' }
  ];

  for (const { name, file } of pipelineFiles) {
    console.log(`\n📄 Testing ${name}...`);
    const filePath = path.join(pipelinesDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`   ❌ Pipeline file not found: ${filePath}`);
      continue;
    }
    
    try {
      const pipelineJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   ✅ Loaded pipeline from ${file}`);
      
      // Validate pipeline structure
      if (!pipelineJson.pipeline) {
        console.error(`   ❌ Invalid pipeline structure - missing 'pipeline' key`);
        continue;
      }
      
      if (!pipelineJson.pipeline.components || !Array.isArray(pipelineJson.pipeline.components)) {
        console.error(`   ❌ Invalid pipeline structure - missing or invalid 'components' array`);
        continue;
      }
      
      console.log(`   📋 Pipeline has ${pipelineJson.pipeline.components.length} components`);
      console.log(`   📋 Source: ${pipelineJson.pipeline.source || 'not specified'}`);
      
      // Check for required fields
      const hasProjectId = pipelineJson.pipeline.project_id;
      const hasSource = pipelineJson.pipeline.source;
      
      console.log(`   📋 Project ID: ${hasProjectId ? '✅' : '❌'}`);
      console.log(`   📋 Source: ${hasSource ? '✅' : '❌'}`);
      
      if (!hasProjectId) {
        console.error(`   ❌ Pipeline missing project_id - this is required!`);
        continue;
      }
      
      if (!hasSource) {
        console.error(`   ❌ Pipeline missing source - this is required!`);
        continue;
      }
      
      // Test with SDK
      const client = new AparaviDTC(apiKey);
      
      console.log(`   🔧 Testing with executePipelineWorkflow...`);
      try {
        const result = await client.executePipelineWorkflow(pipelineJson);
        console.log(`   ✅ Pipeline executed successfully!`);
        console.log(`   📋 Result:`, JSON.stringify(result, null, 2));
        
        if (typeof client.tearDown === 'function') {
          await client.tearDown();
          console.log(`   🧹 Cleanup completed`);
        }
      } catch (error) {
        console.error(`   ❌ Pipeline execution failed:`, error.message);
        if (error.response) {
          console.error(`   📋 Response status:`, error.response.status);
          console.error(`   📋 Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        if (error.cause) {
          console.error(`   📋 Cause:`, JSON.stringify(error.cause, null, 2));
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${name}:`, error.message);
    }
  }
}

testPredefinedPipelines().catch(console.error);





