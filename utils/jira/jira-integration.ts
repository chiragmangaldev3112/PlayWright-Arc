import axios, { AxiosResponse } from 'axios';
import { logger } from '@utils/core/logger';

/**
 * JIRA Issue interface defining the structure of a JIRA ticket
 */
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    issuetype: {
      name: string;
      id: string;
    };
    priority: {
      name: string;
      id: string;
    };
    status: {
      name: string;
      id: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    reporter: {
      displayName: string;
      emailAddress: string;
    };
    labels: string[];
    components: Array<{
      name: string;
      id: string;
    }>;
    created: string;
    updated: string;
  };
}

/**
 * JIRA Configuration interface
 */
export interface JiraConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
  projectKey?: string;
}

/**
 * Test Case Priority mapping from JIRA priority
 */
const PRIORITY_MAPPING: Record<string, string> = {
  'Highest': '@critical',
  'High': '@high', 
  'Medium': '@medium',
  'Low': '@low',
  'Lowest': '@low'
};

/**
 * JIRA Integration class for fetching tickets and generating test cases
 */
export class JiraIntegration {
  private config: JiraConfig;
  private authHeader: string;

  /**
   * Initialize JIRA Integration
   * @param config - JIRA configuration object
   */
  constructor(config: JiraConfig) {
    this.config = config;
    // Create base64 encoded auth header for JIRA API
    this.authHeader = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
    
    logger.info('🔗 JIRA Integration initialized');
    logger.debug(`JIRA Base URL: ${config.baseUrl}`);
  }

  /**
   * Fetch JIRA issue details by ticket ID
   * @param issueKey - JIRA issue key (e.g., 'PROJ-123')
   * @returns Promise<JiraIssue> - JIRA issue details
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    logger.info(`🎯 Fetching JIRA issue: ${issueKey}`);
    
    try {
      const response: AxiosResponse<JiraIssue> = await axios.get(
        `${this.config.baseUrl}/rest/api/3/issue/${issueKey}`,
        {
          headers: {
            'Authorization': `Basic ${this.authHeader}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      logger.info(`✅ Successfully fetched JIRA issue: ${issueKey}`);
      logger.debug(`Issue Type: ${response.data.fields.issuetype.name}`);
      logger.debug(`Priority: ${response.data.fields.priority.name}`);
      logger.debug(`Status: ${response.data.fields.status.name}`);
      
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Failed to fetch JIRA issue: ${issueKey}`);
      
      if (error.response) {
        logger.error(`HTTP Status: ${error.response.status}`);
        logger.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        
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
        throw new Error(`Network error: Unable to connect to JIRA at ${this.config.baseUrl}`);
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  /**
   * Generate test case template based on JIRA issue
   * @param issue - JIRA issue object
   * @returns string - Generated test case code
   */
  generateTestCase(issue: JiraIssue): string {
    const priority = PRIORITY_MAPPING[issue.fields.priority.name] || '@medium';
    const issueType = issue.fields.issuetype.name.toLowerCase();
    const testName = this.sanitizeTestName(issue.fields.summary);
    const description = this.parseDescription(issue.fields.description);
    
    logger.info(`🧪 Generating test case for: ${issue.key}`);
    logger.debug(`Test Priority: ${priority}`);
    logger.debug(`Issue Type: ${issueType}`);

    const testTemplate = `
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
    
    ${this.generateTestSteps(description, issueType)}
    
    logger.testEnd('${testName}', 'passed', Date.now());
  } catch (error) {
    logger.testEnd('${testName}', 'failed', Date.now());
    throw error;
  }
});`;

    return testTemplate;
  }

  /**
   * Generate test steps based on description and issue type
   * @param description - Parsed description from JIRA
   * @param issueType - Type of JIRA issue
   * @returns string - Generated test steps
   */
  private generateTestSteps(description: string, issueType: string): string {
    const steps = [];
    
    // Common setup steps
    steps.push('// Navigate to application');
    steps.push('await login.goto(\'https://web.vitadev.vero-biotech.com/\');');
    steps.push('');
    steps.push('// Login with test credentials');
    steps.push('await login.fillTextboxEmailAddress(\'baljeetadmin@gmail.com\');');
    steps.push('await login.fillTextboxPassword(\'Test@12345\');');
    steps.push('await login.clickButtonSignIn();');
    steps.push('await login.clickButtonImage();');
    steps.push('');

    // Generate steps based on issue type
    switch (issueType) {
      case 'bug':
        steps.push('// Bug reproduction steps');
        steps.push('// TODO: Add specific steps to reproduce the bug');
        steps.push('// Based on JIRA description:');
        steps.push(`// ${description.substring(0, 100)}...`);
        steps.push('');
        steps.push('// Verify bug is fixed');
        steps.push('// TODO: Add assertions to verify expected behavior');
        break;
        
      case 'story':
      case 'task':
        steps.push('// Feature/Story implementation verification');
        steps.push('// TODO: Add steps to verify new feature works as expected');
        steps.push('// Based on JIRA description:');
        steps.push(`// ${description.substring(0, 100)}...`);
        steps.push('');
        steps.push('// Verify feature functionality');
        steps.push('// TODO: Add specific feature validation steps');
        break;
        
      default:
        steps.push('// Test implementation based on JIRA requirements');
        steps.push('// TODO: Customize test steps based on specific requirements');
        steps.push('// JIRA Description:');
        steps.push(`// ${description.substring(0, 100)}...`);
    }

    return steps.map(step => `    ${step}`).join('\n');
  }

  /**
   * Sanitize test name for valid test case naming
   * @param summary - JIRA issue summary
   * @returns string - Sanitized test name
   */
  private sanitizeTestName(summary: string): string {
    return summary
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .substring(0, 80); // Limit length
  }

  /**
   * Parse and clean JIRA description
   * @param description - Raw JIRA description
   * @returns string - Cleaned description
   */
  private parseDescription(description: string): string {
    if (!description) return 'No description provided';
    
    // Remove JIRA markup and clean up
    return description
      .replace(/\{[^}]*\}/g, '') // Remove JIRA markup like {code}, {color}
      .replace(/\[\~[^\]]*\]/g, '') // Remove user mentions
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Generate complete test file with imports and structure
   * @param issue - JIRA issue object
   * @param fileName - Optional custom file name
   * @returns object - File content and suggested file path
   */
  generateTestFile(issue: JiraIssue, fileName?: string): { content: string; filePath: string } {
    const sanitizedKey = issue.key.toLowerCase().replace('-', '_');
    const defaultFileName = fileName || `${sanitizedKey}_${issue.fields.issuetype.name.toLowerCase()}.spec.ts`;
    const filePath = `/Users/baljeetkaur/Documents/Projects/playwrite-arc/tests/web/jira/${defaultFileName}`;

    const fileContent = `import { test, expect } from '@playwright/test';
import { Login } from '@pages/Login';
import { logger } from '@utils/core/logger';
import { DataHelpers } from '@/utils';

/**
 * Test file generated from JIRA issue: ${issue.key}
 * Issue Summary: ${issue.fields.summary}
 * Issue Type: ${issue.fields.issuetype.name}
 * Priority: ${issue.fields.priority.name}
 * 
 * Generated on: ${new Date().toISOString()}
 * JIRA Link: ${this.config.baseUrl}/browse/${issue.key}
 */

test.describe('JIRA ${issue.key} - ${issue.fields.summary}', () => {
  ${this.generateTestCase(issue)}
});`;

    logger.info(`📄 Generated test file for JIRA ${issue.key}`);
    logger.debug(`File path: ${filePath}`);

    return {
      content: fileContent,
      filePath: filePath
    };
  }

  /**
   * Validate JIRA connection
   * @returns Promise<boolean> - Connection status
   */
  async validateConnection(): Promise<boolean> {
    logger.info('🔍 Validating JIRA connection...');
    
    try {
      await axios.get(`${this.config.baseUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${this.authHeader}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      logger.info('✅ JIRA connection validated successfully');
      return true;
    } catch (error) {
      logger.error('❌ JIRA connection validation failed');
      return false;
    }
  }
}
