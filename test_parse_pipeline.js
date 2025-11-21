const { AparaviClient } = require('aparavi-client');
const fs = require('fs');
const path = require('path');

async function testParsePipeline() {
  console.log('🚀 Starting Parse Pipeline Test\n');
  
  // Check for API key
  const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';
  if (!apiKey) {
    console.error('❌ Error: APARAVI_APIKEY environment variable not set');
    console.error('   Please set it with: export APARAVI_APIKEY=your-api-key');
    process.exit(1);
  }

  const client = new AparaviClient({
    auth: apiKey,
    uri: 'wss://eaas-dev.aparavi.com:443',
    onEvent: (event) => {
      console.log('📨 Event:', event.event);
      if (event.body) {
        console.log('   Body:', JSON.stringify(event.body, null, 2));
      }
    }
  });

  try {
    // Connect to server
    console.log('🔌 Connecting to Aparavi server...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Start the pipeline (using webhook version to accept uploads)
    console.log('📋 Starting parse pipeline...');
    const result = await client.use({
      filepath: 'predefinedPipelines/parse_webhook.json',
      threads: 4
    });
    console.log('✅ Pipeline started!');
    console.log('   Token:', result.token);
    console.log('   Pipeline:', result.pipeline ? 'Loaded' : 'N/A');
    console.log();

    // Read the PDF file
    const filePath = '/Users/armin/Downloads/10_08_25_Parsa_Resume (1).pdf';
    console.log('📄 Reading file:', filePath);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileSize = fileBuffer.length;
    
    console.log('   File name:', fileName);
    console.log('   File size:', (fileSize / 1024).toFixed(2), 'KB');
    console.log();

    // Method A: Send file directly
    console.log('📤 Uploading file to pipeline...');
    const uploadResponse = await client.send(result.token, fileBuffer, {
      filename: fileName,
      size: fileSize,
      mimetype: 'application/pdf'
    });
    console.log('✅ File uploaded!');
    console.log('   Response:', uploadResponse);
    console.log();

    // Subscribe to status updates
    console.log('📊 Subscribing to status updates...');
    await client.setEvents(result.token, ['apaevt_status_update', 'apaevt_status_upload']);
    
    // Monitor status for a while
    console.log('⏳ Monitoring pipeline status...\n');
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const status = await client.getTaskStatus(result.token);
        console.log(`📊 Status Check #${i + 1}:`);
        console.log('   State:', status.state);
        console.log('   Progress:', `${status.completedCount || 0}/${status.totalCount || 0}`);
        
        // State meanings: 0=pending, 1=running, 2=paused, 3=stopping, 4=stopped, 5=complete
        if (status.state === 5) {
          console.log('\n✅ Pipeline completed!\n');
          break;
        } else if (status.state === 4) {
          console.log('\n⚠️ Pipeline stopped.\n');
          break;
        }
      } catch (error) {
        console.log('   Status check error:', error.message);
      }
      console.log();
    }

    console.log('🎉 Test completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    console.log('🔌 Disconnecting...');
    await client.disconnect();
    console.log('👋 Disconnected\n');
  }
}

// Run the test
testParsePipeline().catch(console.error);

