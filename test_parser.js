"use strict";
/**
 * Test multiple prebuilt parser pipelines using the PUBLISHED aparavi-client SDK from npm
 * Tests: parse_webhook, llamaparse, llamaparse_simple
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
// Load prebuilt pipelines
const PIPELINES_DIR = path.join(__dirname, '../testdata/pipelines');
// Standard Parse Pipeline (parse_webhook.json)
const PARSE_WEBHOOK_PIPELINE = {
    pipeline: {
        source: "source_1",
        components: [
            {
                id: "source_1",
                provider: "webhook",
                config: {
                    key: "webhook://*",
                    mode: "Source",
                    name: "Webhook Source",
                    parameters: {
                        endpoint: "/pipe/process",
                        port: 5566
                    }
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
                    keys: {
                        documents: "procdocs"
                    }
                },
                input: [
                    {
                        lane: "text",
                        from: "parser_1"
                    },
                    {
                        lane: "table",
                        from: "parser_1"
                    }
                ]
            }
        ]
    }
};
// LlamaParse Pipeline with GPT-4o Vision (llamaparse.json)
const LLAMAPARSE_PIPELINE = {
    pipeline: {
        source: "source_1",
        components: [
            {
                id: "source_1",
                provider: "webhook",
                config: {
                    key: "webhook://*",
                    mode: "Source",
                    name: "Web Hook",
                    include: [{ path: "*" }],
                    parameters: {
                        endpoint: "/pipe/process",
                        port: 5566
                    },
                    sync: false,
                    type: "webhook"
                }
            },
            {
                id: "llamaparse_1",
                provider: "llamaparse",
                config: {
                    profile: "default",
                    default: {
                        api_key: "llx-dYXzrb1FR0NfOjBcQPiLhYc4EgcAruDQvKTs1mGePfJwzfNF",
                        result_type: "markdown",
                        use_vendor_multimodal_model: true,
                        vendor_multimodal_model_name: "openai-gpt4o",
                        gpt4o_mode: "fast",
                        take_screenshot: true,
                        premium_mode: false,
                        use_aparavi_api_key: false
                    }
                },
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
                    keys: {
                        documents: "procdocs",
                        text: "text",
                        table: "tables",
                        images: "images"
                    }
                },
                input: [
                    {
                        lane: "text",
                        from: "llamaparse_1"
                    },
                    {
                        lane: "table",
                        from: "llamaparse_1"
                    },
                    {
                        lane: "documents",
                        from: "llamaparse_1"
                    }
                ]
            }
        ]
    }
};
// Simple LlamaParse Pipeline (llamaparse_simple.json)
const LLAMAPARSE_SIMPLE_PIPELINE = {
    pipeline: {
        source: "source_1",
        components: [
            {
                id: "source_1",
                provider: "webhook",
                config: {
                    key: "webhook://*",
                    mode: "Source",
                    name: "Webhook Source",
                    include: [{ path: "*" }],
                    parameters: {
                        endpoint: "/pipe/process",
                        port: 5566
                    },
                    sync: false,
                    type: "webhook"
                }
            },
            {
                id: "llamaparse_1",
                provider: "llamaparse",
                config: {
                    profile: "default",
                    default: {
                        api_key: "llx-dYXzrb1FR0NfOjBcQPiLhYc4EgcAruDQvKTs1mGePfJwzfNF",
                        result_type: "markdown"
                    }
                },
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
                    keys: {
                        documents: "procdocs",
                        text: "text",
                        table: "tables"
                    }
                },
                input: [
                    {
                        lane: "text",
                        from: "llamaparse_1"
                    },
                    {
                        lane: "table",
                        from: "llamaparse_1"
                    },
                    {
                        lane: "documents",
                        from: "llamaparse_1"
                    }
                ]
            }
        ]
    }
};
async function testPipeline(client, pipeline, pipelineName, pdfFilePath, resultsMap) {
    const startTime = Date.now();
    const fileName = path.basename(pdfFilePath);
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 Testing: ${pipelineName}`);
    console.log(`${'='.repeat(70)}`);
    let error = undefined;
    try {
        // Start pipeline
        const token = `TEST-${pipelineName.replace(/\s+/g, '-')}-${Date.now()}`;
        const result = await client.use({
            pipeline: pipeline,
            token: token
        });
        console.log(`   ✅ Pipeline started: ${result.token}`);
        // Set up event listener
        await client.setEvents(result.token, ['apaevt_status_update']);
        // Wait for webhook server to be ready (if pipeline uses webhook with port)
        // The SDK needs time to start the local HTTP server
        console.log(`   ⏳ Waiting for pipeline to be ready...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for server to start
        console.log();
        // Read file and upload with retry logic
        const fileBuffer = fs.readFileSync(pdfFilePath);
        // Convert Node.js Buffer to Uint8Array for File constructor
        const file = new File([new Uint8Array(fileBuffer)], fileName, { type: 'application/pdf' });
        console.log(`   📤 Uploading file: ${fileName}...`);
        // Retry upload with exponential backoff if connection fails
        let uploadResults = null;
        const maxRetries = 8; // Increased retries
        let retryDelay = 2000; // Start with 2 seconds
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                uploadResults = await client.sendFiles([{ file, mimetype: 'application/pdf' }], result.token, 1);
                console.log(`   ✅ Upload complete!`);
                break; // Success, exit retry loop
            }
            catch (uploadErr) {
                const errorMsg = uploadErr?.message || String(uploadErr);
                const isConnectionError = errorMsg.includes('Connect call failed') ||
                    errorMsg.includes('ECONNREFUSED') ||
                    errorMsg.includes('111') ||
                    errorMsg.includes('Multiple exceptions');
                if (isConnectionError && attempt < maxRetries - 1) {
                    console.log(`   ⚠️  Upload attempt ${attempt + 1} failed (server not ready), retrying in ${(retryDelay / 1000).toFixed(1)}s...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryDelay = Math.min(retryDelay * 1.5, 10000); // Exponential backoff, max 10 seconds
                }
                else {
                    // Log the error before re-throwing
                    if (isConnectionError) {
                        console.log(`   ❌ Upload failed after ${maxRetries} attempts: ${errorMsg}`);
                    }
                    throw uploadErr; // Re-throw if not a connection error or out of retries
                }
            }
        }
        if (!uploadResults) {
            throw new Error('Upload failed: No results after all retry attempts');
        }
        console.log();
        // Wait for results (check both events and upload response)
        console.log(`   ⏳ Processing... (waiting up to 90 seconds)`);
        // Wait longer and check periodically for results
        let response = null;
        for (let wait = 0; wait < 90; wait += 5) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Check events map first
            const extractionResults = resultsMap.get(result.token);
            if (extractionResults) {
                response = extractionResults;
                console.log(`   ✅ Results received via events (after ${wait + 5}s)`);
                break;
            }
            // Check upload response
            if (uploadResults && uploadResults[0] && uploadResults[0].result) {
                response = uploadResults[0].result;
                console.log(`   ✅ Results received via upload response (after ${wait + 5}s)`);
                break;
            }
            // Check task status to see if it's completed (but results come via events)
            try {
                const status = await client.getTaskStatus(result.token);
                if (status && (status.state === aparavi_client_1.TASK_STATE.COMPLETED || status.state === aparavi_client_1.TASK_STATE.CANCELLED)) {
                    // Task is done, but we should have results from events by now
                    // If we still don't have results, check uploadResults one more time
                    if (!response && uploadResults && uploadResults[0]) {
                        response = uploadResults[0].result;
                        if (response) {
                            console.log(`   ✅ Results received via upload response after completion (after ${wait + 5}s)`);
                            break;
                        }
                    }
                    if (!response) {
                        const stateName = status.state === aparavi_client_1.TASK_STATE.COMPLETED ? 'completed' : 'cancelled';
                        console.log(`   ⚠️  Task ${stateName} but no results found`);
                    }
                }
            }
            catch (e) {
                // Status check failed, continue waiting
            }
            if (wait % 15 === 0 && wait > 0) {
                console.log(`   ⏳ Still processing... (${wait}s elapsed)`);
            }
        }
        if (response) {
            const textLength = response.text && Array.isArray(response.text)
                ? response.text.join('\n\n').length
                : 0;
            const textBlocks = response.text && Array.isArray(response.text)
                ? response.text.length
                : 0;
            const tablesCount = response.table && Array.isArray(response.table)
                ? response.table.length
                : 0;
            console.log(`   ✅ Processing complete!`);
            console.log(`   📊 Text length: ${textLength.toLocaleString()} characters`);
            console.log(`   📝 Text blocks: ${textBlocks}`);
            console.log(`   📋 Tables: ${tablesCount}`);
            // Cleanup
            await client.terminate(result.token);
            const duration = Date.now() - startTime;
            return {
                pipelineName,
                success: true,
                duration,
                textLength,
                textBlocks,
                tablesCount
            };
        }
        else {
            error = 'No results returned';
            console.log(`   ⚠️  ${error}`);
            await client.terminate(result.token);
            const duration = Date.now() - startTime;
            return {
                pipelineName,
                success: false,
                duration,
                error
            };
        }
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ Error: ${error}`);
        const duration = Date.now() - startTime;
        return {
            pipelineName,
            success: false,
            duration,
            error
        };
    }
}
async function runTests(pdfFilePath) {
    console.log('\n🚀 Testing Prebuilt Parser Pipelines with PUBLISHED aparavi-client SDK');
    console.log('   Package: aparavi-client@1.0.6 from npm');
    console.log('='.repeat(70));
    if (!fs.existsSync(pdfFilePath)) {
        console.error(`❌ Error: PDF file not found: ${pdfFilePath}`);
        process.exit(1);
    }
    const fileStats = fs.statSync(pdfFilePath);
    const fileName = path.basename(pdfFilePath);
    console.log(`\n📄 File: ${fileName}`);
    console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB`);
    console.log(`   Path: ${pdfFilePath}\n`);
    // Map to store results by token
    const resultsMap = new Map();
    const client = new aparavi_client_1.AparaviClient({
        ...CONFIG,
        onEvent: async (event) => {
            if (event.event === 'apaevt_status_update' && event.body && event.body.result) {
                // Store results by token for later retrieval
                const token = event.token || event.body.token;
                if (token) {
                    resultsMap.set(token, event.body.result);
                }
            }
        }
    });
    try {
        console.log('📡 Connecting to Aparavi server...');
        await client.connect();
        console.log('   ✅ Connected\n');
        const pipelines = [
            { name: 'Standard Parse (parse_webhook)', pipeline: PARSE_WEBHOOK_PIPELINE },
            { name: 'LlamaParse Simple', pipeline: LLAMAPARSE_SIMPLE_PIPELINE },
            { name: 'LlamaParse + GPT-4o Vision', pipeline: LLAMAPARSE_PIPELINE }
        ];
        const results = [];
        // Test each pipeline sequentially
        for (let i = 0; i < pipelines.length; i++) {
            const { name, pipeline } = pipelines[i];
            const result = await testPipeline(client, pipeline, name, pdfFilePath, resultsMap);
            results.push(result);
            // Wait between tests
            if (i < pipelines.length - 1) {
                console.log('\n   ⏸️  Waiting 3 seconds before next test...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        // Print summary
        console.log('\n' + '='.repeat(70));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(70));
        console.log();
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.pipelineName}`);
            if (result.success) {
                console.log(`   ✅ SUCCESS (${(result.duration / 1000).toFixed(1)}s)`);
                console.log(`   📝 Text: ${result.textLength?.toLocaleString()} chars, ${result.textBlocks} blocks`);
                console.log(`   📋 Tables: ${result.tablesCount || 0}`);
            }
            else {
                console.log(`   ❌ FAILED (${(result.duration / 1000).toFixed(1)}s)`);
                console.log(`   Error: ${result.error}`);
            }
            console.log();
        });
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        console.log('='.repeat(70));
        console.log(`✅ Tests passed: ${successCount}/${totalCount}`);
        console.log('='.repeat(70));
        await client.disconnect();
        console.log('\n✅ All tests completed!\n');
        process.exit(successCount === totalCount ? 0 : 1);
    }
    catch (error) {
        console.error('\n❌ TEST SUITE FAILED');
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
const pdfPath = process.argv[2] || '/Users/armin/Downloads/APFS_Assembly_Process_Qualification_Data_1762995216229.pdf';
runTests(pdfPath);
