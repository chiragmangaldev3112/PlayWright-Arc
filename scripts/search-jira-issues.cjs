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

async function searchAllProjects() {
  console.log('🔍 Searching for all accessible projects...');
  
  try {
    const response = await axios.get(`${config.baseUrl}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`📋 Found ${response.data.length} accessible projects:`);
    console.log('='.repeat(60));
    
    response.data.forEach((project, index) => {
      console.log(`${index + 1}. ${project.key} - ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Type: ${project.projectTypeKey}`);
      console.log('');
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Failed to search projects');
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    return [];
  }
}

async function searchIssuesInProject(projectKey) {
  console.log(`🔍 Searching for issues in project: ${projectKey}...`);
  
  try {
    const response = await axios.get(`${config.baseUrl}/rest/api/3/search/jql`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      params: {
        jql: `project = "${projectKey}" ORDER BY created DESC`,
        maxResults: 20,
        fields: 'key,summary,issuetype,priority,status,created'
      },
      timeout: 10000
    });
    
    console.log(`📋 Found ${response.data.total} issues in project ${projectKey}`);
    
    if (response.data.issues.length > 0) {
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
    } else {
      console.log(`⚠️  No issues found in project ${projectKey}`);
      return [];
    }
    
  } catch (error) {
    console.error(`❌ Failed to search issues in project ${projectKey}`);
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
  console.log('🚀 JIRA Project and Issue Search Started');
  console.log(`🔗 Connecting to: ${config.baseUrl}`);
  console.log(`👤 Username: ${config.username}`);
  console.log('');
  
  // First, get all accessible projects
  const projects = await searchAllProjects();
  
  if (projects.length === 0) {
    console.log('❌ No accessible projects found');
    process.exit(1);
  }
  
  console.log('');
  
  // Search for issues in each project
  for (const project of projects.slice(0, 5)) { // Limit to first 5 projects
    const issueKeys = await searchIssuesInProject(project.key);
    
    if (issueKeys.length > 0) {
      console.log(`💡 To generate test cases for ${project.key} issues, use:`);
      issueKeys.slice(0, 3).forEach(key => {
        console.log(`   node scripts/simple-jira-generator.cjs ${key}`);
      });
      console.log('');
    }
  }
}

// Run the search
main().catch(error => {
  console.error('💥 Unexpected error:', error.message);
  process.exit(1);
});
