#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simulate the getPipelineFileName function
function getPipelineFileName(pipelineName) {
	// Try multiple possible paths (works in both source and built package)
	const possiblePaths = [
		path.join(__dirname, '..', '..', 'predefinedPipelines'), // Source
		path.join(__dirname, '..', '..', '..', 'predefinedPipelines'), // Built (from dist/nodes/AparaviUnified)
		path.join(process.cwd(), 'predefinedPipelines'), // Current working directory
		path.join(__dirname, 'predefinedPipelines'), // Same directory
	];
	
	const pipelineMap = {
		simpleOCR: 'simple_ocr_webhook.json',
		simpleParse: 'parse_webhook.json',
		advancedParser: 'advanced_parser_webhook.json',
		audioTranscribe: 'simple_audio_transcribe_webhook.json',
		audioSummary: 'audio_and_summary_webhook.json',
	};
	
	const fileName = pipelineMap[pipelineName] || 'parse_webhook.json';
	
	console.log('🔍 Testing path resolution for:', pipelineName);
	console.log('📁 Looking for file:', fileName);
	console.log('📂 Checking paths:');
	
	// Try each possible path
	for (const pipelinesDir of possiblePaths) {
		const filePath = path.join(pipelinesDir, fileName);
		console.log('   -', filePath, fs.existsSync(filePath) ? '✅ EXISTS' : '❌ NOT FOUND');
		if (fs.existsSync(filePath)) {
			console.log('✅ Found pipeline file:', filePath);
			return filePath;
		}
	}
	
	// If not found, return the relative path as fallback
	console.log('⚠️ Pipeline file not found, using fallback path');
	return `predefinedPipelines/${fileName}`;
}

// Test path resolution
console.log('🧪 Testing Pipeline Path Resolution...\n');

const testPipelines = ['simpleParse', 'simpleOCR', 'audioTranscribe', 'audioSummary', 'advancedParser'];

for (const pipeline of testPipelines) {
	console.log(`\n--- Testing ${pipeline} ---`);
	const filePath = getPipelineFileName(pipeline);
	console.log('Final path:', filePath);
	console.log('File exists:', fs.existsSync(filePath));
}

console.log('\n🎉 Path resolution test completed!');





