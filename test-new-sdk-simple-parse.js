#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

// Load predefined pipeline
function loadPredefinedPipeline(pipelineName) {
  const possiblePaths = [
    path.join(__dirname, 'predefinedPipelines'),
    path.join(__dirname, '..', 'predefinedPipelines'),
    path.join(process.cwd(), 'predefinedPipelines'),
  ];
  
  const pipelineMap = {
    simpleParse: 'simple_parser.json',
  };

  const fileName = pipelineMap[pipelineName];
  if (!fileName) {
    throw new Error(`Predefined pipeline not found for operation: ${pipelineName}`);
  }

  for (const pipelinesDir of possiblePaths) {
    const filePath = path.join(pipelinesDir, fileName);
    if (fs.existsSync(filePath)) {
      const pipelineJson = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(pipelineJson);
    }
  }

  throw new Error(`Pipeline file not found: ${fileName}`);
}

async function testNewSDKSimpleParse() {
  console.log('🧪 Testing New SDK Simple Parse...\n');

  try {
    const client = new AparaviClient({
      auth: apiKey,
      uri: 'wss://eaas-dev.aparavi.com:443'
    });

    console.log('📡 Connecting to Aparavi...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    console.log('📄 Test file:', testFile);
    console.log('📊 File size:', fs.statSync(testFile).size, 'bytes');

    // Load predefined pipeline
    console.log('📋 Loading predefined pipeline...');
    const pipelineConfig = loadPredefinedPipeline('simpleParse');
    
    // Use unique project ID to avoid conflicts
    const uniqueProjectId = 'test-' + Date.now();
    pipelineConfig.pipeline.project_id = uniqueProjectId;
    console.log('✅ Pipeline loaded with unique project ID:', uniqueProjectId);

    // Start pipeline
    console.log('🚀 Starting pipeline...');
    const pipelineResult = await client.use({
      pipeline: pipelineConfig
    });
    console.log('✅ Pipeline started with token:', pipelineResult.token);

    // Send file
    console.log('📤 Sending file to pipeline...');
    const fileBuffer = fs.readFileSync(testFile);
    const result = await client.send(pipelineResult.token, fileBuffer);

    console.log('\n✅ Simple Parse Result:');
    console.log(JSON.stringify(result, null, 2));

    // Disconnect
    await client.disconnect();
    console.log('\n✅ Disconnected successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testNewSDKSimpleParse();
