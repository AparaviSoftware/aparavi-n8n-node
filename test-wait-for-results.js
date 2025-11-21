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

async function testWaitForResults() {
  console.log('🧪 Testing Wait for Parsed Results...\n');

  let parsedResults = null;
  let resultPromise = null;
  let resultResolve = null;

  // Create promise to wait for results
  resultPromise = new Promise((resolve) => {
    resultResolve = resolve;
  });

  try {
    const client = new AparaviClient({
      auth: apiKey,
      uri: 'wss://eaas-dev.aparavi.com:443',
      onEvent: (event) => {
        console.log('📨 Event received:', event.event);
        if (event.event === 'apaevt_status_update' || event.event === 'apaevt_response') {
          console.log('📊 Event body:', JSON.stringify(event.body, null, 2));
          if (event.body && (event.body.text || event.body.result || event.body.data)) {
            parsedResults = event.body;
            if (resultResolve) resultResolve(event.body);
          }
        }
      }
    });

    console.log('📡 Connecting to Aparavi...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Subscribe to events
    console.log('📋 Setting up event subscriptions...');

    // Test file
    const testFile = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    console.log('📄 Test file:', testFile);
    console.log('📊 File size:', fs.statSync(testFile).size, 'bytes');

    // Load predefined pipeline
    const pipelineConfig = loadPredefinedPipeline('simpleParse');
    const uniqueProjectId = 'test-' + Date.now();
    pipelineConfig.pipeline.project_id = uniqueProjectId;
    console.log('✅ Pipeline loaded with unique project ID:', uniqueProjectId);

    // Start pipeline
    console.log('🚀 Starting pipeline...');
    const pipelineResult = await client.use({
      pipeline: pipelineConfig
    });
    console.log('✅ Pipeline started with token:', pipelineResult.token);

    // Subscribe to events for this token
    await client.setEvents(pipelineResult.token, ['apaevt_status_update', 'apaevt_response', 'apaevt_complete']);

    // Send file
    console.log('📤 Sending file to pipeline...');
    const fileBuffer = fs.readFileSync(testFile);
    const sendResult = await client.send(pipelineResult.token, fileBuffer);
    console.log('📤 Send response:', JSON.stringify(sendResult, null, 2));

    // Wait for parsed results (with timeout)
    console.log('⏳ Waiting for parsed results...');
    try {
      parsedResults = await Promise.race([
        resultPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for results')), 30000))
      ]);
      console.log('\n✅ Parsed Results Received!');
      console.log(JSON.stringify(parsedResults, null, 2));
    } catch (timeoutError) {
      console.log('⚠️ Timeout waiting for results, checking task status...');
      const status = await client.getTaskStatus(pipelineResult.token);
      console.log('📊 Task Status:', JSON.stringify(status, null, 2));
    }

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

testWaitForResults();
