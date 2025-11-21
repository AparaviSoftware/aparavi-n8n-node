#!/usr/bin/env node

const { AparaviClient } = require('aparavi-client');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testNewClient() {
  console.log('🧪 Testing new Aparavi Client...\n');

  try {
    const client = new AparaviClient({
      auth: apiKey,
      uri: 'wss://eaas-dev.aparavi.com:443'
    });

    console.log('📡 Connecting to Aparavi...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test Simple Parse pipeline
    console.log('\n📄 Testing Simple Parse pipeline...');
    
    const parsePipeline = {
      pipeline: {
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
            provider: "parser",
            config: {
              language: "en"
            },
            input: [
              {
                from: "source_1",
                lane: "text"
              }
            ]
          },
          {
            id: "response_1",
            provider: "response",
            input: [
              {
                from: "parser_1",
                lane: "text"
              }
            ]
          }
        ]
      }
    };

    console.log('🚀 Starting pipeline...');
    const pipelineResult = await client.use({
      pipeline: parsePipeline
    });
    
    console.log('✅ Pipeline started! Token:', pipelineResult.token);
    
    // Test with a simple text
    console.log('\n📤 Sending test data...');
    const result = await client.send(pipelineResult.token, "Hello, this is a test document for parsing.");
    
    console.log('\n✅ Result:');
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

testNewClient();
