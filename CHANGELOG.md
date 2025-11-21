# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- Initial release of Aparavi PII Censor Node for n8n
- Support for USA PII detection and censoring
- Support for International PII detection and censoring  
- Support for Healthcare Data (HIPAA) detection and censoring
- Flexible input handling for any data type (text, JSON, arrays, objects)
- Auto-detection of input data structure
- Field-specific processing options
- Built-in test mode with sample data
- Comprehensive error handling with continue-on-fail support
- Preserve data structure option
- Metadata inclusion option
- Batch processing for arrays
- Custom censor character support
- Aparavi API credentials management
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Features
- **Node Name**: Aparavi PII Censor
- **Functionality**: Uses aparavi-universal-pii.js library to censor PII
- **PII Types**: USA PII, International PII, Healthcare Data (HIPAA)
- **Input Handling**: Accepts ANY input from previous nodes with auto-detection
- **Flexibility**: Process all fields or specific fields in objects/arrays
- **Credentials**: Aparavi API key authentication
- **Testing**: Built-in test mode for development and validation

### Technical Details
- Built with TypeScript for type safety
- Compatible with n8n community node standards
- Uses Aparavi DTC (Data Transformation Cloud) service
- Supports both Node.js and browser environments
- Includes comprehensive error handling
- Follows n8n best practices for node development
