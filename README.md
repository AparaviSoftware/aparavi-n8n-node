# Aparavi DTC & PII Censor Nodes for n8n

A comprehensive n8n community node package that provides powerful data processing capabilities using the Aparavi DTC (Data Transformation Cloud) service. This package includes two specialized nodes for OCR, document parsing, audio transcription, and PII/HIPAA data anonymization.

> **🚀 Get Started**: First, sign up for your free Aparavi API key at [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)

## 📦 Package Information

- **npm Package**: [aparavi-n8n-node](https://www.npmjs.com/package/aparavi-n8n-node)
- **Version**: 1.0.0
- **GitHub Repository**: [AparaviSoftware/aparavi-n8n-node](https://github.com/AparaviSoftware/aparavi-n8n-node)

## 🎯 Available Nodes

### 1. **Aparavi DTC Node** (Transform Category)
Comprehensive data processing with multiple operations:
- **Simple OCR** - Extract text from images (PNG, JPG, TIFF, BMP)
- **Simple Parse** - Parse documents (PDF, DOCX, TXT, HTML)
- **Audio Transcribe** - Convert audio to text (MP3, WAV, M4A, FLAC)
- **Audio to Summary** - Transcribe and summarize audio with Gemini AI
- **Anonymize PII** - Detect and anonymize PII/HIPAA data
- **Advanced Parser** - Advanced document parsing with classification
- **Custom Pipeline** - Run any custom Aparavi workflow

### 2. **Aparavi PII Censor Node** (Transform Category)
Specialized PII and HIPAA data anonymization:
- **USA PII** - SSN, driver license, phone, email, addresses
- **International PII** - Passport, international phone, national IDs
- **Healthcare Data (HIPAA)** - Patient names, medical records, insurance numbers

## ✨ Key Features

- **🔧 Console Logging** - Debug output for all operations
- **🛡️ Project ID Fix** - Automatically handles Aparavi project configuration
- **📁 Flexible Input** - Handles files, text, JSON, arrays, objects
- **🔄 Batch Processing** - Efficiently processes multiple items
- **⚡ Real-time Processing** - Fast and reliable data transformation
- **🛠️ Error Handling** - Robust error handling with continue-on-fail support
- **📊 Structure Preservation** - Maintains original data structure while processing

## 🚀 Quick Start

### Step 1: Get Your API Key
**Sign up for your free Aparavi API key**: [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)

### Step 2: Install the Package

#### Option A: Through n8n Community Nodes (Recommended)
1. **Open n8n** in your browser (usually `http://localhost:5678`)
2. **Go to Settings** → **Community Nodes**
3. **Click "Install a community node"**
4. **Enter package name**: `aparavi-n8n-node`
5. **Click "Install"**
6. **Restart n8n** (if prompted)

#### Option B: Manual Installation
```bash
# Install globally
npm install -g aparavi-n8n-node

# Or install locally in your n8n directory
cd ~/.n8n
npm install aparavi-n8n-node

# Restart n8n
n8n start
```

#### Option C: Copy to Custom Nodes Directory
```bash
# 1. Install the package
npm install aparavi-n8n-node

# 2. Copy to n8n custom nodes directory
cp -r node_modules/aparavi-n8n-node/dist ~/.n8n/custom/nodes/aparavi-n8n-node

# 3. Install dependencies
cd ~/.n8n/custom/nodes/aparavi-n8n-node
npm install --production

# 4. Restart n8n
n8n start
```

### Step 3: Configure Credentials
1. **Go to Settings** → **Credentials**
2. **Click "Add Credential"**
3. **Select "Aparavi API"**
4. **Enter your API key** from Step 1
5. **Click "Save"**

### Step 4: Configure Base URL (Optional)

Both nodes support custom base URL configuration:

#### Default Environment (Development)
- **Base URL**: `https://eaas-dev.aparavi.com` (default)
- **No configuration needed** - works out of the box

#### Production Environment
1. **Add Aparavi DTC Node** or **Aparavi PII Censor Node**
2. **Click "Options"** to expand advanced settings
3. **Set "Custom Base URL"**: `https://eaas.aparavi.com`
4. **Save the workflow**

#### Custom Environment
1. **Set "Custom Base URL"** to your Aparavi API URL
2. **Example**: `https://your-custom.aparavi.com`

### Step 5: Test the Installation

#### Verify Nodes Are Available
- ✅ **Aparavi DTC** appears in Transform category
- ✅ **Aparavi PII Censor** appears in Transform category
- ✅ **Aparavi API** appears in credentials list

#### Test with Simple Workflow
1. **Create new workflow**
2. **Add Manual Trigger**
3. **Add Aparavi DTC node**
4. **Select "Simple OCR" operation**
5. **Enter file path**: `/path/to/image.png`
6. **Execute workflow**

#### Expected Console Output
```
🌐 Using default base URL: https://eaas-dev.aparavi.com
🔍 Simple OCR - Processing file: /path/to/image.png
✅ Simple OCR - Result: { "status": "OK", "data": {...} }
```

## 📋 Usage Examples

### Document Processing with Aparavi DTC Node

#### Simple Parse (PDF Documents)
```
Operation: Simple Parse
Input: /path/to/document.pdf
Output: Extracted text, tables, and metadata
```

#### Simple OCR (Images)
```
Operation: Simple OCR
Input: /path/to/image.png
Output: Extracted text from image
```

#### Audio Transcription
```
Operation: Audio Transcribe
Input: /path/to/audio.mp3
Output: Transcribed text
```

### PII Anonymization with Aparavi PII Censor Node

#### Basic Text Censoring
**Input:**
```
"John Smith, SSN: 123-45-6789, Phone: (555) 123-4567, Email: john@example.com"
```

**Output:**
```
"████ ████, SSN: ███-██-████, Phone: (███) ███-████, Email: ███@███.███"
```

#### Object Processing
**Input:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "ssn": "987-65-4321",
  "phone": "(555) 987-6543"
}
```

**Output:**
```json
{
  "name": "████ ████",
  "email": "████@███.███",
  "ssn": "███-██-████",
  "phone": "(███) ███-████"
}
```

#### HIPAA Healthcare Data
**Input:**
```json
{
  "patientName": "Alice Williams",
  "ssn": "111-22-3333",
  "medicalRecord": "Patient Alice Williams has hypertension, prescribed Lisinopril 10mg"
}
```

**Output:**
```json
{
  "patientName": "████ ███████",
  "ssn": "███-██-████",
  "medicalRecord": "Patient ████ ███████ has hypertension, prescribed ████████ 10mg"
}
```

## 🔧 Console Logging

Both nodes include comprehensive console logging for debugging:

```
🔍 Simple OCR - Processing file: /path/to/image.png
✅ Simple OCR - Result: { "status": "OK", "data": {...} }

📄 Simple Parse - Processing file: /path/to/document.pdf
✅ Simple Parse - Result: { "status": "OK", "data": {...} }
```

## 📁 Supported File Types

### Aparavi DTC Node
- **Parser**: PDF, DOCX, TXT, HTML, and more
- **OCR**: PNG, JPG, JPEG, TIFF, BMP
- **Audio**: MP3, WAV, M4A, FLAC

### Aparavi PII Censor Node
- **Text**: Any text input
- **JSON**: Objects and arrays
- **Files**: Any file type (processed as text)

## 🛠️ Advanced Configuration

### Custom Pipelines
Use the **Custom Pipeline** operation to run any Aparavi workflow:

```json
{
  "pipeline": {
    "source": "webhook_1",
    "components": [
      {
        "id": "webhook_1",
        "provider": "webhook",
        "config": {
          "hideForm": true,
          "mode": "Source",
          "type": "webhook"
        }
      },
      {
        "id": "processor_1",
        "provider": "your-provider",
        "config": {
          "your-config": "value"
        },
        "input": [
          {
            "from": "webhook_1",
            "lane": "data"
          }
        ]
      }
    ]
  }
}
```

### Field-Specific Processing
Process only specific fields in your data:

```json
{
  "piiType": "usa",
  "inputDataMode": "specific",
  "fieldsToProcess": "name,ssn,email"
}
```

## 🔄 Error Handling

Both nodes include comprehensive error handling:

- **Connection Errors**: Handles API connection issues gracefully
- **Validation Errors**: Validates input data and parameters
- **Processing Errors**: Handles individual item processing failures
- **Continue on Fail**: Option to continue processing other items if one fails
- **Automatic Cleanup**: Properly disconnects and cleans up resources

## 📊 Output Structure

### Aparavi DTC Node Output
```json
{
  "status": "OK",
  "data": {
    "objectsRequested": 1,
    "objectsCompleted": 1,
    "types": { "text": "text" },
    "objects": {
      "object-id": {
        "name": "filename.pdf",
        "path": "filename.pdf",
        "text": ["Extracted text content..."],
        "table": [/* Extracted tables */],
        "image": [/* Extracted images */],
        "metadata": {
          "Content-Type": "application/pdf",
          "dc:created": "2025-09-19T21:56:14Z"
        }
      }
    }
  },
  "metrics": {
    "cpu": 2085.871,
    "output": 10274,
    "total_time": 2085.877,
    "requests": 1
  }
}
```

### Aparavi PII Censor Node Output
```json
{
  "operation": "anonymizePII",
  "result": {
    "status": "OK",
    "data": {
      "objectsRequested": 1,
      "objectsCompleted": 1,
      "objects": {
        "object-id": {
          "name": "input.json",
          "path": "input.json",
          "text": ["Anonymized text content..."]
        }
      }
    }
  }
}
```

## 🚀 Development Setup

For developers who want to contribute or modify the nodes:

### Prerequisites
- Node.js 16+
- npm or yarn
- n8n instance

### Local Development
```bash
# Clone the repository
git clone https://github.com/AparaviSoftware/aparavi-n8n-node.git
cd aparavi-n8n-node

# Install dependencies
npm install

# Build the package
npm run build

# Start n8n with custom nodes
./start-n8n-dev.sh
```

### Testing
```bash
# Test the SDK directly
node test-local-sdk.js

# Test specific operations
node test-pipeline-debug.js
```

## 📚 Documentation

- **INSTALLATION.md** - Detailed installation guide
- **QUICK_START.md** - Quick start guide
- **LOCAL_SDK_SETUP.md** - Local development setup
- **TROUBLESHOOTING_PROJECT_ID.md** - Troubleshooting guide

## 🔧 Troubleshooting

### Common Installation Issues

#### Nodes Don't Appear in n8n
```bash
# Check if package is installed
npm list -g aparavi-n8n-node

# Check n8n logs for errors
n8n start --log-level debug

# Restart n8n completely
# Stop n8n (Ctrl+C)
n8n start
```

#### Installation Errors
```bash
# Clear npm cache
npm cache clean --force

# Reinstall latest version
npm install -g aparavi-n8n-node@latest

# Check n8n version compatibility
n8n --version
```

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx instead
npx n8n-nodes-aparavi-dtc
```

#### Custom Base URL Not Working
- **Check URL format**: Must include `https://` or `http://`
- **Verify URL accessibility**: Test with `curl -I https://your-url.com`
- **Check console logs**: Look for base URL confirmation messages
- **Default fallback**: Leave empty to use `https://eaas-dev.aparavi.com`

### Verification Checklist

After installation, verify:
- [ ] **Nodes appear** in Transform category
- [ ] **Credentials available** (Aparavi API)
- [ ] **No errors** in n8n console
- [ ] **Can create workflows** with the nodes
- [ ] **API key works** (test with Simple OCR)
- [ ] **Console logging** shows base URL

### Environment-Specific Issues

#### Development Environment (`eaas-dev.aparavi.com`)
- **Default environment** - no configuration needed
- **May have pipeline conflicts** - wait for existing pipelines to finish
- **Console shows**: `🌐 Using default base URL: https://eaas-dev.aparavi.com`

#### Production Environment (`eaas.aparavi.com`)
- **Requires custom base URL** configuration
- **More stable** than dev environment
- **Console shows**: `🌐 Using custom base URL: https://eaas.aparavi.com`

## 🤝 Support

Need help? We're here to assist:

1. **Aparavi Discord**: [Join our Discord community](https://discord.gg/ur9sRvJt) and visit the #technical-support channel
2. **GitHub Issues**: [Report problems or request features](https://github.com/AparaviSoftware/aparavi-n8n-node/issues)
3. **n8n Community**: [n8n Community Forum](https://community.n8n.io/) for n8n-specific questions
4. **API Key Help**: [Get your free API key](https://dtc.aparavi.com/usage)

## 📝 Changelog

### v1.1.23
- ✅ **Custom Base URL Configuration** - Users can now configure custom Aparavi API URLs
- ✅ **Environment Flexibility** - Support for production, development, and custom environments
- ✅ **Enhanced Documentation** - Comprehensive n8n connection and troubleshooting guide
- ✅ **Console Logging** - Clear indication of which base URL is being used
- ✅ **Both Nodes Updated** - Aparavi DTC and Aparavi PII Censor nodes support custom URLs

### v1.1.22
- ✅ **Dev Environment Default** - Package now defaults to `eaas-dev.aparavi.com`
- ✅ **Updated API Configuration** - All API calls point to development environment
- ✅ **Console Logging** - Debug output shows environment URL

### v1.1.21
- ✅ **Updated README** - Comprehensive documentation with both nodes
- ✅ **Console Logging** - Debug output for all operations
- ✅ **Project ID Fix** - Automatic handling of Aparavi project configuration
- ✅ **Local SDK Integration** - Uses working local SDK with project_id fix
- ✅ **Enhanced Error Handling** - Improved error handling and cleanup
- ✅ **Updated Documentation** - Comprehensive usage examples and guides

### v1.1.20
- ✅ **Published to npm** - Package now available as `n8n-nodes-aparavi-dtc`
- ✅ **Added Aparavi DTC Node** - Comprehensive data processing capabilities
- ✅ **Console Logging** - Debug output for all operations
- ✅ **Project ID Fix** - Automatic handling of Aparavi project configuration
- ✅ **Local SDK Integration** - Uses working local SDK with project_id fix
- ✅ **Enhanced Error Handling** - Improved error handling and cleanup
- ✅ **Updated Documentation** - Comprehensive usage examples and guides

### v1.1.1
- Enhanced PII and HIPAA data detection
- Improved error handling and validation
- Streamlined configuration options
- Updated documentation and examples

### v1.0.0
- Initial release
- Support for USA PII, International PII, and HIPAA data
- Flexible input handling for any data type
- Comprehensive error handling

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to get started?** Install the package and begin processing your data with powerful Aparavi DTC capabilities! 🚀