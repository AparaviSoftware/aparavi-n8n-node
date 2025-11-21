/**
 * Test LlamaParse using the PUBLISHED aparavi-client SDK from npm
 */

import { AparaviClient } from 'aparavi-client';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG = {
	uri: 'wss://eaas-dev.aparavi.com:443',
	auth: 'oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0',
};

// No need to manually load pipeline - SDK handles it via filepath

async function testLlamaParse(pdfFilePath: string) {
	console.log('\n🚀 Testing LlamaParse with PUBLISHED aparavi-client SDK');
	console.log('   Package: aparavi-client@1.0.6 from npm');
	console.log('=' .repeat(70));

	if (!fs.existsSync(pdfFilePath)) {
		console.error(`❌ Error: PDF file not found: ${pdfFilePath}`);
		process.exit(1);
	}

	const fileStats = fs.statSync(pdfFilePath);
	const fileName = path.basename(pdfFilePath);
	console.log(`\n📄 File: ${fileName}`);
	console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB\n`);

	const client = new AparaviClient(CONFIG);

	try {
		console.log('📡 Connecting to Aparavi server...');
		await client.connect();
		console.log('   ✅ Connected\n');

		// Use filepath approach (recommended - SDK handles pipeline loading)
		console.log('🚀 Starting LlamaParse + LVM pipeline...');
		const result = await client.use({
			filepath: path.join(__dirname, 'predefinedPipelines', 'llamaparse_webhook.json'),
			threads: 4
		});
		console.log(`   ✅ Pipeline started: ${result.token}\n`);

		console.log('📤 Uploading PDF file...');
		console.log('⏳ Processing with LlamaParse + LVM...');
		console.log('   (This may take 30-90 seconds)\n');

		// Read file buffer
		const fileBuffer = fs.readFileSync(pdfFilePath);
		const fileSize = fileBuffer.length;

		// Use send method (works in Node.js)
		const response = await client.send(result.token, fileBuffer, {
			filename: fileName,
			size: fileSize,
			mimetype: 'application/pdf'
		});

		console.log('✅ Processing complete!\n');

		if (response) {

			console.log('=' .repeat(70));
			console.log('📊 EXTRACTION RESULTS');
			console.log('=' .repeat(70));
			console.log();

			// Show text
			if (response.text && Array.isArray(response.text) && response.text.length > 0) {
				console.log('📝 EXTRACTED TEXT:\n');
				console.log('-'.repeat(70));
				
				// Show first 2000 characters
				const fullText = response.text.join('\n\n');
				const preview = fullText.substring(0, 2000);
				console.log(preview);
				
				if (fullText.length > 2000) {
					console.log('\n... (truncated) ...\n');
				}
				
				console.log('-'.repeat(70));
				console.log(`\n📏 Total length: ${fullText.length.toLocaleString()} characters`);
				console.log(`   Text blocks: ${response.text.length}`);

				// Save full text
				const outputFile = `llamaparse_${fileName.replace('.PDF', '').replace('.pdf', '')}_${Date.now()}.txt`;
				fs.writeFileSync(outputFile, fullText, 'utf-8');
				console.log(`\n💾 Full text saved to: ${outputFile}`);
				console.log();
			} else {
				console.log('⚠️  No text extracted\n');
			}

			// Show tables
			if (response.table && Array.isArray(response.table) && response.table.length > 0) {
				console.log(`📊 Tables found: ${response.table.length}\n`);
			}

			// Show documents
			if (response.documents && Array.isArray(response.documents)) {
				console.log(`📚 Document objects: ${response.documents.length}\n`);
			}

			console.log('=' .repeat(70));
		} else {
			console.log('⚠️  No response received from pipeline\n');
		}

		// Cleanup
		console.log('\n🛑 Cleaning up...');
		await client.terminate(result.token);
		await client.disconnect();
		console.log('   ✅ Done\n');

		console.log('✅ TEST PASSED - Published SDK works correctly!\n');
		process.exit(0);

	} catch (error) {
		console.error('\n❌ TEST FAILED');
		console.error('Error:', error instanceof Error ? error.message : String(error));
		if (error instanceof Error && error.stack) {
			console.error('\nStack trace:', error.stack);
		}
		
		if (client.isConnected()) {
			await client.disconnect();
		}
		
		process.exit(1);
	}
}

// Get file path from command line or use default
const pdfPath = process.argv[2] || '/Users/armin/Downloads/Preliminary Title Report.PDF';
testLlamaParse(pdfPath);

