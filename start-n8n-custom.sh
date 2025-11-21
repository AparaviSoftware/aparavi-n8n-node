#!/bin/bash

echo "🚀 Starting n8n with Aparavi PII Censor custom node..."
echo ""

# Set the custom extensions directory
export N8N_CUSTOM_EXTENSIONS="/Users/jamestucker/.n8n/custom"

# Optional: Set other recommended n8n environment variables
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export DB_SQLITE_POOL_SIZE=10
export N8N_RUNNERS_ENABLED=true
export N8N_BLOCK_ENV_ACCESS_IN_NODE=false

echo "📁 Custom extensions directory: $N8N_CUSTOM_EXTENSIONS"
echo "🔧 Available custom nodes:"
ls -la "$N8N_CUSTOM_EXTENSIONS" | grep n8n-nodes
echo ""

# Test that the node loads
echo "🧪 Testing node loading..."
if node -e "const pkg = require('$N8N_CUSTOM_EXTENSIONS/n8n-nodes-aparavi-pii/index.js'); console.log('✅ Aparavi PII Censor node loaded successfully');" 2>/dev/null; then
    echo "✅ Node test passed - ready to start n8n"
else
    echo "❌ Node test failed - check the node installation"
    exit 1
fi

echo ""
echo "🎯 Starting n8n..."
echo "   Look for 'Aparavi PII Censor' in the Transform category"
echo "   Look for 'Aparavi API' in the credentials list"
echo ""

# Start n8n
n8n start
