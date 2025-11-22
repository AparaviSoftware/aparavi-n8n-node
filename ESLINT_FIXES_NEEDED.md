# ESLint Fixes Needed for n8n Cloud Compatibility

## Summary
95 ESLint violations found. Many are in bundled dependency `aparavi-universal-pii.js`.

## Main Node File Fixes Needed:

1. **Remove top-level requires** (lines 10-13):
   - Remove `const fs = require('fs')`
   - Remove `const path = require('path')`
   - Move `const { AparaviClient } = require('aparavi-client')` inside execute function

2. **Replace all console.log** (~30 instances):
   - Use `this.logger` from IExecuteFunctions context
   - Helper functions need logger passed as parameter

3. **Replace setTimeout** (lines 57, 101, 120):
   - Create delay function: `const delay = (ms: number) => new Promise(resolve => { /* use requestAnimationFrame or similar */ })`

4. **Remove __dirname and process usage** (lines 139-142, 172-175):
   - Embed pipeline JSONs as constants instead of reading from files

5. **Remove fs/path/os from execute function** (lines 569-571, 599, 627-629, etc.):
   - Handle binary data without file system (send directly to client)

6. **Embed pipeline JSONs**:
   - Convert all predefinedPipelines/*.json files to TypeScript constants

## Bundled File Issue:
- `dist/aparavi-universal-pii.js` has violations
- Options: Exclude from package, add ESLint ignore, or fix source
