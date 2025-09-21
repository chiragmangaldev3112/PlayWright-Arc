# JIRA Integration Guide

## Overview

The JIRA Integration system allows you to automatically generate Playwright test cases from JIRA tickets. It fetches ticket details using the JIRA REST API and creates structured test files based on the issue description, type, and priority.

## Features

- 🎯 **Fetch JIRA Issues**: Retrieve ticket details by issue key
- 🧪 **Auto-Generate Tests**: Create Playwright test cases from JIRA descriptions
- 🏷️ **Smart Tagging**: Automatic test tagging based on JIRA priority and issue type
- 📁 **Organized Structure**: Generated tests follow project conventions
- 🔒 **Secure Authentication**: Uses JIRA API tokens for secure access
- ✅ **Connection Validation**: Verify JIRA connectivity before generating tests

## Setup

### 1. Install Dependencies

```bash
npm install axios @types/axios
```

### 2. Configure Environment Variables

Copy the `.env.example` file and set your JIRA credentials:

```bash
# JIRA Configuration
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=PROJ
```

### 3. Generate JIRA API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Enter a label (e.g., "Playwright Test Generator")
4. Copy the generated token
5. Set it as `JIRA_API_TOKEN` in your environment

## Usage

### Command Line Interface

Generate test case from JIRA issue:

```bash
# Basic usage
npm run jira:generate -- PROJ-123

# Custom output file
npm run jira:generate -- PROJ-123 --output custom-test.spec.ts

# Validate connection only
npm run jira:validate
```

### Programmatic Usage

```typescript
import { JiraIntegration } from '@utils/jira/jira-integration';
import { loadJiraConfig } from '@config/jira-config';

// Initialize JIRA integration
const config = loadJiraConfig();
const jira = new JiraIntegration(config);

// Fetch issue and generate test
const issue = await jira.getIssue('PROJ-123');
const testCase = jira.generateTestCase(issue);
const { content, filePath } = jira.generateTestFile(issue);
```

## Generated Test Structure

The generated test files include:

- **Proper imports** and page object initialization
- **JSDoc documentation** with JIRA issue details
- **Tagged tests** based on priority and issue type
- **Structured logging** with test start/end events
- **Error handling** with try/catch blocks
- **TODO comments** for customization

### Example Generated Test

```typescript
/**
 * Test case generated from JIRA issue: PROJ-123
 * Summary: User login validation
 * Priority: High
 * Issue Type: Bug
 * 
 * @test user-login-validation
 * @tags @high @ui @bug @jira-proj-123
 */
test('User login validation @high @ui @bug @jira-proj-123', async ({ page }) => {
  logger.testStart('User login validation', ['@high', '@ui', '@bug']);
  
  try {
    // Initialize page object
    const login = new Login(page);
    
    // Navigate to application
    await login.goto('https://web.vitadev.vero-biotech.com/');
    
    // TODO: Add specific test steps based on JIRA description
    
    logger.testEnd('User login validation', 'passed', Date.now());
  } catch (error) {
    logger.testEnd('User login validation', 'failed', Date.now());
    throw error;
  }
});
```

## Priority Mapping

JIRA priorities are automatically mapped to test tags:

| JIRA Priority | Test Tag    |
|---------------|-------------|
| Highest       | `@critical` |
| High          | `@high`     |
| Medium        | `@medium`   |
| Low           | `@low`      |
| Lowest        | `@low`      |

## Issue Type Support

The generator handles different JIRA issue types:

- **Bug**: Generates reproduction and verification steps
- **Story/Task**: Creates feature validation tests
- **Epic**: Generates comprehensive test suites
- **Custom Types**: Adapts to your JIRA configuration

## File Organization

Generated tests are organized in the following structure:

```
tests/web/jira/
├── proj_123_bug.spec.ts
├── proj_124_story.spec.ts
└── proj_125_task.spec.ts
```

## Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JIRA_BASE_URL` | JIRA instance URL | Yes |
| `JIRA_USERNAME` | Your JIRA email | Yes |
| `JIRA_API_TOKEN` | JIRA API token | Yes |
| `JIRA_PROJECT_KEY` | Default project key | No |
| `JIRA_TIMEOUT` | API timeout (ms) | No |
| `JIRA_MAX_RETRIES` | Retry attempts | No |

### Custom Configuration

```typescript
const customConfig: JiraConfig = {
  baseUrl: 'https://custom.atlassian.net',
  username: 'custom@email.com',
  apiToken: 'custom-token',
  projectKey: 'CUSTOM'
};

const jira = new JiraIntegration(customConfig);
```

## Error Handling

The integration provides detailed error messages for common issues:

- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Issue doesn't exist
- **Network errors**: Connection problems
- **Timeout errors**: API response delays

## Best Practices

1. **Security**: Never commit API tokens to version control
2. **Validation**: Always validate connection before bulk operations
3. **Customization**: Review and customize generated tests
4. **Naming**: Use descriptive JIRA issue summaries
5. **Documentation**: Keep JIRA descriptions detailed and structured

## Troubleshooting

### Common Issues

**"Cannot find module 'axios'"**
```bash
npm install axios @types/axios
```

**"Authentication failed"**
- Verify JIRA_USERNAME and JIRA_API_TOKEN
- Check if API token is still valid
- Ensure you have access to the JIRA instance

**"Issue not found"**
- Verify the issue key format (e.g., PROJ-123)
- Check if you have permission to view the issue
- Ensure the issue exists in the specified project

**"Network error"**
- Verify JIRA_BASE_URL is correct
- Check network connectivity
- Verify firewall/proxy settings

### Debug Mode

Enable debug logging:

```bash
DEBUG_MODE=true npm run jira:generate -- PROJ-123
```

## API Reference

### JiraIntegration Class

#### Methods

- `getIssue(issueKey: string): Promise<JiraIssue>`
- `generateTestCase(issue: JiraIssue): string`
- `generateTestFile(issue: JiraIssue, fileName?: string): { content: string; filePath: string }`
- `validateConnection(): Promise<boolean>`

#### Interfaces

```typescript
interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    issuetype: { name: string; id: string };
    priority: { name: string; id: string };
    status: { name: string; id: string };
    // ... other fields
  };
}

interface JiraConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
  projectKey?: string;
}
```

## Contributing

When contributing to the JIRA integration:

1. Follow the existing code patterns
2. Add proper TypeScript types
3. Include comprehensive error handling
4. Update documentation for new features
5. Add unit tests for new functionality

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review JIRA API documentation
3. Verify your JIRA permissions
4. Test with a simple JIRA issue first
