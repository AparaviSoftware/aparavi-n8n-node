# Quick Start Guide

## ✅ Node Status: READY TO USE

The Aparavi PII Censor node has been successfully built and tested. Here's how to get it working in n8n:

## 🚀 Installation Steps

### Option 1: Install as npm package (Recommended)

1. **Install the package:**
   ```bash
   npm install -g /Users/jamestucker/projects/n8n-pii-node
   ```

2. **Restart n8n:**
   ```bash
   n8n start
   ```

### Option 2: Copy to n8n custom nodes

1. **Copy the dist folder to n8n custom nodes:**
   ```bash
   cp -r /Users/jamestucker/projects/n8n-pii-node/dist ~/.n8n/custom/nodes/n8n-nodes-aparavi-pii
   ```

2. **Install dependencies:**
   ```bash
   cd ~/.n8n/custom/nodes/n8n-nodes-aparavi-pii
   npm install
   ```

3. **Restart n8n:**
   ```bash
   n8n start
   ```

## 🔧 Configuration

1. **Add Aparavi API Credentials:**
   - Go to n8n Settings > Credentials
   - Click "Add Credential"
   - Select "Aparavi API"
   - Enter your Aparavi DTC API key

2. **Create a Workflow:**
   - Add a "Set" node with sample data
   - Add the "Aparavi PII Censor" node
   - Connect them together
   - Configure the node parameters

## 🧪 Test the Node

Run the test script to verify everything works:

```bash
cd /Users/jamestucker/projects/n8n-pii-node
node test-node.js
```

## 📋 What You Should See

After installation, you should see:
- ✅ "Aparavi PII Censor" in the node list (Transform category)
- ✅ "Aparavi API" in the credentials list
- ✅ Node parameters for PII type, input handling, etc.
- ✅ Test mode functionality

## 🔍 Troubleshooting

If the node doesn't appear:

1. **Check n8n logs:**
   ```bash
   n8n start --log-level debug
   ```

2. **Verify installation:**
   ```bash
   node test-node.js
   ```

3. **Check n8n custom nodes directory:**
   - Default: `~/.n8n/custom/`
   - Make sure the node files are there

4. **Restart n8n completely:**
   ```bash
   # Stop n8n
   # Then start again
   n8n start
   ```

## 📚 Next Steps

1. **Test with sample data** using the built-in test mode
2. **Create workflows** with real data
3. **Configure different PII types** (USA, International, HIPAA)
4. **Set up field-specific processing** for complex data structures

## 🎯 Node Features

- **Flexible Input**: Handles text, JSON, arrays, objects
- **Auto-detection**: Automatically detects data type
- **Multiple PII Types**: USA, International, HIPAA
- **Test Mode**: Built-in testing with sample data
- **Error Handling**: Robust error handling with continue-on-fail
- **Structure Preservation**: Maintains original data structure

The node is now ready to use! 🎉
