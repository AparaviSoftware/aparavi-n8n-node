# Prebuilt Parser Test Results

## Test File
- **File**: `APFS_Assembly_Process_Qualification_Data_1762995216229.pdf`
- **Size**: 4683.12 KB
- **Location**: `/Users/armin/Downloads/`

## Test Script
Created `test-all-parsers.js` to test all 5 prebuilt parser pipelines:
1. Simple Parser (`simple_parser.json`)
2. Parse Webhook (`parse_webhook.json`)
3. Simple OCR (`simple_ocr_webhook.json`)
4. Advanced Parser (`advanced_parser_webhook.json`)
5. LlamaParse (`llamaparse_webhook.json`)

## Current Status

### Issue Identified
All webhook-based pipelines are encountering a **localhost connection error** when trying to send files:

```
Error: Multiple exceptions: [Errno 111] Connect call failed ('::1', 20115, 0, 0), 
[Errno 111] Connect call failed ('127.0.0.1', 20115)
```

This error occurs in the `client.send()` method when trying to establish a data pipe connection to localhost ports.

### Root Cause
Webhook pipelines with `parameters` configuration (port/endpoint) try to establish a local HTTP server connection for data transfer. When using `client.send()` directly, this localhost connection attempt fails because:
1. The SDK tries to connect to localhost ports specified in webhook parameters
2. No local server is running on those ports
3. The file upload fails before the file is actually sent

### Test Results
- ✅ **Pipeline Start**: All pipelines start successfully using `filepath` approach
- ❌ **File Upload**: All file uploads fail with localhost connection error
- ❌ **Results**: No results received because files aren't uploaded

## Next Steps

### Option 1: Use Non-Webhook Pipelines
Test with pipelines that don't use webhook sources (if available).

### Option 2: Modify Pipeline Configuration
Remove `parameters` from webhook config before loading (requires using pipeline object instead of filepath).

### Option 3: Use Alternative Upload Method
Investigate if there's an alternative method to upload files that bypasses the localhost connection requirement.

### Option 4: Set Up Local Server
Configure a local server to handle the webhook connections (complex, not recommended for testing).

## Test Script Features

The test script (`test-all-parsers.js`) includes:
- ✅ Event-based result capture
- ✅ 120-second timeout for large file processing
- ✅ Status checking as fallback
- ✅ Comprehensive error handling
- ✅ Detailed result analysis
- ✅ Summary report

## Usage

```bash
node test-all-parsers.js /path/to/test.pdf
```

The script will:
1. Test each parser pipeline sequentially
2. Display detailed results for each
3. Provide a summary at the end




