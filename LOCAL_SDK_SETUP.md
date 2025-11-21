# ✅ Local SDK Setup Complete!

## What Was Fixed

The issue "Missing expected pipeline node attributes 'project_id'" has been resolved by using your local Aparavi SDK which automatically adds `project_id = 'default'` to all pipeline requests.

### Changes Made:

1. **Linked Local SDK** - Updated `package.json` to use your local SDK:
   ```json
   "dependencies": {
     "aparavi-dtc-node-sdk": "file:../aparavi-dtc-node-sdk"
   }
   ```

2. **Verified Fix** - The local SDK's `wrapPipelinePayload.js` includes:
   ```javascript
   pipeline.pipeline.project_id ??= 'default';
   ```

3. **Tested Successfully** - Simple OCR pipeline now works correctly! ✅

## 🚀 Start Using n8n with Your Custom Nodes

### Start n8n:
```bash
./start-n8n-dev.sh
```

### Access n8n:
- URL: http://localhost:5678
- First time? You'll need to create an account

### Available Nodes:

#### 1. **Aparavi PII Censor** Node
- **Category**: Transform
- **Purpose**: Anonymize PII and HIPAA data
- **Types**: USA PII, International PII, Healthcare Data (HIPAA)

**Example Use:**
```
Input: "John Smith, SSN: 123-45-6789"
Output: "████ ████, SSN: ███-██-████"
```

#### 2. **Aparavi DTC** Node
- **Category**: Transform
- **Purpose**: Run any Aparavi DTC workflow
- **Operations**:
  - **Simple OCR** - Extract text from images
  - **Simple Parse** - Parse documents (PDF, DOCX)
  - **Audio Transcribe** - Transcribe audio to text
  - **Audio to Summary** - Transcribe + summarize
  - **Anonymize PII** - Detect and anonymize PII
  - **Custom Pipeline** - Run any custom workflow
  - **Advanced Parser** - Advanced document parsing

**Example Use:**
```
Operation: Simple OCR
Input: /path/to/image.png
Output: Extracted text from image
```

## 📝 Setup n8n Credentials

1. In n8n, go to **Settings** > **Credentials**
2. Click **Add Credential**
3. Select **Aparavi API**
4. Enter your API key: `oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0`
5. Click **Save**

## 🧪 Test the Integration

### Option 1: Test from Command Line
```bash
# Simple OCR test
node test-local-sdk.js
```

### Option 2: Test in n8n
1. Create a new workflow
2. Add a **Manual Trigger** node
3. Add **Aparavi DTC** node
4. Select **Simple OCR** operation
5. Enter a file path: `/Users/armin/Documents/aparavi-dtc-node-sdk/tests/files/test-ocr-1.png`
6. Connect the nodes
7. Click **Execute Workflow**

## 🔄 Development Workflow

When you make changes to the TypeScript code:

```bash
# 1. Make your changes to .ts files

# 2. Rebuild
npm run build

# 3. Restart n8n
# Press Ctrl+C to stop n8n
./start-n8n-dev.sh
```

## 📂 Project Structure

```
aparavi-dtc-n8n-sdk/          # Your n8n node package
├── nodes/
│   ├── AparaviDTC/           # DTC node (OCR, Parse, etc.)
│   └── AparaviPII/           # PII/HIPAA anonymization node
├── credentials/
│   └── AparaviApi.credentials.ts
├── dist/                      # Built JavaScript (committed)
└── node_modules/
    └── aparavi-dtc-node-sdk → # Symlinked to local SDK
        ../../aparavi-dtc-node-sdk/

aparavi-dtc-node-sdk/         # Local SDK (with project_id fix)
├── endpoints/
├── utils/
│   └── wrapPipelinePayload.js  # Contains project_id fix
└── predefinedPipelines/
```

## ✅ Verification

Run these commands to verify everything is set up correctly:

```bash
# Check SDK link
ls -la node_modules/aparavi-dtc-node-sdk
# Should show: ... -> ../../aparavi-dtc-node-sdk

# Test SDK directly
node test-local-sdk.js
# Should succeed with OCR results

# Check build
ls dist/nodes/
# Should show: AparaviDTC/ and AparaviPII/
```

## 🎯 Next Steps

1. **Start n8n**: `./start-n8n-dev.sh`
2. **Add credentials**: Your Aparavi API key
3. **Create workflows**: Use the example templates in `workflows/templates/`
4. **Build amazing automations!** 🚀

## 📚 Resources

- **API Key Dashboard**: https://dtc.aparavi.com/usage
- **Aparavi Discord**: https://discord.gg/ur9sRvJt (#technical-support)
- **n8n Documentation**: https://docs.n8n.io/
- **Workflow Templates**: See `workflows/templates/` directory

## 🐛 Troubleshooting

### Node doesn't appear in n8n
1. Check that n8n started without errors
2. Verify the build completed: `npm run build`
3. Check console for any error messages

### Pipeline execution fails
1. Verify your API key is correct
2. Check the file paths (use absolute paths)
3. Look at n8n's execution logs

### SDK changes not reflected
1. Rebuild: `npm run build`
2. Restart n8n (Ctrl+C then `./start-n8n-dev.sh`)

---

**Status**: 🟢 Ready to use!

Last Updated: October 16, 2025


