import { JiraConfig } from '@utils/jira/jira-integration';

/**
 * JIRA Configuration
 * 
 * SECURITY NOTE: 
 * - Never commit actual credentials to version control
 * - Use environment variables for sensitive data
 * - Consider using .env files for local development
 */

/**
 * Load JIRA configuration from environment variables
 * @returns JiraConfig - JIRA configuration object
 */
export function loadJiraConfig(): JiraConfig {
  const config: JiraConfig = {
    baseUrl: process.env.JIRA_BASE_URL || 'https://vero-biotech.atlassian.net',
    username: process.env.JIRA_USERNAME || 'baljeet.kaur@vero-biotech.com',
    apiToken: process.env.JIRA_API_TOKEN || 'TATT3xFfGF0HrDON-jC-mi5skUpAhzjPrZ_tCNsHn3rufi8hgCSKFqo4u1YWjHPUsUHeeQPqVCZyK1twj3XyFeOFOtxJp-VCYQQQGSnO1boyB0PcwuqxA3eESMlQNUpR0ei9MPlE1P-DV6DCgiF9eyZzT1fUUvNo_lYdH0HNKQYbdhugq_lkwk=77F7CF05',
    projectKey: process.env.JIRA_PROJECT_KEY || 'PROJ'
  };

  // Validate required configuration
  if (!config.baseUrl || config.baseUrl === 'https://your-domain.atlassian.net') {
    throw new Error('JIRA_BASE_URL environment variable is required');
  }

  if (!config.username || config.username === 'your-email@company.com') {
    throw new Error('JIRA_USERNAME environment variable is required');
  }

  if (!config.apiToken || config.apiToken === 'your-api-token') {
    throw new Error('JIRA_API_TOKEN environment variable is required');
  }

  return config;
}

/**
 * Example configuration for different environments
 */
export const JIRA_CONFIGS = {
  development: {
    baseUrl: 'https://dev-company.atlassian.net',
    projectKey: 'DEV'
  },
  staging: {
    baseUrl: 'https://staging-company.atlassian.net',
    projectKey: 'STG'
  },
  production: {
    baseUrl: 'https://company.atlassian.net',
    projectKey: 'PROD'
  }
};

/**
 * Get environment-specific JIRA configuration
 * @param environment - Target environment
 * @returns Partial<JiraConfig> - Environment-specific config
 */
export function getEnvironmentConfig(environment: keyof typeof JIRA_CONFIGS): Partial<JiraConfig> {
  return JIRA_CONFIGS[environment] || JIRA_CONFIGS.development;
}
