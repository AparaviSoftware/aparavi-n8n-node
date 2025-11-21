#!/bin/bash

echo "🚀 Starting n8n with Aparavi DTC custom nodes..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set the custom extensions directory to point to this project's dist folder
export N8N_CUSTOM_EXTENSIONS="$SCRIPT_DIR/dist"

# Optional: Set other recommended n8n environment variables
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
export N8N_BLOCK_ENV_ACCESS_IN_NODE=false

echo "📁 Custom extensions directory: $N8N_CUSTOM_EXTENSIONS"
echo ""
echo "🔧 Available node:"
echo "   - Aparavi DTC (Transform category) - Unified node with all operations"
echo ""
echo "🔑 Don't forget to set up your Aparavi API credentials!"
echo "   Get your free API key at: https://dtc.aparavi.com/usage"
echo ""
echo "🎯 Starting n8n..."
echo "   Access n8n at: http://localhost:5678"
echo ""

# Start n8n
n8n start


