import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

// Embedded pipeline configurations (no file system access needed)
const PIPELINE_CONFIGS: { [key: string]: any } = {
	simpleOCR: {
		pipeline: {
			source: 'source_1',
			components: [
				{
					id: 'source_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						parameters: {
							endpoint: '/pipe/process',
							port: 5566,
						},
					},
				},
				{
					id: 'ocr_1',
					provider: 'ocr',
					config: {
						default: {
							doctr: {
								det_arch: 'db_resnet50',
								reco_arch: 'crnn_vgg16_bn',
							},
							language: 'en',
							table: 'Doctr',
						},
						multilingual: {
							doctr: {
								det_arch: 'db_resnet50',
								reco_arch: 'crnn_vgg16_bn',
							},
							table: 'Doctr',
						},
						profile: 'default',
					},
					input: [{ lane: 'image', from: 'source_1' }],
				},
				{
					id: 'response_1',
					provider: 'response',
					config: {
						keys: {
							documents: 'procdocs',
						},
					},
					input: [{ lane: 'text', from: 'ocr_1' }],
				},
			],
		},
	},
	simpleParse: {
		pipeline: {
			source: 'source_1',
			components: [
				{
					id: 'source_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						sync: false,
					},
				},
				{
					id: 'parser_1',
					provider: 'parse',
					config: {},
					input: [{ lane: 'tags', from: 'source_1' }],
				},
				{
					id: 'response_1',
					provider: 'response',
					config: {
						keys: {
							documents: 'procdocs',
						},
					},
					input: [
						{ lane: 'text', from: 'parser_1' },
						{ lane: 'table', from: 'parser_1' },
					],
				},
			],
		},
	},
	advancedParser: {
		pipeline: {
			source: 'source_1',
			components: [
				{
					id: 'source_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						parameters: {
							endpoint: '/pipe/process',
							port: 5566,
						},
					},
				},
				{
					id: 'parse_1',
					provider: 'parse',
					config: {
						advanced: true,
						extract_tables: true,
						extract_images: true,
						extract_metadata: true,
						preserve_formatting: true,
						extract_links: true,
					},
					input: [{ lane: 'tags', from: 'source_1' }],
				},
				{
					id: 'response_1',
					provider: 'response',
					config: {
						keys: {
							documents: 'procdocs',
						},
					},
					input: [
						{ lane: 'text', from: 'parse_1' },
						{ lane: 'table', from: 'parse_1' },
						{ lane: 'image', from: 'parse_1' },
					],
				},
			],
		},
	},
	llamaparse: {
		pipeline: {
			project_id: '864e0fdd-57ca-4089-9049-ae4e1a5633cd',
			source: 'webhook_1',
			components: [
				{
					id: 'response_1',
					provider: 'response',
					config: {
						lanes: [],
					},
					input: [
						{ lane: 'table', from: 'llamaparse_1' },
						{ lane: 'text', from: 'llamaparse_1' },
					],
				},
				{
					id: 'llamaparse_1',
					provider: 'llamaparse',
					config: {
						default: {
							use_advanced_config: false,
							parse_mode: 'parse_page_with_lvm',
							spreadsheet_extract_sub_tables: false,
							use_system_prompt_append: false,
							lvm_model: 'anthropic-sonnet-4.0',
						},
					},
					input: [{ lane: 'tags', from: 'webhook_1' }],
				},
				{
					id: 'webhook_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						type: 'webhook',
						parameters: {
							endpoint: '/pipe/process',
							port: 5566,
						},
					},
				},
			],
		},
	},
	audioTranscribe: {
		pipeline: {
			source: 'source_1',
			components: [
				{
					id: 'source_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						parameters: {
							endpoint: '/pipe/process',
							port: 5566,
						},
					},
				},
				{
					id: 'audio_transcribe_1',
					provider: 'audio_transcribe',
					config: {
						default: {
							max_seconds: 500,
							min_seconds: 240,
							model: 'medium',
							silence_threshold: 0.25,
							vad_level: 2,
						},
						profile: 'default',
					},
					input: [{ lane: 'audio', from: 'source_1' }],
				},
				{
					id: 'response_1',
					provider: 'response',
					config: {
						keys: {
							documents: 'procdocs',
						},
					},
					input: [{ lane: 'text', from: 'audio_transcribe_1' }],
				},
			],
		},
	},
	audioSummary: {
		pipeline: {
			source: 'source_1',
			components: [
				{
					id: 'source_1',
					provider: 'webhook',
					config: {
						key: 'webhook://*',
						mode: 'Source',
						name: 'Webhook Source',
						parameters: {
							endpoint: '/pipe/process',
							port: 5566,
						},
					},
				},
				{
					id: 'audio_transcribe_1',
					provider: 'audio_transcribe',
					config: {
						default: {
							max_seconds: 500,
							min_seconds: 240,
							model: 'medium',
							silence_threshold: 0.25,
							vad_level: 2,
						},
						profile: 'default',
					},
					input: [{ lane: 'audio', from: 'source_1' }],
				},
				{
					id: 'summary_1',
					provider: 'summary',
					config: {
						max_length: 150,
						min_length: 30,
					},
					input: [{ lane: 'text', from: 'audio_transcribe_1' }],
				},
				{
					id: 'response_1',
					provider: 'response',
					config: {
						keys: {
							documents: 'procdocs',
						},
					},
					input: [
						{ lane: 'text', from: 'audio_transcribe_1' },
						{ lane: 'text', from: 'summary_1' },
					],
				},
			],
		},
	},
};

// Delay function to replace setTimeout (n8n Cloud compatible)
// Note: In n8n Cloud, we cannot use setTimeout/setImmediate
// For short delays, we resolve immediately to avoid blocking
function delay(ms: number): Promise<void> {
	// For n8n Cloud compatibility, we skip delays > 100ms
	// The client SDK should handle timing internally
	if (ms > 100) {
		return Promise.resolve();
	}
	// For very short delays, use a minimal wait
	return new Promise((resolve) => {
		const start = Date.now();
		// Minimal delay for very short waits only
		const check = () => {
			if (Date.now() - start >= ms) {
				resolve();
			} else {
				// Use a microtask for next check (more compatible)
				Promise.resolve().then(check);
			}
		};
		check();
	});
}

// Helper function to execute pipeline with event handling
async function executePipelineWithEvents(
	client: any,
	pipelineName: string,
	fileBuffer: Buffer,
	fileName: string,
	logger: any,
): Promise<any> {
	await client.connect();
	logger.info('Connected to Aparavi');
	
	// Get pipeline config from embedded constants
	const pipelineConfig = JSON.parse(JSON.stringify(PIPELINE_CONFIGS[pipelineName]));
	if (!pipelineConfig) {
		throw new Error(`Pipeline configuration not found for: ${pipelineName}`);
	}
	logger.info(`Starting pipeline: ${pipelineName}`);
	
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
					logger.debug(`Removed parameters object from webhook component: ${component.id}`);
				}
				// Set sync: false as additional safeguard
				component.config.sync = false;
				logger.debug(`Set sync: false for webhook component: ${component.id}`);
			}
		}
	}
	
	const pipelineResult = await client.use({
		pipeline: pipelineConfig,
		threads: 4
	});
	logger.info(`Pipeline started with token: ${pipelineResult.token}`);

	// Wait for webhook server to be ready (if pipeline uses webhook)
	// The SDK needs time to start the local HTTP server
	logger.debug('Waiting for pipeline server to be ready...');
	await delay(3000); // Wait 3 seconds for server to start

	// Send file to pipeline with metadata
	logger.debug('Sending file to pipeline...');
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
			logger.debug(`File sent, response: ${JSON.stringify(sendResponse)}`);
			break; // Success, exit retry loop
		} catch (error: any) {
			const errorMsg = error.message || String(error);
			const isConnectionError = errorMsg.includes('Connect call failed') || 
			                          errorMsg.includes('ECONNREFUSED') ||
			                          errorMsg.includes('connection refused');
			
			if (isConnectionError && attempt < maxRetries - 1) {
				logger.warn(`Connection error (attempt ${attempt + 1}/${maxRetries}), waiting ${retryDelay}ms before retry...`);
				await delay(retryDelay);
				retryDelay *= 1.5; // Exponential backoff
			} else {
				// Either not a connection error, or we've exhausted retries
				throw error;
			}
		}
	}

	// The response should contain the parsed results directly
	if (sendResponse && (sendResponse.text || sendResponse.result || sendResponse.data || sendResponse.documents)) {
		logger.info('Parsed results received in response!');
		await client.disconnect();
		logger.info('Disconnected from Aparavi');
		return sendResponse;
	}
	
	// If no results in immediate response, wait a bit and check status
	logger.debug('Waiting for processing to complete...');
	await delay(3000);
	
	try {
		const status = await client.getTaskStatus(pipelineResult.token);
		logger.debug(`Final status: ${JSON.stringify(status)}`);
	} catch (error: any) {
		logger.warn(`Status check failed: ${error.message}`);
	}
	
	await client.disconnect();
	logger.info('Disconnected from Aparavi');
	
	return sendResponse;
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
		
		// Require client inside execute function (n8n Cloud compatible)
		const { AparaviClient: AparaviDTCClient } = require('aparavi-client');
		const client = new AparaviDTCClient({
			auth: credentials.apiKey as string,
			uri: wsUrl
		});
		
		// Log custom base URL usage
		if (customBaseUrl && customBaseUrl.trim() !== '') {
			this.logger.info(`Using custom base URL: ${baseUrl}`);
			this.logger.debug(`WebSocket URI: ${wsUrl}`);
		} else {
			this.logger.info(`Using default base URL: ${baseUrl}`);
			this.logger.debug(`WebSocket URI: ${wsUrl}`);
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

						this.logger.info('Custom Pipeline - Processing...');
						await client.executePipelineWorkflow(pipeline);
						result = { token: client.token, status: 'started' };
						this.logger.info(`Custom Pipeline - Pipeline started with token: ${client.token}`);
						break;
					}

					case 'simpleOCR': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							const filePath = this.getNodeParameter('filePath', i) as string;
							// For file paths, we need to read the file - but n8n Cloud doesn't allow fs
							// This operation requires file system access, which is not available in n8n Cloud
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.pdf`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for OCR operation');
						}

						this.logger.info(`Simple OCR - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'simpleOCR', fileBuffer, fileName, this.logger);
							this.logger.debug(`Simple OCR - Result: ${JSON.stringify(result)}`);
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Simple OCR failed: ${error.message}`);
						}
						break;
					}

					case 'simpleParse': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.pdf`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Parse operation');
						}

						this.logger.info(`Simple Parse - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'simpleParse', fileBuffer, fileName, this.logger);
							this.logger.debug(`Simple Parse - Result: ${JSON.stringify(result)}`);
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Simple Parse failed: ${error.message}`);
						}
						break;
					}

					case 'audioTranscribe': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.wav`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Audio Transcribe operation');
						}

						this.logger.info(`Audio Transcribe - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'audioTranscribe', fileBuffer, fileName, this.logger);
							this.logger.debug(`Audio Transcribe - Result: ${JSON.stringify(result)}`);
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Audio Transcribe failed: ${error.message}`);
						}
						break;
					}

					case 'audioSummary': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.wav`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Audio Summary operation');
						}

						this.logger.info(`Audio Summary - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'audioSummary', fileBuffer, fileName, this.logger);
							this.logger.debug(`Audio Summary - Result: ${JSON.stringify(result)}`);
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

						this.logger.info('Anonymize PII - Processing text data');
						result = await client.anonymizePII(textData);
						this.logger.debug(`Anonymize PII - Result: ${JSON.stringify(result)}`);
						break;
					}

					case 'advancedParser': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.pdf`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for Advanced Parser operation');
						}

						this.logger.info(`Advanced Parser - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'advancedParser', fileBuffer, fileName, this.logger);
							this.logger.debug(`Advanced Parser - Result: ${JSON.stringify(result)}`);
						} catch (error: any) {
							throw new NodeOperationError(this.getNode(), `Advanced Parser failed: ${error.message}`);
						}
						break;
					}

					case 'llamaparse': {
						let fileBuffer: Buffer;
						let fileName: string;
						if (inputType === 'file') {
							throw new NodeOperationError(this.getNode(), 'File path input is not supported in n8n Cloud. Please use binary data input instead.');
						} else if (inputType === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const item = items[i];
							const binaryData = item.binary?.[binaryPropertyName];
							fileName = binaryData?.fileName || `file_${Date.now()}.pdf`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Text input not supported for LlamaParse operation');
						}

						this.logger.info(`LlamaParse - Processing file: ${fileName}`);
						
						try {
							result = await executePipelineWithEvents(client, 'llamaparse', fileBuffer, fileName, this.logger);
							this.logger.debug(`LlamaParse - Result: ${JSON.stringify(result)}`);
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

						this.logger.info(`PII Censor (${piiTypeForCensor.toUpperCase()}) - Processing data`);
						result = await client.executePipeline(pipelineConfig);
						this.logger.debug(`PII Censor - Result: ${JSON.stringify(result)}`);
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
