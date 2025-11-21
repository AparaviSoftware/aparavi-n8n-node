#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testSimpleText() {
  console.log('🧪 Testing Simple Text Processing...\n');

  try {
    const client = new AparaviClient({
      auth: apiKey,
      uri: 'wss://eaas-dev.aparavi.com:443'
    });

    console.log('📡 Connecting to Aparavi...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Simple pipeline for text processing
    const parsePipeline = {
      pipeline: {
        project_id: 'test-text-' + Date.now(),
        source: "source_1",
        components: [
          {
            id: "source_1",
            provider: "webhook",
            config: {
              hideForm: true,
              mode: "Source",
              type: "webhook"
            }
          },
          {
            id: "parser_1",
            provider: "parse",
            config: {},
            input: [
              {
                lane: "tags",
                from: "source_1"
              }
            ]
          },
          {
            id: "response_1",
            provider: "response",
            config: {
              lanes: []
            },
            input: [
              {
                lane: "text",
                from: "parser_1"
              }
            ]
          }
        ]
      }
    };

    // Set up event handler
    let parsedResult = null;
    let resultResolve = null;
    const resultPromise = new Promise((resolve) => {
      resultResolve = resolve;
    });

    client.onEvent = (event) => {
      console.log('📨 Event received:', event.event);
      console.log('📊 Event body:', JSON.stringify(event.body, null, 2));
      if (event.event === 'apaevt_response' || event.event === 'apaevt_status_update') {
        if (event.body && (event.body.text || event.body.result || event.body.data)) {
          parsedResult = event.body;
          if (resultResolve) resultResolve(event.body);
        }
      }
    };

    console.log('🚀 Starting pipeline...');
    const pipelineResult = await client.use({
      pipeline: parsePipeline
    });
    console.log('✅ Pipeline started! Token:', pipelineResult.token);

    // Subscribe to events
    await client.setEvents(pipelineResult.token, ['apaevt_status_update', 'apaevt_response', 'apaevt_complete']);

    // Test with simple text
    console.log('\n📤 Sending test text...');
    const sendResult = await client.send(pipelineResult.token, "Hello, this is a test document for parsing.");
    console.log('📤 Send response:', JSON.stringify(sendResult, null, 2));

    // Wait for parsed results
    console.log('⏳ Waiting for parsed results...');
    try {
      parsedResult = await Promise.race([
        resultPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
      console.log('\n✅ Parsed Result:');
      console.log(JSON.stringify(parsedResult, null, 2));
    } catch (timeoutError) {
      console.log('⚠️ Timeout waiting for results, using send response');
      console.log('\n✅ Send Result:');
      console.log(JSON.stringify(sendResult, null, 2));
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

testSimpleText();
