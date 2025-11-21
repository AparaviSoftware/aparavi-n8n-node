import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

const fs = require('fs');
const path = require('path');

const { AparaviClient: AparaviDTCClient } = require('aparavi-client');

// Helper function to execute pipeline with event handling
async function executePipelineWithEvents(client: any, pipelineName: string, filePath: string): Promise<any> {
	await client.connect();
	console.log('✅ Connected to Aparavi');
	
	// Load pipeline file and modify webhook config to prevent local server issues
	const pipelineFileName = getPipelineFileName(pipelineName);
	console.log('🚀 Starting pipeline from file:', pipelineFileName);
	
	// Load pipeline JSON
	const pipelineJson = fs.readFileSync(pipelineFileName, 'utf8');
	const pipelineConfig = JSON.parse(pipelineJson);
	
	// Fix webhook config: remove entire parameters object to prevent local server connection issues
	// When using client.send() directly, we don't need a local HTTP server
	// Handle both 'components' and 'nodes' structures
	const components = pipelineConfig.pipeline?.components || pipelineConfig.pipeline?.nodes;
	if (components) {
		for (const component of components) {
			if (component.provider === 'webhook' && component.config) {
				// Remove entire parameters object to prevent SDK from trying to start local HTTP server
				// We're using client.send() directly, so no local server is needed
				if (component.config.parameters) {
					delete component.config.parameters;
					console.log('🔧 Removed parameters object from webhook component:', component.id);
				}
				// Set sync: false as additional safeguard
				component.config.sync = false;
				console.log('🔧 Set sync: false for webhook component:', component.id);
			}
		}
	}
	
	const pipelineResult = await client.use({
		pipeline: pipelineConfig,
		threads: 4
	});
	console.log('✅ Pipeline started with token:', pipelineResult.token);

	// Wait for webhook server to be ready (if pipeline uses webhook)
	// The SDK needs time to start the local HTTP server
	console.log('⏳ Waiting for pipeline server to be ready...');
	await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for server to start

	// Send file to pipeline with metadata
	console.log('📤 Sending file to pipeline...');
	const fileBuffer = fs.readFileSync(filePath);
	const fileName = path.basename(filePath);
	const fileSize = fileBuffer.length;
	
	// Determine mimetype based on file extension
	let mimetype = 'application/octet-stream';
	if (fileName.toLowerCase().endsWith('.pdf')) {
		mimetype = 'application/pdf';
	} else if (fileName.toLowerCase().endsWith('.wav')) {
		mimetype = 'audio/wav';
	} else if (fileName.toLowerCase().endsWith('.mp3')) {
		mimetype = 'audio/mpeg';
	} else if (fileName.toLowerCase().endsWith('.png')) {
		mimetype = 'image/png';
	} else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
		mimetype = 'image/jpeg';
	}
	
	// Retry sending file with exponential backoff if connection fails
	let sendResponse: any = null;
	const maxRetries = 5;
	let retryDelay = 2000; // Start with 2 seconds
	
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			sendResponse = await client.send(pipelineResult.token, fileBuffer, {
				filename: fileName,
				size: fileSize,
				mimetype: mimetype
			});
			console.log('📤 File sent, response:', JSON.stringify(sendResponse, null, 2));
			break; // Success, exit retry loop
		} catch (error: any) {
			const errorMsg = error.message || String(error);
			const isConnectionError = errorMsg.includes('Connect call failed') || 
			                          errorMsg.includes('ECONNREFUSED') ||
			                          errorMsg.includes('connection refused');
			
			if (isConnectionError && attempt < maxRetries - 1) {
				console.log(`⚠️  Connection error (attempt ${attempt + 1}/${maxRetries}), waiting ${retryDelay}ms before retry...`);
				await new Promise(resolve => setTimeout(resolve, retryDelay));
				retryDelay *= 1.5; // Exponential backoff
			} else {
				// Either not a connection error, or we've exhausted retries
				throw error;
			}
		}
	}

	// The response should contain the parsed results directly
	if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data || sendResponse.documents)) {
		console.log('✅ Parsed results received in response!');
		await client.disconnect();
		console.log('✅ Disconnected from Aparavi');
		return sendResponse;
	}
	
	// If no results in immediate response, wait a bit and check status
	console.log('⏳ Waiting for processing to complete...');
	await new Promise(resolve => setTimeout(resolve, 3000));
	
	try {
		const status = await client.getTaskStatus(pipelineResult.token);
		console.log('📊 Final status:', JSON.stringify(status, null, 2));
	} catch (error: any) {
		console.log('⚠️ Status check failed:', error.message);
	}
	
	await client.disconnect();
	console.log('✅ Disconnected from Aparavi');
	
	return sendResponse;
}

// Helper function to get pipeline file name
function getPipelineFileName(pipelineName: string): string {
	// Try multiple possible paths (works in both source and built package)
	const possiblePaths = [
		path.join(__dirname, '..', '..', 'predefinedPipelines'), // Source
		path.join(__dirname, '..', '..', '..', 'predefinedPipelines'), // Built (from dist/nodes/AparaviUnified)
		path.join(process.cwd(), 'predefinedPipelines'), // Current working directory
		path.join(__dirname, 'predefinedPipelines'), // Same directory
	];
	
	const pipelineMap: { [key: string]: string } = {
		simpleOCR: 'simple_ocr_webhook.json',
		simpleParse: 'parse_webhook.json',
		advancedParser: 'advanced_parser_webhook.json',
		llamaparse: 'llamaparse_webhook.json',
		audioTranscribe: 'simple_audio_transcribe_webhook.json',
		audioSummary: 'audio_and_summary_webhook.json',
	};
	
	const fileName = pipelineMap[pipelineName] || 'parse_webhook.json';
	
	// Try each possible path
	for (const pipelinesDir of possiblePaths) {
		const filePath = path.join(pipelinesDir, fileName);
		if (fs.existsSync(filePath)) {
			return filePath;
		}
	}
	
	// If not found, return the relative path as fallback
	return `predefinedPipelines/${fileName}`;
}

// Helper function to load predefined pipeline
function loadPredefinedPipeline(pipelineName: string): any {
	// Try multiple possible paths (works in both source and built package)
	const possiblePaths = [
		path.join(__dirname, '..', '..', 'predefinedPipelines'), // Source
		path.join(__dirname, '..', '..', '..', 'predefinedPipelines'), // Built (from dist/nodes/AparaviUnified)
		path.join(process.cwd(), 'predefinedPipelines'), // Current working directory
	];
	
	const pipelineMap: { [key: string]: string } = {
		simpleOCR: 'simple_ocr.json',
		simpleParse: 'simple_parser.json',
		advancedParser: 'advanced_parser.json',
		audioTranscribe: 'simple_audio_transcribe.json',
		audioSummary: 'audio_and_summary.json',
	};

	const fileName = pipelineMap[pipelineName];
	if (!fileName) {
		throw new Error(`Predefined pipeline not found for operation: ${pipelineName}`);
	}

	// Try each possible path
	for (const pipelinesDir of possiblePaths) {
		const filePath = path.join(pipelinesDir, fileName);

		if (fs.existsSync(filePath)) {
			const pipelineJson = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(pipelineJson);
		}
	}

	throw new Error(`Pipeline file not found: ${fileName}. Checked paths: ${possiblePaths.join(', ')}`);
}

export class AparaviUnified implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aparavi DTC',
		name: 'aparaviUnified',
		icon: 'file:aparavi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Complete Aparavi DTC platform with OCR, parsing, transcription, PII censoring, and custom pipelines',
		defaults: {
			name: 'Aparavi DTC',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'aparaviApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Custom Pipeline',
						value: 'customPipeline',
						description: 'Execute a custom workflow pipeline',
					},
					{
						name: 'Simple OCR',
						value: 'simpleOCR',
						description: 'Extract text from images using OCR',
					},
					{
						name: 'Simple Parse',
						value: 'simpleParse',
						description: 'Parse documents and extract structured data',
					},
					{
						name: 'Audio Transcribe',
						value: 'audioTranscribe',
						description: 'Convert audio to text',
					},
					{
						name: 'Audio Summary',
						value: 'audioSummary',
						description: 'Generate summary from audio',
					},
					{
						name: 'Anonymize PII',
						value: 'anonymizePII',
						description: 'Detect and anonymize PII in text',
					},
					{
						name: 'Advanced Parser',
						value: 'advancedParser',
						description: 'Advanced document parsing with multiple outputs',
					},
					{
						name: 'PII Censor - USA',
						value: 'piiCensorUSA',
						description: 'Censor USA-specific PII (SSN, driver license, etc.)',
					},
					{
						name: 'PII Censor - International',
						value: 'piiCensorInternational',
						description: 'Censor international PII (passport, phone, etc.)',
					},
					{
						name: 'PII Censor - Healthcare (HIPAA)',
						value: 'piiCensorHIPAA',
						description: 'Censor healthcare data under HIPAA regulations',
					},
				],
				default: 'simpleOCR',
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'File Path',
						value: 'file',
						description: 'Process a file from the local filesystem',
					},
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Process binary data from previous node',
					},
					{
						name: 'Text Data',
						value: 'text',
						description: 'Process text data from previous node',
					},
				],
				default: 'file',
				displayOptions: {
					show: {
						operation: ['simpleOCR', 'simpleParse', 'audioTranscribe', 'audioSummary', 'advancedParser', 'piiCensorUSA', 'piiCensorInternational', 'piiCensorHIPAA'],
					},
				},
			},
			{
				displayName: 'File Path',
				name: 'filePath',
				type: 'string',
				default: '',
				placeholder: '/path/to/your/file.pdf',
				description: 'Full path to the file to process',
				displayOptions: {
					show: {
						inputType: ['file'],
					},
				},
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property containing the file to process',
				displayOptions: {
					show: {
						inputType: ['binary'],
					},
				},
			},
			{
				displayName: 'Text Data',
				name: 'textData',
				type: 'string',
				default: '',
				description: 'Text data to process',
				displayOptions: {
					show: {
						inputType: ['text'],
					},
				},
			},
			{
				displayName: 'Input Data Mode',
				name: 'inputData',
				type: 'options',
				options: [
					{
						name: 'All Fields',
						value: 'all',
						description: 'Process all fields in the input data',
					},
					{
						name: 'Specific Fields',
						value: 'specific',
						description: 'Process only specified fields',
					},
				],
				default: 'all',
				displayOptions: {
					show: {
						operation: ['piiCensorUSA', 'piiCensorInternational', 'piiCensorHIPAA'],
					},
				},
			},
			{
				displayName: 'Fields to Process',
				name: 'fieldsToProcess',
				type: 'string',
				default: '',
				placeholder: 'name,email,phone',
				description: 'Comma-separated list of field names to process',
				displayOptions: {
					show: {
						operation: ['piiCensorUSA', 'piiCensorInternational', 'piiCensorHIPAA'],
						inputData: ['specific'],
					},
				},
			},
			{
				displayName: 'Censor Character',
				name: 'censorChar',
				type: 'string',
				default: '█',
				description: 'Character to use for censoring PII',
				displayOptions: {
					show: {
						operation: ['piiCensorUSA', 'piiCensorInternational', 'piiCensorHIPAA'],
					},
				},
			},
			{
				displayName: 'Pipeline JSON',
				name: 'pipelineJson',
				type: 'json',
				default: '',
				description: 'Custom pipeline configuration in JSON format',
				displayOptions: {
					show: {
						operation: ['customPipeline'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Custom Base URL',
						name: 'customBaseUrl',
						type: 'string',
						default: '',
						placeholder: 'https://eaas-dev.aparavi.com',
						description: 'Override the default API base URL (leave empty for default)',
					},
					{
						displayName: 'Timeout (seconds)',
						name: 'timeout',
						type: 'number',
						default: 300,
						description: 'Timeout for the operation in seconds',
					},
					{
						displayName: 'Retry Attempts',
						name: 'retryAttempts',
						type: 'number',
						default: 3,
						description: 'Number of retry attempts on failure',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('aparaviApi');
		if (!credentials?.apiKey) {
			throw new NodeOperationError(this.getNode(), 'Aparavi API credentials are required');
		}

		// Get custom base URL from first item (assuming all items use same config)
		const options = this.getNodeParameter('options', 0) as any;
		const customBaseUrl = options?.customBaseUrl || '';
		
		// Initialize Aparavi DTC client with custom base URL if provided
		const baseUrl = customBaseUrl || 'https://eaas-dev.aparavi.com';
		const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + ':443';
		const client = new AparaviDTCClient({
			auth: credentials.apiKey as string,
			uri: wsUrl
		});
		
		// Log custom base URL usage
		if (customBaseUrl && customBaseUrl.trim() !== '') {
			console.log('🌐 Using custom base URL:', baseUrl);
			console.log('🌐 WebSocket URI:', wsUrl);
		} else {
			console.log('🌐 Using default base URL:', baseUrl);
			console.log('🌐 WebSocket URI:', wsUrl);
		}


		// Create pipeline configuration based on PII type
		const classificationMap: { [key: string]: { name: string; description: string } } = {
			usa: {
				name: 'United States Personal Data Policy',
				description: 'Detects personal data applicable to United States Federal and State laws',
			},
			international: {
				name: 'International Personal Data Policy',
				description: 'Detects personal data applicable to international regulations (GDPR, etc.)',
			},
			hipaa: {
				name: 'HIPAA Healthcare Data Policy',
				description: 'Detects healthcare data under HIPAA regulations',
			},
		};

		const pipelineConfig = {
			pipeline: {
				project_id: 'default',
				nodes: [
					{
						id: 'webhook_1',
						provider: 'webhook',
						config: {
							type: 'webhook',
							mode: 'Source',
							hideForm: true,
						},
					},
					{
						id: 'pii_1',
						provider: 'pii',
						input: [['webhook_1']],
						config: {
							profile: 'default',
							multilingual: {
								enabled: false,
							},
							default: {
								classification: classificationMap.usa.name,
								description: classificationMap.usa.description,
								lanes: [],
							},
						},
					},
					{
						id: 'response_1',
						provider: 'response',
						input: [['pii_1']],
						config: {
							lanes: [],
						},
					},
				],
			},
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const inputType = this.getNodeParameter('inputType', i) as string;
				const options = this.getNodeParameter('options', i) as any;

				let result: any;

				switch (operation) {
					case 'customPipeline': {
						const pipelineJson = this.getNodeParameter('pipelineJson', i) as string;
						if (!pipelineJson) {
							throw new NodeOperationError(this.getNode(), 'Pipeline JSON is required for custom pipeline operation');
						}

						let pipeline;
						try {
							pipeline = JSON.parse(pipelineJson);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Invalid pipeline JSON format');
						}

						console.log('🔧 Custom Pipeline - Processing...');
						await client.executePipelineWorkflow(pipeline);
						result = { token: client.token, status: 'started' };
						console.log('✅ Custom Pipeline - Pipeline started with token:', client.token);
						break;
					}

					case 'simpleOCR': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const fs = require('fs');
							const path = require('path');
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for OCR operation');
						}

						console.log('🔍 Simple OCR - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'simpleOCR', filePath);
							console.log('✅ Simple OCR - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Simple OCR failed: ${error.message}`);
						}
						break;
					}

					case 'simpleParse': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Parse operation');
						}

						console.log('📄 Simple Parse - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'simpleParse', filePath);
							console.log('✅ Simple Parse - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Simple Parse failed: ${error.message}`);
						}
						break;
					}

					case 'audioTranscribe': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const fs = require('fs');
							const path = require('path');
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.wav`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Audio Transcribe operation');
						}

						console.log('🎵 Audio Transcribe - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'audioTranscribe', filePath);
							console.log('✅ Audio Transcribe - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Audio Transcribe failed: ${error.message}`);
						}
						break;
					}

					case 'audioSummary': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const fs = require('fs');
							const path = require('path');
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.wav`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Audio Summary operation');
						}

						console.log('📝 Audio Summary - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'audioSummary', filePath);
							console.log('✅ Audio Summary - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Audio Summary failed: ${error.message}`);
						}
						break;
					}

					case 'anonymizePII': {
						let textData: string;
						if (inputType === 'text') {
							textData = this.getNodeParameter('textData', i) as string;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input required for Anonymize PII operation');
						}

						console.log('🔒 Anonymize PII - Processing text data');
						result = await client.anonymizePII(textData);
						console.log('✅ Anonymize PII - Result:', JSON.stringify(result, null, 2));
						break;
					}

					case 'advancedParser': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const fs = require('fs');
							const path = require('path');
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Advanced Parser operation');
						}

						console.log('🔧 Advanced Parser - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'advancedParser', filePath);
							console.log('✅ Advanced Parser - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Advanced Parser failed: ${error.message}`);
						}
						break;
					}

					case 'llamaparse': {
						let filePath: string;
						if (inputType === 'file') {
							filePath = this.getNodeParameter('filePath', i) as string;
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							// Save binary data to temporary file
							const fs = require('fs');
							const path = require('path');
							const os = require('os');
							const tempDir = os.tmpdir();
							const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
							fs.writeFileSync(tempFile, binaryData);
							filePath = tempFile;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for LlamaParse operation');
						}

						console.log('🦙 LlamaParse - Processing file:', filePath);
						
						try {
							result = await executePipelineWithEvents(client, 'llamaparse', filePath);
							console.log('✅ LlamaParse - Result:', JSON.stringify(result, null, 2));
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `LlamaParse failed: ${error.message}`);
						}
						break;
					}

					case 'piiCensorUSA':
					case 'piiCensorInternational':
					case 'piiCensorHIPAA': {
						// Get PII-specific parameters (only available for PII operations)
						const inputDataMode = this.getNodeParameter('inputData', i) as string;
						const fieldsToProcess = inputDataMode === 'specific' ? this.getNodeParameter('fieldsToProcess', i) as string : '';
						const censorChar = this.getNodeParameter('censorChar', i, '█') as string;

						let inputData = items[i].json;

						// Handle specific fields processing
						if (inputDataMode === 'specific' && fieldsToProcess) {
							const fields = fieldsToProcess.split(',').map(f => f.trim());
							const filteredData: any = {};

							for (const field of fields) {
								if (inputData[field] !== undefined) {
									filteredData[field] = inputData[field];
								}
							}

							inputData = filteredData;
						}

						// Determine PII type based on operation
						let piiTypeForCensor = 'usa';
						if (operation === 'piiCensorInternational') {
							piiTypeForCensor = 'international';
						} else if (operation === 'piiCensorHIPAA') {
							piiTypeForCensor = 'hipaa';
						}

						// Update pipeline config for the specific PII type
						const classificationForCensor = classificationMap[piiTypeForCensor] || classificationMap.usa;
						if (pipelineConfig.pipeline.nodes[1]?.config?.default) {
							pipelineConfig.pipeline.nodes[1].config.default.classification = classificationForCensor.name;
							pipelineConfig.pipeline.nodes[1].config.default.description = classificationForCensor.description;
						}

						console.log(`🔒 PII Censor (${piiTypeForCensor.toUpperCase()}) - Processing data`);
						result = await client.executePipeline(pipelineConfig);
						console.log('✅ PII Censor - Result:', JSON.stringify(result, null, 2));
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
