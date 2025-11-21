# Quick Setup Guide for n8n PII Workflows

## 🚀 5-Minute Setup

### Step 1: Get Your Free API Key (2 minutes)
1. Go to [https://dtc.aparavi.com/usage](https://dtc.aparavi.com/usage)
2. Click "Sign Up" or "Get Started"
3. Fill out the simple form
4. Copy your API key from the dashboard

### Step 2: Install the PII Node (1 minute)
```bash
# In your n8n installation directory
npm install n8n-nodes-aparavi-dtc-pii
```

### Step 3: Configure Credentials in n8n (1 minute)
1. Open n8n
2. Go to **Settings** → **Credentials**
3. Click **Add Credential**
4. Search for "Aparavi API"
5. Enter your API key
6. Click **Test** to verify connection
7. Click **Save**

### Step 4: Import and Run a Workflow (1 minute)
1. Go to **Workflows** in n8n
2. Click **Import from file**
3. Select any `.json` file from the `workflows/templates/` directory
4. Click **Import**
5. Click **Execute Workflow** to see it in action!

## 🎯 Recommended First Workflow

Start with **Banking Customer Onboarding** (`usa-pii/banking-customer-onboarding.json`):
- Simple to understand
- Shows clear before/after results
- Demonstrates key PII detection capabilities
- Easy to modify and experiment with

## 🔧 Troubleshooting

### "Aparavi API credentials are required"
- Make sure you've created the credential in n8n
- Verify the API key is correct
- Test the connection in the credential settings

### "Unknown PII type" error
- Check that you're using the correct PII type setting
- Options are: `usa`, `international`, or `hipaa`

### Workflow not importing
- Make sure you're importing the `.json` file, not the directory
- Check that the file is a valid n8n workflow export

## 🎨 Customizing Workflows

### Change the Sample Data
1. Open the workflow in n8n
2. Find the first node (usually "Sample Data" or similar)
3. Edit the JSON data in the node parameters
4. Save and run the workflow

### Modify PII Detection Settings
1. Find the "Aparavi PII Censor" node
2. Change the PII Type if needed (USA/International/HIPAA)
3. Adjust other settings like censor character or field selection
4. Save and test

### Add Your Own Data Sources
1. Replace the sample data node with a real data source
2. Use nodes like:
   - **HTTP Request** for APIs
   - **MySQL** for databases
   - **Read Binary File** for file uploads
   - **Webhook** for real-time data

## 📚 Next Steps

Once you're comfortable with the basic workflows:

1. **Explore different PII types** - Try USA, International, and HIPAA workflows
2. **Connect real data sources** - Replace sample data with your actual data
3. **Create custom business logic** - Modify the JavaScript code nodes
4. **Build your own workflows** - Use these as templates for your specific needs
5. **Share your creations** - Contribute back to the community!

## 💡 Pro Tips

- **Start simple** - Get one workflow working before trying complex ones
- **Test with fake data first** - Never use real PII in testing
- **Use the metadata** - The PII node provides useful metadata about what was detected
- **Check the logs** - n8n execution logs show exactly what happened
- **Join the community** - Get help and share ideas in our Discord

---

**Questions?** Join our Discord community or check the main README for more detailed information!
