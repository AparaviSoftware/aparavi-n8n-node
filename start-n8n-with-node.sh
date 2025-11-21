#!/bin/bash

echo "🚀 Starting n8n with Aparavi PII Censor node..."

# Set environment variables to help n8n detect custom nodes
export N8N_CUSTOM_EXTENSIONS="/Users/jamestucker/.n8n/custom/nodes"
export N8N_NODES_INCLUDE="n8n-nodes-aparavi-pii"

# Optional: Set other recommended n8n environment variables
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export DB_SQLITE_POOL_SIZE=10
export N8N_RUNNERS_ENABLED=true
export N8N_BLOCK_ENV_ACCESS_IN_NODE=false

echo "📁 Custom nodes directory: $N8N_CUSTOM_EXTENSIONS"
echo "🔧 Node to include: $N8N_NODES_INCLUDE"
echo ""

# Start n8n
n8n start
