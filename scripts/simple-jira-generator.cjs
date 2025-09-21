const axios = require('axios');
require('dotenv').config();

// JIRA Configuration from environment variables
const config = {
  baseUrl: process.env.JIRA_BASE_URL || 'https://vero-biotech.atlassian.net',
  username: process.env.JIRA_USERNAME || 'baljeet.kaur@vero-biotech.com',
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY || 'PROJ'
};

// Create base64 encoded auth header
const authHeader = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');

async function getJiraIssue(issueKey) {
  console.log(`🎯 Fetching JIRA issue: ${issueKey}`);
  
  try {
    const response = await axios.get(`${config.baseUrl}/rest/api/3/issue/${issueKey}`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Successfully fetched JIRA issue: ${issueKey}`);
    console.log(`   Title: ${response.data.fields.summary}`);
    console.log(`   Type: ${response.data.fields.issuetype.name}`);
    console.log(`   Priority: ${response.data.fields.priority.name}`);
    console.log(`   Status: ${response.data.fields.status.name}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch JIRA issue: ${issueKey}`);
    
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      
      switch (error.response.status) {
        case 401:
          throw new Error(`Authentication failed. Please check your JIRA credentials.`);
        case 403:
          throw new Error(`Access denied. You don't have permission to view this issue.`);
        case 404:
          throw new Error(`Issue ${issueKey} not found. Please check the issue key.`);
        default:
          throw new Error(`JIRA API error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      throw new Error(`Network error: Unable to connect to JIRA at ${config.baseUrl}`);
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

function generateTestCase(issue, targetPage = null) {
  const priorityMapping = {
    'Highest': '@critical',
    'High': '@high', 
    'Medium': '@medium',
    'Low': '@low',
    'Lowest': '@low'
  };
  
  const priority = priorityMapping[issue.fields.priority.name] || '@medium';
  const issueType = issue.fields.issuetype.name.toLowerCase();
  const testName = issue.fields.summary
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .substring(0, 80); // Limit length
  
  const description = (issue.fields.description && typeof issue.fields.description === 'string') 
    ? issue.fields.description 
    : 'No description provided';
  
  console.log(`🧪 Generating test case for: ${issue.key}`);
  console.log(`   Test Priority: ${priority}`);
  console.log(`   Issue Type: ${issueType}`);

  const testTemplate = `import { test, expect } from '@playwright/test';
import { Login } from '@pages/Login';
import { logger } from '@utils/core/logger';

/**
 * Test file generated from JIRA issue: ${issue.key}
 * Issue Summary: ${issue.fields.summary}
 * Issue Type: ${issue.fields.issuetype.name}
 * Priority: ${issue.fields.priority.name}
 * 
 * Generated on: ${new Date().toISOString()}
 * JIRA Link: ${config.baseUrl}/browse/${issue.key}
 */

test.describe('JIRA ${issue.key} - ${issue.fields.summary}', () => {
  /**
   * Test case generated from JIRA issue: ${issue.key}
   * Summary: ${issue.fields.summary}
   * Priority: ${issue.fields.priority.name}
   * Issue Type: ${issue.fields.issuetype.name}
   * Status: ${issue.fields.status.name}
   * Created: ${new Date(issue.fields.created).toLocaleDateString()}
   * 
   * @test ${testName.toLowerCase().replace(/\s+/g, '-')}
   * @tags ${priority} @ui @${issueType} @jira-${issue.key.toLowerCase()}
   */
  test('${testName} ${priority} @ui @${issueType} @jira-${issue.key.toLowerCase()}', async ({ page }) => {
    logger.testStart('${testName}', ['${priority}', '@ui', '@${issueType}', '@jira-${issue.key.toLowerCase()}']);
    
    try {
      // Initialize page object
      const login = new Login(page);
      
      // Navigate to application
      await login.goto('https://web.vitadev.vero-biotech.com/');
      
      // Login with test credentials
      await login.fillTextboxEmailAddress('baljeetadmin@gmail.com');
      await login.fillTextboxPassword('Test@12345');
      await login.clickButtonSignIn();
      await login.clickButtonImage();
      
      ${generateTestSteps(description, issueType)}
      
      logger.testEnd('${testName}', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('${testName}', 'failed', Date.now());
      throw error;
    }
  });
});`;

  return testTemplate;
}

function generateTestSteps(description, issueType) {
  const steps = [];
  
  // Generate steps based on issue type
  switch (issueType) {
    case 'bug':
      steps.push('      // Bug reproduction steps');
      steps.push('      // TODO: Add specific steps to reproduce the bug');
      steps.push('      // Based on JIRA description:');
      steps.push(`      // ${description.substring(0, 100)}...`);
      steps.push('      ');
      steps.push('      // Verify bug is fixed');
      steps.push('      // TODO: Add assertions to verify expected behavior');
      break;
      
    case 'story':
    case 'task':
      steps.push('      // Feature/Story implementation verification');
      steps.push('      // TODO: Add steps to verify new feature works as expected');
      steps.push('      // Based on JIRA description:');
      steps.push(`      // ${description.substring(0, 100)}...`);
      steps.push('      ');
      steps.push('      // Verify feature functionality');
      steps.push('      // TODO: Add specific feature validation steps');
      break;
      
    default:
      steps.push('      // Test implementation based on JIRA requirements');
      steps.push('      // TODO: Customize test steps based on specific requirements');
      steps.push('      // JIRA Description:');
      steps.push(`      // ${description.substring(0, 100)}...`);
  }

  return steps.join('\n');
}

async function main() {
  const issueKey = process.argv[2];
  
  if (!issueKey) {
    console.log(`
🎯 JIRA Test Case Generator

Usage:
  node scripts/simple-jira-generator.cjs <ISSUE_KEY>

Example:
  node scripts/simple-jira-generator.cjs PROJ-123
`);
    process.exit(1);
  }

  console.log('🚀 JIRA Test Case Generator Started');
  console.log(`Issue Key: ${issueKey}`);

  try {
    // Fetch JIRA issue
    const issue = await getJiraIssue(issueKey);

    // Generate test file
    console.log('🧪 Generating test case...');
    const testContent = generateTestCase(issue);
    
    // Create output directory and file
    const fs = require('fs');
    const path = require('path');
    
    const sanitizedKey = issue.key.toLowerCase().replace('-', '_');
    const fileName = `${sanitizedKey}_${issue.fields.issuetype.name.toLowerCase()}.spec.ts`;
    const outputDir = path.join(process.cwd(), 'tests', 'web', 'jira');
    const filePath = path.join(outputDir, fileName);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}`);
    }

    // Write test file
    fs.writeFileSync(filePath, testContent, 'utf8');
    
    console.log(`✅ Test case generated successfully!`);
    console.log(`📄 File created: ${filePath}`);
    console.log(`🔗 JIRA Link: ${config.baseUrl}/browse/${issueKey}`);

    // Display next steps
    console.log(`
🎉 Test case generation completed!

Next Steps:
1. Review the generated test file: ${filePath}
2. Customize the test steps based on your specific requirements
3. Add proper assertions and validations
4. Run the test: npx playwright test ${fileName}

Note: The generated test contains TODO comments where you need to add specific implementation details.
`);

  } catch (error) {
    console.error('❌ Test case generation failed');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the generator
main();
