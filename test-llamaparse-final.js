"use strict";
/**
 * Test LlamaParse using the PUBLISHED aparavi-client SDK from npm
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aparavi_client_1 = require("aparavi-client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG = {
    uri: 'wss://eaas-dev.aparavi.com:443',
    auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
};
// Load and convert predefined pipeline to SDK format
function loadLlamaParsePipeline() {
    const pipelinePath = path.join(__dirname, 'predefinedPipelines', 'llamaparse_webhook.json');
    const pipelineJson = fs.readFileSync(pipelinePath, 'utf8');
    const pipelineData = JSON.parse(pipelineJson);
    // Convert from components format to pipeline format
    if (pipelineData.components && !pipelineData.pipeline) {
        // Find webhook source component
        const webhookComponent = pipelineData.components.find((c) => c.provider === 'webhook');
        const sourceId = webhookComponent ? webhookComponent.id : 'webhook_1';
        // Return in the format expected by the SDK
        return {
            source: sourceId,
            components: pipelineData.components,
            project_id: pipelineData.id || 'llamaparse-' + Date.now()
        };
    }
    // If already in pipeline format, extract components
    if (pipelineData.pipeline) {
        return {
            source: pipelineData.pipeline.source,
            components: pipelineData.pipeline.components,
            project_id: pipelineData.pipeline.project_id || 'llamaparse-' + Date.now()
        };
    }
    return pipelineData;
}
async function testLlamaParse(pdfFilePath) {
    console.log('\n🚀 Testing LlamaParse with PUBLISHED aparavi-client SDK');
    console.log('   Package: aparavi-client@1.0.6 from npm');
    console.log('='.repeat(70));
    if (!fs.existsSync(pdfFilePath)) {
        console.error(`❌ Error: PDF file not found: ${pdfFilePath}`);
        process.exit(1);
    }
    const fileStats = fs.statSync(pdfFilePath);
    const fileName = path.basename(pdfFilePath);
    console.log(`\n📄 File: ${fileName}`);
    console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB\n`);
    const client = new aparavi_client_1.AparaviClient(CONFIG);
    try {
        console.log('📡 Connecting to Aparavi server...');
        await client.connect();
        console.log('   ✅ Connected\n');
        // Load pipeline and convert to the format expected by SDK
        const pipelineConfig = loadLlamaParsePipeline();
        const components = pipelineConfig.components || [];
        // Find webhook component and ensure it has the right config
        let webhookComponent = components.find((c) => c.provider === 'webhook');
        if (!webhookComponent) {
            throw new Error('No webhook component found in pipeline');
        }
        // Ensure the webhook config has ALL required fields
        webhookComponent.config.mode = 'Source';
        webhookComponent.config.key = 'webhook://*';
        webhookComponent.config.name = 'Webhook Source';
        webhookComponent.config.type = 'webhook';
        if (!webhookComponent.config.include) {
            webhookComponent.config.include = [{ path: '*' }];
        }
        if (!webhookComponent.config.parameters) {
            webhookComponent.config.parameters = {
                endpoint: '/pipe/process',
                port: 5566
            };
        }
        webhookComponent.config.sync = false;
        const sourceId = webhookComponent.id;
        const pipelineToUse = {
            source: sourceId,
            project_id: pipelineConfig.project_id || 'llamaparse-' + Date.now(),
            components: components
        };
        console.log('🚀 Starting LlamaParse + LVM pipeline...');
        const result = await client.use({
            pipeline: {
                pipeline: pipelineToUse
            },
            token: 'PUBLISHED-SDK-TEST-' + Date.now()
        });
        console.log(`   ✅ Pipeline started: ${result.token}\n`);
        console.log('📤 Uploading PDF file...');
        console.log('⏳ Processing with LlamaParse + LVM...');
        console.log('   (This may take 30-90 seconds)\n');
        // Read file buffer
        const fileBuffer = fs.readFileSync(pdfFilePath);
        const fileSize = fileBuffer.length;
        // Use send method (works in Node.js)
        const response = await client.send(result.token, fileBuffer, {
            filename: fileName,
            size: fileSize,
            mimetype: 'application/pdf'
        });
        console.log('✅ Processing complete!\n');
        if (response) {
            console.log('='.repeat(70));
            console.log('📊 EXTRACTION RESULTS');
            console.log('='.repeat(70));
            console.log();
            // Show text
            if (response.text && Array.isArray(response.text) && response.text.length > 0) {
                console.log('📝 EXTRACTED TEXT:\n');
                console.log('-'.repeat(70));
                // Show first 2000 characters
                const fullText = response.text.join('\n\n');
                const preview = fullText.substring(0, 2000);
                console.log(preview);
                if (fullText.length > 2000) {
                    console.log('\n... (truncated) ...\n');
                }
                console.log('-'.repeat(70));
                console.log(`\n📏 Total length: ${fullText.length.toLocaleString()} characters`);
                console.log(`   Text blocks: ${response.text.length}`);
                // Save full text
                const outputFile = `llamaparse_${fileName.replace('.PDF', '').replace('.pdf', '')}_${Date.now()}.txt`;
                fs.writeFileSync(outputFile, fullText, 'utf-8');
                console.log(`\n💾 Full text saved to: ${outputFile}`);
                console.log();
            }
            else {
                console.log('⚠️  No text extracted\n');
            }
            // Show tables
            if (response.table && Array.isArray(response.table) && response.table.length > 0) {
                console.log(`📊 Tables found: ${response.table.length}\n`);
            }
            // Show documents
            if (response.documents && Array.isArray(response.documents)) {
                console.log(`📚 Document objects: ${response.documents.length}\n`);
            }
            console.log('='.repeat(70));
        }
        else {
            console.log('⚠️  No response received from pipeline\n');
        }
        // Cleanup
        console.log('\n🛑 Cleaning up...');
        await client.terminate(result.token);
        await client.disconnect();
        console.log('   ✅ Done\n');
        console.log('✅ TEST PASSED - Published SDK works correctly!\n');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        if (client.isConnected()) {
            await client.disconnect();
        }
        process.exit(1);
    }
}
// Get file path from command line or use default
const pdfPath = process.argv[2] || '/Users/armin/Downloads/Preliminary Title Report.PDF';
testLlamaParse(pdfPath);
