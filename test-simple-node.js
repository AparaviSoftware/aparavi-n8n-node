const { AparaviPII } = require('./dist/nodes/AparaviPII/AparaviPII.node.js');

// Test if we can create a simple workflow with the node
console.log('Testing node in a simple workflow...');

const node = new AparaviPII();
console.log('✅ Node created successfully');
console.log('📝 Node name:', node.description.name);
console.log('🏷️  Display name:', node.description.displayName);

// Test the execute function with mock data
const mockExecuteFunctions = {
  getInputData: () => [{ json: { test: 'data' } }],
  getNodeParameter: (name, index) => {
    const params = {
      operation: 'test',
      testData: 'usa'
    };
    return params[name] || '';
  },
  getCredentials: async (name) => {
    if (name === 'aparaviApi') {
      return { apiKey: 'test-key' };
    }
    return {};
  },
  continueOnFail: () => false,
  getNode: () => ({ name: 'Test Node' })
};

console.log('🧪 Testing node execution...');
node.execute.call(mockExecuteFunctions)
  .then(result => {
    console.log('✅ Node execution successful');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.log('❌ Node execution failed:', error.message);
  });
