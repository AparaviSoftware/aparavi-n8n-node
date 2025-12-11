#!/usr/bin/env node

/**
 * Test script for Anonymize PII pipeline
 * Tests the anonymizePII functionality with sample text containing PII
 */

// Note: This test requires the compiled node to be available
// Run: npm run build first, then: node test-anonymize-pii.js

const apiKey = process.env.APARAVI_API_KEY || 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';
const baseUrl = process.env.APARAVI_BASE_URL || 'https://eaas-dev.aparavi.com';

// Sample text with PII for testing
const testText = `
John Smith
Email: john.smith@example.com
Phone: (555) 123-4567
SSN: 123-45-6789
Address: 123 Main Street, Anytown, CA 12345
Credit Card: 4532-1234-5678-9010
Date of Birth: 01/15/1985
`;

// Simple HTTP client implementation for testing
class TestAparaviHttpClient {
  constructor(apiKey, baseUrl = 'https://eaas-dev.aparavi.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/:\d+$/, ''); // Remove port if present
  }

  getBuiltinModule(name) {
    try {
      return require(name);
    } catch (e) {
      return null;
    }
  }

  async makeRequest(method, path, data = null, queryParams = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      const https = this.getBuiltinModule('https');
      const http = this.getBuiltinModule('http');
      const url = this.getBuiltinModule('url');

      const urlObj = new url.URL(path, this.baseUrl);
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          urlObj.searchParams.append(key, String(value));
        }
      });

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const httpModule = urlObj.protocol === 'https:' ? https : http;

      const req = httpModule.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk.toString();
        });
        res.on('end', () => {
          try {
            if (!body || body.trim().length === 0) {
              resolve({ status: res.statusCode, data: null, headers: res.headers });
              return;
            }
            const jsonBody = JSON.parse(body);
            resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, data: body || null, headers: res.headers });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        if (Buffer.isBuffer(data)) {
          req.write(data);
        } else if (typeof data === 'string') {
          req.write(data);
        } else {
          req.write(JSON.stringify(data));
        }
      }

      req.end();
    });
  }

  async use(options) {
    const queryParams = {};
    if (options.token) queryParams.token = options.token;
    if (options.threads) queryParams.threads = options.threads;

    const response = await this.makeRequest('POST', '/task', options.pipeline, queryParams);
    
    if (response.status !== 200) {
      const errorMsg = response.data?.error?.message || response.data?.message || response.data || 'Pipeline execution failed';
      throw new Error(`Pipeline execution failed (status ${response.status}): ${errorMsg}`);
    }

    if (!response.data) {
      throw new Error('No response data returned from pipeline execution');
    }

    const token = response.data.data?.token || response.data.token;
    if (!token) {
      throw new Error(`No token returned from pipeline execution. Response: ${JSON.stringify(response.data)}`);
    }

    return { token, data: response.data };
  }

  async send(token, data, metadata = {}) {
    const url = this.getBuiltinModule('url');
    const http = this.getBuiltinModule('http');
    const https = this.getBuiltinModule('https');

    const urlObj = new url.URL('/task/data', this.baseUrl);
    urlObj.searchParams.append('token', token);
    if (metadata?.filename) {
      urlObj.searchParams.append('filename', metadata.filename);
    }

    const contentType = metadata?.mimetype || 'application/octet-stream';
    const contentDisposition = metadata?.filename ? `attachment; filename="${metadata.filename}"` : undefined;

    return new Promise((resolve, reject) => {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': contentType,
        'Content-Length': data.length
      };

      if (contentDisposition) {
        headers['Content-Disposition'] = contentDisposition;
      }

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: headers
      };

      const httpModule = urlObj.protocol === 'https:' ? https : http;

      const req = httpModule.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk.toString();
        });
        res.on('end', () => {
          try {
            const jsonBody = JSON.parse(responseBody);
            if (res.statusCode !== 200) {
              reject(new Error(jsonBody.error?.message || jsonBody.message || 'Data send failed'));
            } else {
              resolve(jsonBody.data || jsonBody);
            }
          } catch (e) {
            if (res.statusCode !== 200) {
              reject(new Error(responseBody || 'Data send failed'));
            } else {
              resolve(responseBody);
            }
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async getTaskStatus(token) {
    const response = await this.makeRequest('GET', '/task', null, { token });
    
    if (response.status !== 200) {
      throw new Error(response.data?.error?.message || response.data?.message || 'Status check failed');
    }

    return response.data.data || response.data;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async anonymizePII(input, fileName, isFile = false) {
    // Determine if we need to parse first (for PDFs and other documents)
    const needsParsing = isFile || (fileName && /\.(pdf|doc|docx)$/i.test(fileName));
    
    console.log(`📋 Creating PII anonymization pipeline (${needsParsing ? 'with parsing' : 'text only'})...`);
    
    let pipeline;
    
    if (needsParsing) {
      // Pipeline for documents: webhook → parse → pii → response
      pipeline = {
      pipeline: {
        source: 'webhook_1',
        components: [
          {
            id: 'webhook_1',
            provider: 'webhook',
            config: {
              key: 'webhook://*',
              mode: 'Source',
              sync: false,
            },
          },
            {
              id: 'parse_1',
              provider: 'parse',
              input: [{ lane: 'tags', from: 'webhook_1' }],
              config: {},
            },
            {
              id: 'pii_1',
              provider: 'pii',
              input: [{ lane: 'text', from: 'parse_1' }],
              config: {
                profile: 'default',
                multilingual: {
                  enabled: false,
                },
                default: {
                  classification: 'United States Personal Data Policy',
                  description: 'Detects personal data applicable to United States Federal and State laws',
                  lanes: [],
                },
              },
            },
            {
              id: 'response_1',
              provider: 'response',
              input: [{ lane: 'text', from: 'pii_1' }],
              config: {
                keys: {
                  documents: 'procdocs',
                },
              },
            },
          ],
        },
      };
    } else {
      // Pipeline for text: webhook → pii → response
      pipeline = {
        pipeline: {
          source: 'webhook_1',
          components: [
            {
              id: 'webhook_1',
              provider: 'webhook',
              config: {
                key: 'webhook://*',
                mode: 'Source',
                sync: false,
              },
            },
            {
              id: 'pii_1',
              provider: 'pii',
              input: [{ lane: 'text', from: 'webhook_1' }],
              config: {
                profile: 'default',
                multilingual: {
                  enabled: false,
                },
                default: {
                  classification: 'United States Personal Data Policy',
                  description: 'Detects personal data applicable to United States Federal and State laws',
                  lanes: [],
                },
              },
            },
            {
              id: 'response_1',
              provider: 'response',
              input: [{ lane: 'text', from: 'pii_1' }],
              config: {
                keys: {
                  documents: 'procdocs',
                },
              },
            },
          ],
        },
      };
    }

    try {
      console.log('🚀 Starting pipeline...');
      const result = await this.use({ pipeline });
      
      if (!result || !result.token) {
        throw new Error('Failed to start pipeline: No token returned');
      }
      
      console.log(`✅ Pipeline started with token: ${result.token.substring(0, 20)}...`);
      
      // Wait for pipeline to initialize
      console.log('⏳ Waiting 5 seconds for pipeline to initialize...');
      await this.delay(5000);
      
      // Prepare data to send
      let dataBuffer;
      let mimeType;
      let finalFileName;
      
      if (needsParsing && Buffer.isBuffer(input)) {
        // File buffer (PDF, etc.)
        dataBuffer = input;
        mimeType = fileName?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
        finalFileName = fileName || 'document.pdf';
      } else {
        // Text string
        dataBuffer = Buffer.from(input, 'utf-8');
        mimeType = 'text/plain';
        finalFileName = fileName || 'text.txt';
      }
      
      console.log(`📤 Sending ${needsParsing ? 'file' : 'text'} data to pipeline...`);
      await this.send(result.token, dataBuffer, {
        filename: finalFileName,
        mimetype: mimeType
      });
      
      console.log('✅ Data sent');
      
      // Wait for processing (longer timeout for PDFs)
      console.log('⏳ Waiting for processing to complete...');
      let status = await this.getTaskStatus(result.token);
      const maxWaitTime = needsParsing ? 120000 : 60000; // 2 minutes for PDFs, 1 minute for text
      const startTime = Date.now();
      
      while (status && status.status !== 'completed' && status.status !== 'failed' && (Date.now() - startTime) < maxWaitTime) {
        await this.delay(2000);
        status = await this.getTaskStatus(result.token);
        if (status && status.status) {
          console.log(`   Status: ${status.status}`);
        }
      }
      
      if (!status) {
        throw new Error('Pipeline status check returned null');
      }
      
      if (status.status === 'failed') {
        throw new Error(`Pipeline failed: ${JSON.stringify(status)}`);
      }
      
      return status;
    } catch (error) {
      const errorMsg = error.message || String(error);
      throw new Error(`PII anonymization failed: ${errorMsg}`);
    }
  }
}

async function testAnonymizePII() {
  console.log('🧪 Testing Anonymize PII Pipeline with PDF\n');
  console.log('=' .repeat(60));
  console.log('Configuration:');
  console.log(`  API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log('=' .repeat(60));
  
  const testPdfPath = '/Users/armin/Downloads/pdfcrowd.pdf';
  const fs = require('fs');
  
  if (!fs.existsSync(testPdfPath)) {
    console.error(`\n❌ Test PDF not found: ${testPdfPath}`);
    process.exit(1);
  }
  
  console.log(`\n📄 Test PDF: ${testPdfPath}`);
  const stats = fs.statSync(testPdfPath);
  console.log(`📊 File size: ${stats.size} bytes`);
  console.log('=' .repeat(60));
  console.log('');

  try {
    const client = new TestAparaviHttpClient(apiKey, baseUrl);
    
    // Read PDF file
    const pdfBuffer = fs.readFileSync(testPdfPath);
    const fileName = require('path').basename(testPdfPath);
    
    console.log(`📤 Sending PDF file: ${fileName} (${pdfBuffer.length} bytes)\n`);
    
    const result = await client.anonymizePII(pdfBuffer, fileName, true);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Results:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if PII was detected/anonymized
    if (result.procdocs || result.data || result.result) {
      console.log('\n✅ Pipeline returned results');
      if (result.procdocs) {
        console.log(`   Found ${Array.isArray(result.procdocs) ? result.procdocs.length : 'some'} processed documents`);
      }
    } else {
      console.log('\n⚠️  Pipeline completed but no results found in response');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testAnonymizePII();

