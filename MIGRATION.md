# Migration Guide: n8n-nodes-aparavi-dtc → n8n-nodes-aparavi

## Package Name Change

The package has been renamed from `n8n-nodes-aparavi-dtc` to `n8n-nodes-aparavi`.

**New Node Type**: `n8n-nodes-aparavi.aparaviUnified`  
**Old Node Type**: `n8n-nodes-aparavi-dtc.aparaviUnified` ❌

## Migration Steps

### Step 1: Uninstall Old Package

#### Option A: Through n8n UI
1. Go to **Settings** → **Community Nodes**
2. Find `n8n-nodes-aparavi-dtc`
3. Click **Uninstall**
4. Restart n8n

#### Option B: Via Command Line
```bash
# If installed globally
npm uninstall -g n8n-nodes-aparavi-dtc

# If installed locally in n8n directory
cd ~/.n8n
npm uninstall n8n-nodes-aparavi-dtc
```

### Step 2: Install New Package

#### Option A: Through n8n UI (Recommended)
1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-aparavi`
4. Click **Install**
5. Restart n8n

#### Option B: Via Command Line
```bash
# Install globally
npm install -g n8n-nodes-aparavi

# Or install locally in n8n directory
cd ~/.n8n
npm install n8n-nodes-aparavi
```

### Step 3: Restart n8n

**Important**: You must restart n8n for the changes to take effect.

```bash
# Stop n8n (Ctrl+C if running in terminal)
# Then restart
n8n start
```

### Step 4: Update Existing Workflows

If you have existing workflows using the old node type, you need to update them:

1. Open each workflow that uses Aparavi nodes
2. The old nodes will show as "Unrecognized node type"
3. Delete the old nodes
4. Add new **Aparavi DTC** nodes from the Transform category
5. Reconfigure the nodes with your settings
6. Save the workflow

#### Alternative: Manual JSON Update

If you prefer to edit the workflow JSON directly:

1. Export the workflow
2. Find and replace:
   - `"type": "n8n-nodes-aparavi-dtc.aparaviUnified"` 
   - → `"type": "n8n-nodes-aparavi.aparaviUnified"`
3. Import the updated workflow

## Verification

After migration, verify:

1. ✅ **Node appears**: Go to Add Node → Transform → **Aparavi DTC** should be visible
2. ✅ **No errors**: Check n8n console for any error messages
3. ✅ **Workflows work**: Test a simple workflow with the new node

## Troubleshooting

### Error: "Unrecognized node type: n8n-nodes-aparavi-dtc.aparaviUnified"

**Cause**: Old package is still installed or n8n hasn't been restarted.

**Solution**:
1. Uninstall `n8n-nodes-aparavi-dtc` completely
2. Install `n8n-nodes-aparavi`
3. **Restart n8n** (this is critical!)
4. Update workflows to use the new node type

### Node Doesn't Appear After Installation

**Solution**:
1. Check n8n console for errors
2. Verify package is installed: `npm list -g n8n-nodes-aparavi`
3. Restart n8n completely
4. Clear n8n cache if needed: `rm -rf ~/.n8n/.cache`

### Workflows Still Reference Old Node Type

**Solution**: Update workflows manually (see Step 4 above) or recreate the nodes.

## Package Information

- **New Package**: `n8n-nodes-aparavi`
- **Version**: 1.0.0+
- **npm**: https://www.npmjs.com/package/n8n-nodes-aparavi
- **GitHub**: https://github.com/AparaviSoftware/aparavi-n8n-node

## Support

If you encounter issues during migration:
1. Check n8n logs for detailed error messages
2. Verify both old and new packages are not installed simultaneously
3. Ensure n8n has been fully restarted
4. Report issues: https://github.com/AparaviSoftware/aparavi-n8n-node/issues

