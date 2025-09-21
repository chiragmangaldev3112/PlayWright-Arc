const { execSync } = require('child_process');
const path = require('path');

// Set NODE_OPTIONS to handle ES modules with ts-node
process.env.NODE_OPTIONS = '--loader ts-node/esm --experimental-specifier-resolution=node';

try {
  // Run the JIRA validation script
  console.log('🔍 Validating JIRA connection...');
  execSync('npx ts-node scripts/jira-test-generator.ts --validate-only', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to run JIRA validation:', error.message);
  process.exit(1);
}
