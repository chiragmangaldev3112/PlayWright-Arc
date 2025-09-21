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

async function validateConnection() {
  console.log('🔍 Validating JIRA connection...');
  
  try {
    const response = await axios.get(`${config.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ JIRA connection validated successfully');
    console.log(`👤 Connected as: ${response.data.displayName} (${response.data.emailAddress})`);
    return true;
  } catch (error) {
    console.error('❌ JIRA connection validation failed');
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
}

async function searchJiraIssues() {
  console.log('🔍 Searching for JIRA issues...');
  
  try {
    // Search for issues in the project using the new API endpoint
    const response = await axios.get(`${config.baseUrl}/rest/api/3/search/jql`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      params: {
        jql: `project = "${config.projectKey}" ORDER BY created DESC`,
        maxResults: 10,
        fields: 'key,summary,issuetype,priority,status,created'
      },
      timeout: 10000
    });
    
    console.log(`📋 Found ${response.data.total} issues in project ${config.projectKey}`);
    console.log('\n🎯 Recent JIRA Issues:');
    console.log('='.repeat(80));
    
    response.data.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.key} - ${issue.fields.summary}`);
      console.log(`   Type: ${issue.fields.issuetype.name} | Priority: ${issue.fields.priority.name} | Status: ${issue.fields.status.name}`);
      console.log(`   Created: ${new Date(issue.fields.created).toLocaleDateString()}`);
      console.log('');
    });
    
    // Return the issue keys
    return response.data.issues.map(issue => issue.key);
    
  } catch (error) {
    console.error('❌ Failed to search JIRA issues');
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    return [];
  }
}

async function main() {
  console.log('🚀 JIRA Connection Test Started');
  console.log(`🔗 Connecting to: ${config.baseUrl}`);
  console.log(`👤 Username: ${config.username}`);
  console.log('');
  
  // Validate connection first
  const isConnected = await validateConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without valid JIRA connection');
    process.exit(1);
  }
  
  console.log('');
  
  // Search for issues
  const issueKeys = await searchJiraIssues();
  
  if (issueKeys.length > 0) {
    console.log('🎉 Successfully retrieved JIRA issue IDs:');
    console.log(issueKeys.join(', '));
    console.log('\n💡 You can now use these issue keys to generate test cases:');
    issueKeys.slice(0, 3).forEach(key => {
      console.log(`   npm run jira:generate -- ${key}`);
    });
  } else {
    console.log('⚠️  No issues found in the project');
  }
}

// Run the test
main().catch(error => {
  console.error('💥 Unexpected error:', error.message);
  process.exit(1);
});
