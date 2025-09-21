#!/usr/bin/env ts-node

import { JiraIntegration } from '@utils/jira/jira-integration';
import { loadJiraConfig } from '@config/jira-config';
import { logger } from '@utils/core/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI utility for generating test cases from JIRA issues
 * 
 * Usage:
 * npm run jira:generate -- PROJ-123
 * npm run jira:generate -- PROJ-123 --output custom-test.spec.ts
 * npm run jira:generate -- PROJ-123 --validate-only
 */

interface CliOptions {
  issueKey: string;
  outputFile?: string | undefined;
  validateOnly?: boolean;
  help?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArguments(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    issueKey: '',
    validateOnly: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--output':
      case '-o':
        const nextArg = args[++i];
        if (nextArg !== undefined) {
          options.outputFile = nextArg;
        }
        break;
      case '--validate-only':
      case '-v':
        options.validateOnly = true;
        break;
      default:
        if (!options.issueKey && arg && !arg.startsWith('--')) {
          options.issueKey = arg;
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
🎯 JIRA Test Case Generator

Usage:
  npm run jira:generate -- <ISSUE_KEY> [OPTIONS]

Arguments:
  ISSUE_KEY         JIRA issue key (e.g., PROJ-123)

Options:
  --output, -o      Custom output file name
  --validate-only   Only validate JIRA connection, don't generate test
  --help, -h        Show this help message

Examples:
  npm run jira:generate -- PROJ-123
  npm run jira:generate -- PROJ-123 --output custom-test.spec.ts
  npm run jira:generate -- PROJ-123 --validate-only

Environment Variables Required:
  JIRA_BASE_URL     Your JIRA instance URL (e.g., https://company.atlassian.net)
  JIRA_USERNAME     Your JIRA email address
  JIRA_API_TOKEN    Your JIRA API token

To generate an API token:
  1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
  2. Click "Create API token"
  3. Copy the token and set it as JIRA_API_TOKEN environment variable
`);
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Created directory: ${dir}`);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const options = parseArguments();

  // Show help if requested or no issue key provided
  if (options.help || !options.issueKey) {
    showHelp();
    process.exit(options.help ? 0 : 1);
  }

  logger.info('🚀 JIRA Test Case Generator Started');
  logger.info(`Issue Key: ${options.issueKey}`);

  try {
    // Load JIRA configuration
    const config = loadJiraConfig();
    logger.info(`🔗 Connecting to JIRA: ${config.baseUrl}`);

    // Initialize JIRA integration
    const jiraIntegration = new JiraIntegration(config);

    // Validate connection if requested
    if (options.validateOnly) {
      logger.info('🔍 Validating JIRA connection only...');
      const isValid = await jiraIntegration.validateConnection();
      
      if (isValid) {
        logger.info('✅ JIRA connection is valid');
        process.exit(0);
      } else {
        logger.error('❌ JIRA connection validation failed');
        process.exit(1);
      }
    }

    // Fetch JIRA issue
    logger.info(`📥 Fetching JIRA issue: ${options.issueKey}`);
    const issue = await jiraIntegration.getIssue(options.issueKey);

    logger.info(`📋 Issue Details:`);
    logger.info(`   Title: ${issue.fields.summary}`);
    logger.info(`   Type: ${issue.fields.issuetype.name}`);
    logger.info(`   Priority: ${issue.fields.priority.name}`);
    logger.info(`   Status: ${issue.fields.status.name}`);

    // Generate test file
    logger.info('🧪 Generating test case...');
    const { content, filePath } = jiraIntegration.generateTestFile(issue, options.outputFile);

    // Ensure output directory exists
    ensureOutputDirectory(filePath);

    // Write test file
    fs.writeFileSync(filePath, content, 'utf8');
    
    logger.info(`✅ Test case generated successfully!`);
    logger.info(`📄 File created: ${filePath}`);
    logger.info(`🔗 JIRA Link: ${config.baseUrl}/browse/${options.issueKey}`);

    // Display next steps
    console.log(`
🎉 Test case generation completed!

Next Steps:
1. Review the generated test file: ${filePath}
2. Customize the test steps based on your specific requirements
3. Add proper assertions and validations
4. Run the test: npx playwright test ${path.basename(filePath)}

Note: The generated test contains TODO comments where you need to add specific implementation details.
`);

  } catch (error: any) {
    logger.error('❌ Test case generation failed');
    logger.error(error.message);
    
    if (error.message.includes('environment variable')) {
      console.log(`
🔧 Configuration Help:

Set the following environment variables:
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_USERNAME="your-email@company.com"
export JIRA_API_TOKEN="your-api-token"

Or create a .env file in the project root:
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token
`);
    }
    
    process.exit(1);
  }
}

// Run the CLI tool
if (require.main === module) {
  main().catch((error) => {
    logger.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { main as generateTestFromJira };
