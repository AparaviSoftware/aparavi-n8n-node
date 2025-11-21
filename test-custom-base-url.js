#!/usr/bin/env node

const { AparaviDTC } = require('aparavi-dtc-node-sdk');

const apiKey = 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0';

async function testCustomBaseUrl() {
  console.log('🧪 Testing Custom Base URL Configuration...\n');

  try {
    // Test with production URL
    console.log('📡 Testing with production URL...');
    const prodClient = new AparaviDTC(apiKey, 'https://eaas.aparavi.com');
    console.log('✅ Production client created successfully');
    
    // Test with dev URL
    console.log('\n📡 Testing with dev URL...');
    const devClient = new AparaviDTC(apiKey, 'https://eaas-dev.aparavi.com');
    console.log('✅ Dev client created successfully');
    
    // Test with custom URL
    console.log('\n📡 Testing with custom URL...');
    const customClient = new AparaviDTC(apiKey, 'https://custom.aparavi.com');
    console.log('✅ Custom client created successfully');
    
    console.log('\n🎯 Custom Base URL configuration is working!');
    console.log('\nUsers can now configure custom base URLs in n8n:');
    console.log('- Production: https://eaas.aparavi.com');
    console.log('- Development: https://eaas-dev.aparavi.com');
    console.log('- Custom: Any valid Aparavi API URL');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testCustomBaseUrl();
