#!/usr/bin/env node

console.log('🔍 Verifying n8n node structure...\n');

const path = require('path');
const fs = require('fs');

// Check if the node directory exists
const nodeDir = path.join(process.env.HOME, '.n8n/custom/nodes/n8n-nodes-aparavi-pii');
const nodeDir2 = path.join(process.env.HOME, '.n8n/nodes/n8n-nodes-aparavi-pii');

console.log('1. Checking node directories...');
console.log(`   📁 Custom nodes: ${fs.existsSync(nodeDir) ? '✅' : '❌'} ${nodeDir}`);
console.log(`   📁 Main nodes: ${fs.existsSync(nodeDir2) ? '✅' : '❌'} ${nodeDir2}`);

// Check required files
const requiredFiles = [
  'package.json',
  'index.js',
  'nodes/AparaviPII/AparaviPII.node.js',
  'credentials/AparaviApi.credentials.js',
  'aparavi-universal-pii.js'
];

console.log('\n2. Checking required files...');
requiredFiles.forEach(file => {
  const fullPath = path.join(nodeDir, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test node loading
console.log('\n3. Testing node loading...');
try {
  const pkg = require(path.join(nodeDir, 'index.js'));
  console.log('   ✅ Package loads successfully');
  console.log(`   📦 Nodes: ${Object.keys(pkg.nodes).join(', ')}`);
  console.log(`   🔑 Credentials: ${Object.keys(pkg.credentials).join(', ')}`);
  
  // Test node instantiation
  const node = new pkg.nodes.AparaviPII();
  console.log(`   🏷️  Node name: ${node.description.name}`);
  console.log(`   📝 Display name: ${node.description.displayName}`);
  console.log(`   🔌 Inputs: ${node.description.inputs.join(', ')}`);
  console.log(`   🔌 Outputs: ${node.description.outputs.join(', ')}`);
  
} catch (error) {
  console.log(`   ❌ Error loading node: ${error.message}`);
}

// Check package.json n8n configuration
console.log('\n4. Checking package.json n8n configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(nodeDir, 'package.json'), 'utf8'));
  if (packageJson.n8n) {
    console.log('   ✅ n8n configuration found');
    console.log(`   📋 API Version: ${packageJson.n8n.n8nNodesApiVersion}`);
    console.log(`   🔧 Nodes: ${packageJson.n8n.nodes.join(', ')}`);
    console.log(`   🔑 Credentials: ${packageJson.n8n.credentials.join(', ')}`);
  } else {
    console.log('   ❌ No n8n configuration found in package.json');
  }
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

console.log('\n🎯 Summary:');
console.log('   If all checks pass, the node should work in n8n.');
console.log('   Make sure to restart n8n after installation.');
console.log('   Use the start-n8n-with-node.sh script for best results.');
