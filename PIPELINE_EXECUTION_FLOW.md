# Pipeline Execution Flow Comparison

## Overview
This document compares the pipeline execution flow between the test script (`test-simple-parse-http.js`) and the n8n node implementation.

## Flow Comparison

### ✅ **Same Steps (Both Implementations)**

1. **Load Pipeline Configuration**
   - Test: Loads from `predefinedPipelines/simple_parser.json`
   - n8n Node: Uses embedded `PIPELINE_CONFIGS[pipelineName]`
   - Both: Clean webhook config (remove parameters, set sync: false)

2. **Start Pipeline**
   - Both: Call `client.use({ pipeline, threads: 4 })`
   - Both: Get token from response

3. **Send File with Retry Logic**
   - Both: Retry with exponential backoff (5 attempts)
   - Both: Handle connection errors (ECONNREFUSED, ETIMEDOUT)
   - Both: Determine mimetype from file extension

4. **Check Results**
   - Both: Check if results in `sendResponse`
   - Both: Wait 3 seconds and check status if no immediate results
   - Both: Return results from status or sendResponse

### ⚠️ **Differences (Now Fixed)**

#### **Before Update:**
- **Test Script**: Waited 5+ seconds + status polling before sending file
- **n8n Node**: Sent file immediately after starting pipeline (no wait)

#### **After Update:**
- **Both**: Now wait for backend initialization before sending file
- **Both**: Poll status to ensure pipeline is ready
- **Both**: Additional wait after status shows ready

## Updated Flow (Both Now Match)

```typescript
1. Load/Create Pipeline Config
   ↓
2. Fix Webhook Config (remove parameters, set sync: false)
   ↓
3. Start Pipeline (POST /task) → Get Token
   ↓
4. Wait for Backend Initialization
   ├─ Initial 5 second wait
   ├─ Poll status (up to 10 attempts, 2 sec intervals)
   └─ Additional 2 second wait after ready
   ↓
5. Send File (POST /task/data) with Retry Logic
   ├─ 5 retry attempts
   ├─ Exponential backoff (2s, 3s, 4.5s, 6.75s, 10.125s)
   └─ Handle connection errors
   ↓
6. Check Results
   ├─ Check sendResponse for immediate results
   ├─ Wait 3 seconds
   └─ Check status (GET /task) for results
   ↓
7. Return Results
```

## Key Insight

**The backend needs time to create internal client connections before it can process data.**

This was discovered during testing:
- Without the wait: Backend errors about localhost connection failures
- With the wait: Successful processing with extracted text, tables, and metadata

## API Endpoints Used

1. **POST /task** - Start pipeline execution
   - Returns: `{ token: string, data: any }`

2. **POST /task/data** - Send data to running pipeline
   - Query params: `token`, `filename` (optional)
   - Body: File binary data
   - Returns: Processing results or acknowledgment

3. **GET /task** - Get pipeline status
   - Query params: `token`
   - Returns: Status and results

4. **POST /pipe/validate** - Validate pipeline (optional, test script only)
   - Body: Pipeline configuration
   - Returns: Validation result

## Testing

The test script (`test-simple-parse-http.js`) now matches the n8n node flow:

```bash
# Test with any document
node test-simple-parse-http.js /path/to/document.pdf
node test-simple-parse-http.js /path/to/document.docx
```

## Notes

- The initialization wait is critical for reliable pipeline execution
- The retry logic handles transient connection issues
- Status polling ensures the backend is ready before sending data
- Results can be in `sendResponse` (immediate) or `status.objects.body` (after processing)

