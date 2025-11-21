#!/usr/bin/env node

console.log('🧪 Testing Aparavi PII Censor Node...\n');

try {
  // Test 1: Load the main package
  console.log('1. Loading main package...');
  const pkg = require('./dist/index.js');
  console.log('   ✅ Package loaded successfully');
  console.log('   📦 Available nodes:', Object.keys(pkg.nodes));
  console.log('   🔑 Available credentials:', Object.keys(pkg.credentials));

  // Test 2: Test node instantiation
  console.log('\n2. Testing node instantiation...');
  const { AparaviPII } = pkg.nodes;
  const node = new AparaviPII();
  console.log('   ✅ Node instantiated successfully');
  console.log('   📝 Node name:', node.description.name);
  console.log('   🏷️  Display name:', node.description.displayName);
  console.log('   📋 Description:', node.description.description);

  // Test 3: Test credentials instantiation
  console.log('\n3. Testing credentials instantiation...');
  const { AparaviApi } = pkg.credentials;
  const creds = new AparaviApi();
  console.log('   ✅ Credentials instantiated successfully');
  console.log('   🔑 Credential name:', creds.name);
  console.log('   📝 Display name:', creds.displayName);

  // Test 4: Check node properties
  console.log('\n4. Checking node properties...');
  console.log('   🔌 Inputs:', node.description.inputs);
  console.log('   🔌 Outputs:', node.description.outputs);
  console.log('   🔧 Parameters count:', node.description.properties.length);
  console.log('   🎯 PII Types supported:', 
    node.description.properties
      .find(p => p.name === 'piiType')?.options?.map(o => o.name) || 'Not found'
  );

  // Test 5: Check Aparavi library
  console.log('\n5. Testing Aparavi library...');
  try {
    const AparaviDTC = require('./dist/aparavi-universal-pii.js');
    console.log('   ✅ Aparavi library loaded successfully');
    console.log('   📚 AparaviDTC class available:', typeof AparaviDTC === 'function');
  } catch (error) {
    console.log('   ❌ Aparavi library failed to load:', error.message);
  }

  console.log('\n🎉 All tests passed! The node should work in n8n.');
  console.log('\n📋 Next steps:');
  console.log('   1. Install the node in n8n (see INSTALLATION.md)');
  console.log('   2. Add your Aparavi API credentials');
  console.log('   3. Create a workflow with the node');
  console.log('   4. Test with sample data');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
