# Troubleshooting: Missing project_id Error

## Issue

When executing pipelines with the Aparavi DTC API, you're receiving a 500 error:

```json
{
  "status": "Error",
  "error": {
    "message": "Missing expected pipeline node attributes 'project_id'",
    "file": "/aparavi/Engine/ai/redirector.py",
    "line": 44
  }
}
```

## What We Tested

1. ✅ **Pipeline format is correct** - Your pipeline structure matches the SDK's predefined pipelines
2. ✅ **API key is being sent correctly** - The Authorization header is properly set
3. ✅ **SDK is working** - The SDK is properly wrapping and sending requests
4. ❌ **Even predefined pipelines fail** - The simple OCR pipeline from the SDK also fails with the same error

## Root Cause

The error "Missing expected pipeline node attributes 'project_id'" indicates that:
- The Aparavi DTC API requires all tasks/pipelines to be associated with a **project**
- Your API key or account may not have a project configured
- This is likely an account-level configuration issue, not a code issue

## Solution Steps

### 1. Contact Aparavi Support

Reach out to Aparavi support to resolve the project configuration:

- **Discord**: [Join Aparavi Discord](https://discord.gg/ur9sRvJt) - Visit #technical-support channel
- **Website**: https://dtc.aparavi.com/usage
- **Email**: Contact Aparavi support team

**What to tell them**:
```
I'm getting an error "Missing expected pipeline node attributes 'project_id'" 
when trying to execute pipelines using the Aparavi DTC API. 

My API key is: oGvKBxxn-JlWzx4zfLpwSnOXE0-kP_KywXvK5EiyNX4gGAGXFf0OBKMU5zBRf-x0

Even the SDK's predefined pipelines (like executeSimpleOCR) are failing with 
this error. It appears my account may not have a project configured. Can you 
help me set this up?
```

### 2. Check Your Account Dashboard

1. Go to https://dtc.aparavi.com/usage
2. Log in with your account
3. Look for:
   - **Projects section** - Do you have any projects created?
   - **API Key settings** - Is your API key associated with a project?
   - **Account setup wizard** - Is there an initial setup you might have skipped?

### 3. Possible Workarounds (if API endpoint is available)

If there's a separate API endpoint to create/configure projects, we may need to call that first. Check with Aparavi support if:
- There's a project creation API
- Projects can be created via the web dashboard
- Your API key needs to be regenerated after project creation

## Testing After Resolution

Once the project issue is resolved, test with this script:

```bash
node test-pipeline-debug.js
```

You should see a successful response instead of the 500 error.

## For n8n Integration

After the project issue is resolved:
1. Your n8n node will work automatically (no code changes needed)
2. You can start n8n with: `./start-n8n-dev.sh`
3. Both the **Aparavi PII Censor** and **Aparavi DTC** nodes will be available

## Additional Resources

- **n8n Node Documentation**: See README.md
- **Installation Guide**: See INSTALLATION.md
- **Quick Start**: See QUICK_START.md
- **SDK Documentation**: node_modules/aparavi-dtc-node-sdk/README.md

---

**Status**: 🟡 Waiting for Aparavi DTC account/project configuration

Last Updated: October 16, 2025


