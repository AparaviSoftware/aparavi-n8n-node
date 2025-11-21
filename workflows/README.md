# n8n PII Workflow Templates

This directory contains ready-to-use n8n workflow templates that demonstrate the power and flexibility of the Aparavi PII Censor node. These workflows are designed to be easy to understand, run, and customize for your specific needs.

## 🚀 Quick Start

1. **Get your free Aparavi API key**: [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)
2. **Install the PII node**: `npm install n8n-nodes-aparavi-dtc-pii`
3. **Import any workflow** from the templates below
4. **Configure your API credentials** in n8n
5. **Run and see the magic!** ✨

## 📁 Workflow Categories

### 🇺🇸 USA PII Workflows
- **Banking Customer Onboarding** - Process customer applications with SSN, driver's license, and bank account censoring
- **Banking Customer Onboarding - Advanced** - Same workflow but with `preserveStructure: true` for audit trails
- **E-commerce Support Tickets** - Sanitize customer support tickets before processing
- **E-commerce Support Tickets - With Metadata** - Same workflow but with `includeMetadata: true` for analytics

### 🌍 International PII Workflows  
- **GDPR Data Export** - Create compliant data exports for EU customers
- **Cross-Border HR Data** - Process employee data across different countries with varying privacy laws

### 🏥 HIPAA PII Workflows
- **Medical Records Research** - Anonymize patient data for research purposes
- **Medical Records - Advanced** - Same workflow but with BOTH `preserveStructure: true` AND `includeMetadata: true`
- **Healthcare Provider Communication** - Safely share patient information between providers

## 🔧 Setup Instructions

### 1. Install the PII Node
```bash
npm install n8n-nodes-aparavi-dtc-pii
```

### 2. Get Your API Key
1. Visit [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)
2. Sign up for a free account
3. Generate your API key
4. Copy the key for use in n8n

### 3. Configure n8n Credentials
1. Open n8n and go to **Settings** → **Credentials**
2. Add new credential of type "Aparavi API"
3. Enter your API key
4. Test the connection

### 4. Import Workflows
1. Go to **Workflows** in n8n
2. Click **Import from file**
3. Select any `.json` file from the templates directory
4. The workflow will be imported and ready to run

## 📋 Workflow Details

### USA PII Workflows

#### 1. Banking Customer Onboarding
**File**: `usa-pii/banking-customer-onboarding.json`

**What it does**: Processes customer loan/account applications by automatically censoring PII before sending to compliance teams.

**Key Features**:
- Handles arrays of customer applications
- Censors SSN, driver's license, bank accounts, credit cards
- Preserves data structure while protecting sensitive information
- Shows before/after comparison

**Sample Input**:
```json
{
  "applications": [
    {
      "customerId": "CUST-001",
      "fullName": "John Smith",
      "ssn": "123-45-6789",
      "driverLicense": "D123456789",
      "email": "john.smith@email.com",
      "phone": "(555) 123-4567",
      "address": "123 Main St, New York, NY 10001",
      "bankAccount": "1234567890",
      "creditCard": "4532-1234-5678-9012"
    }
  ]
}
```

**Sample Output**:
```json
{
  "original": {
    "name": "John Smith",
    "ssn": "123-45-6789",
    "email": "john.smith@email.com"
  },
  "censored": {
    "name": "████ ████",
    "ssn": "███-██-████",
    "email": "████@███.███"
  }
}
```

#### 2. E-commerce Support Tickets
**File**: `usa-pii/ecommerce-support-tickets.json`

**What it does**: Processes customer support tickets and automatically detects/censors PII before routing to support agents.

**Key Features**:
- Processes mixed-format support tickets
- Detects PII in ticket content and customer information
- Routes tickets based on PII detection
- Provides audit trail for compliance

### International PII Workflows

#### 3. GDPR Data Export
**File**: `international-pii/gdpr-data-export.json`

**What it does**: Creates GDPR-compliant data exports for EU customers, properly anonymizing personal data while maintaining structure.

**Key Features**:
- Handles international personal identifiers (passport, national ID)
- Creates GDPR-compliant export structure
- Checks consent before processing
- Includes compliance metadata

#### 4. Cross-Border HR Data
**File**: `international-pii/cross-border-hr-data.json`

**What it does**: Processes employee data across different countries, applying region-specific privacy rules.

**Key Features**:
- Handles employees from multiple countries
- Applies different privacy rules per region
- Censors personal data based on local laws
- Maintains work-related data for HR operations

### HIPAA PII Workflows

#### 5. Medical Records Research
**File**: `hipaa-pii/medical-records-research.json`

**What it does**: Anonymizes patient medical records for research purposes while maintaining HIPAA compliance.

**Key Features**:
- Processes complex medical record structures
- Censors PHI while preserving medical data
- Creates research-ready datasets
- Includes IRB approval checks

#### 6. Healthcare Provider Communication
**File**: `hipaa-pii/healthcare-provider-communication.json`

**What it does**: Safely processes patient communications between healthcare providers with appropriate privacy controls.

**Key Features**:
- Handles provider-to-provider communications
- Applies different sharing rules based on communication type
- Censors PHI while preserving medical information
- Maintains HIPAA compliance

## 🎯 Customization Guide

### Modifying Input Data
Each workflow starts with a "Sample Data" node. You can:
1. Replace the sample data with your own
2. Connect to real data sources (databases, APIs, files)
3. Modify the data structure to match your needs

### Adjusting PII Detection
The PII Censor node supports three modes:
- **USA PII**: SSN, driver's license, credit cards, etc.
- **International PII**: Passport, international phone, national ID, etc.
- **HIPAA**: Patient names, medical records, insurance numbers, etc.

### Adding Business Logic
Each workflow includes JavaScript code nodes where you can:
- Add custom validation rules
- Implement business-specific logic
- Create custom output formats
- Add additional compliance checks

## 🔍 Understanding the Workflows

### Common Pattern
All workflows follow this pattern:
1. **Input Data** - Sample or real data to process
2. **Parse Data** - Convert to proper format for processing
3. **Censor PII** - Apply the Aparavi PII Censor node
4. **Process Results** - Apply business logic and create output
5. **Route/Output** - Send to appropriate destinations

### Key Features Demonstrated
- **Flexible Input Handling**: Works with strings, objects, arrays
- **Automatic PII Detection**: No need to specify which fields contain PII
- **Structure Preservation**: Maintains original data structure
- **Compliance Ready**: Includes metadata for audit trails
- **Error Handling**: Robust error handling and validation

## 🚨 Important Notes

### API Key Required
All workflows require a valid Aparavi API key. Get yours free at [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)

### Data Privacy
- Sample data is completely fictional
- Never use real PII in examples
- Always test with anonymized data first

### Compliance
- These workflows are examples, not legal advice
- Ensure compliance with applicable regulations
- Consult legal experts for production use

## 🤝 Contributing

Found a bug or want to add a new workflow? We'd love your help!

1. Fork the repository
2. Create your workflow template
3. Add it to the appropriate category
4. Update this README
5. Submit a pull request

## 📞 Support

Need help? We're here for you:

- **Aparavi Discord**: [Join our community](https://discord.gg/ur9sRvJt)
- **GitHub Issues**: [Report problems](https://github.com/AparaviSoftware/n8n-nodes-aparavi-dtc-pii/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## 🚀 Advanced Workflow Examples

We've created advanced versions of some workflows that demonstrate the power of the PII Censor node's advanced features:

### **Advanced Workflows Available:**
- **Banking Customer Onboarding - Advanced** - Shows `preserveStructure: true` benefits
- **E-commerce Support Tickets - With Metadata** - Demonstrates `includeMetadata: true` capabilities  
- **Medical Records - Advanced** - Uses BOTH features for maximum functionality

### **Why Use Advanced Features?**
- **`preserveStructure: true`** - Perfect for compliance workflows, audit trails, debugging
- **`includeMetadata: true`** - Great for analytics, compliance reporting, PII pattern analysis
- **Both together** - Maximum functionality for enterprise compliance and research use cases

Each advanced workflow includes detailed annotation nodes explaining what the features enable and why you'd want to use them.

## ⚙️ PII Censor Node Options

The Aparavi PII Censor node includes two important options that control how data is processed:

### **Preserve Structure** (Default: `false`)
- **`false`** (default): Overwrites the original data with censored data
- **`true`**: Keeps original data and adds censored data in a `censored` property

**Example with `preserveStructure: false`:**
```json
// Input
{"name": "John Smith", "ssn": "123-45-6789"}

// Output  
{"name": "████ ████", "ssn": "███-██-████"}
```

**Example with `preserveStructure: true`:**
```json
// Input
{"name": "John Smith", "ssn": "123-45-6789"}

// Output
{
  "name": "John Smith",           // Original preserved
  "ssn": "123-45-6789",          // Original preserved  
  "censored": {                  // Censored version added
    "name": "████ ████",
    "ssn": "███-██-████"
  }
}
```

### **Include Metadata** (Default: `false`)
- **`false`** (default): No processing metadata included
- **`true`**: Adds `_metadata` object with PII detection details

**Example with `includeMetadata: true`:**
```json
{
  "name": "████ ████",
  "ssn": "███-██-████",
  "_metadata": {
    "piiType": "usa",
    "processedAt": "2024-01-15T10:30:00Z",
    "detectedPII": {
      "ssn": {"count": 1, "patterns": ["123-45-6789"]},
      "name": {"count": 1, "patterns": ["John Smith"]}
    }
  }
}
```

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to get started?** Pick a workflow, import it into n8n, and see how easy it is to protect PII in your automation workflows! 🚀