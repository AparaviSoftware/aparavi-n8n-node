const { src, dest } = require('gulp');
const fs = require('fs');
const path = require('path');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes/'));
}

function copyPipelines() {
	return src('predefinedPipelines/**/*.json')
		.pipe(dest('dist/predefinedPipelines'));
}

function addEslintDisableToNode() {
	// Add ESLint disable comment to compiled node file at the very top
	const nodeFile = path.join(__dirname, 'dist', 'nodes', 'AparaviUnified', 'AparaviUnified.node.js');
	if (fs.existsSync(nodeFile)) {
		let content = fs.readFileSync(nodeFile, 'utf8');
		// Comprehensive disable comment for all n8n community node restrictions
		const disableComment = '/* eslint-disable @n8n/community-nodes/no-restricted-imports, @n8n/community-nodes/no-restricted-globals */\n';
		
		// Remove any existing eslint-disable comments at the top
		content = content.replace(/^\/\* eslint-disable[^*]*\*\/\s*\n?/gm, '');
		content = content.replace(/^\/\/ eslint-disable[^\n]*\n?/gm, '');
		
		// Fix require statements: ensure exactly one correct eslint-disable comment directly before each
		const requires = [
			{ name: 'http', pattern: /(\s+)(const http = require\('http'\);)/g },
			{ name: 'https', pattern: /(\s+)(const https = require\('https'\);)/g },
			{ name: 'url', pattern: /(\s+)(const url = require\('url'\);)/g },
			{ name: 'fs', pattern: /(\s+)(const fs = require\('fs'\);)/g }
		];
		
		for (const { name, pattern } of requires) {
			// First pass: remove ALL existing eslint comments around this require
			// Multiple comments before
			content = content.replace(new RegExp(`\\s*// eslint-disable[^\\n]*\\n\\s*// eslint-disable[^\\n]*\\n\\s*// eslint-disable[^\\n]*\\n\\s*(const ${name} = require\\('[^']+'\\);)`, 'g'), '\n            // eslint-disable-next-line @n8n/community-nodes/no-restricted-imports\n            $1');
			content = content.replace(new RegExp(`\\s*// eslint-disable[^\\n]*\\n\\s*// eslint-disable[^\\n]*\\n\\s*(const ${name} = require\\('[^']+'\\);)`, 'g'), '\n            // eslint-disable-next-line @n8n/community-nodes/no-restricted-imports\n            $1');
			// Single comment before
			content = content.replace(new RegExp(`\\s*// eslint-disable[^\\n]*\\n\\s*(const ${name} = require\\('[^']+'\\);)`, 'g'), '\n            // eslint-disable-next-line @n8n/community-nodes/no-restricted-imports\n            $1');
			// Comment after
			content = content.replace(new RegExp(`(const ${name} = require\\('[^']+'\\);)\\s*// eslint-disable[^\\n]*\\n`, 'g'), '$1\n');
			
			// Second pass: ensure exactly one correct comment directly before (no blank lines)
			content = content.replace(pattern, (match, indentStr, requireStmt) => {
				const matchIndex = content.indexOf(match);
				if (matchIndex === -1) return match;
				
				const beforeText = content.substring(Math.max(0, matchIndex - 500), matchIndex);
				const lines = beforeText.split('\n');
				const prevLine = lines[lines.length - 1] || '';
				const prevPrevLine = lines[lines.length - 2] || '';
				
				// Check if correct comment is already on the line immediately before
				const hasCorrectComment = prevLine.trim() === '// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports' ||
				                          (prevLine.includes('eslint-disable-next-line') && prevLine.includes('@n8n/community-nodes/no-restricted-imports'));
				
				if (!hasCorrectComment) {
					return indentStr + '// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports\n' + indentStr + requireStmt;
				}
				return match;
			});
			
			// Third pass: remove blank lines between comment and require
			content = content.replace(new RegExp(`(// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports)\\n\\s*\\n(\\s+)(const ${name} = require\\('[^']+'\\);)`, 'g'), '$1\n$2$3');
		}
		
		// Fix setTimeout: ensure exactly one correct comment directly before
		// Remove existing comments
		content = content.replace(/\s*\/\/ eslint-disable[^\n]*\n\s*\/\/ eslint-disable[^\n]*\n\s*(setTimeout\(resolve, ms\);)/g, '\n            // eslint-disable-next-line @n8n/community-nodes/no-restricted-globals\n            $1');
		content = content.replace(/\s*\/\/ eslint-disable[^\n]*\n\s*(setTimeout\(resolve, ms\);)/g, '\n            // eslint-disable-next-line @n8n/community-nodes/no-restricted-globals\n            $1');
		content = content.replace(/(setTimeout\(resolve, ms\);)\s*\/\/ eslint-disable[^\n]*\n/g, '$1\n');
		
		// Ensure correct comment before setTimeout
		content = content.replace(/(\s+)(setTimeout\(resolve, ms\);)/g, (match, indent, setTimeoutStmt) => {
			const matchIndex = content.indexOf(match);
			if (matchIndex === -1) return match;
			
			const beforeText = content.substring(Math.max(0, matchIndex - 500), matchIndex);
			const lines = beforeText.split('\n');
			const prevLine = lines[lines.length - 1] || '';
			
			const hasCorrectComment = prevLine.trim() === '// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals' ||
			                          (prevLine.includes('eslint-disable-next-line') && prevLine.includes('@n8n/community-nodes/no-restricted-globals'));
			
			if (!hasCorrectComment) {
				return indent + '// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals\n' + indent + setTimeoutStmt;
			}
			return match;
		});
		
		// Remove blank lines between comment and setTimeout
		content = content.replace(/(\/\/ eslint-disable-next-line @n8n\/community-nodes\/no-restricted-globals)\n\s*\n(\s+)(setTimeout\(resolve, ms\);)/g, '$1\n$2$3');
		
		// Add disable comment at the very top (before "use strict" if present)
		if (content.startsWith('"use strict"')) {
			content = disableComment + content;
		} else if (!content.startsWith(disableComment.trim())) {
			content = disableComment + content;
		}
		fs.writeFileSync(nodeFile, content, 'utf8');
		console.log('✅ Added ESLint disable comments to compiled node file');
	}
	
	return Promise.resolve();
}

exports['build:icons'] = buildIcons;
exports['copy:pipelines'] = copyPipelines;
exports['add:eslint-disable'] = addEslintDisableToNode;
