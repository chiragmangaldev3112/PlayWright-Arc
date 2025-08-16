/**
 * Global Setup for Playwright Tests
 * 
 * This file runs once before all tests and handles:
 * - Environment validation
 * - Test data preparation
 * - Global authentication setup
 * - Directory creation
 * - Logging initialization
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@config/config-loader';
import { logger } from '@utils/core/logger';
import { dataHelpers } from '@utils/data/data-helpers';

/**
 * Global setup function
 * @param config - Playwright full configuration
 */
async function globalSetup(fullConfig: FullConfig): Promise<void> {
  logger.info('🚀 Starting global setup for Playwright tests');

  try {
    // 1. Validate environment configuration
    await validateEnvironment();

    // 2. Create necessary directories
    await createDirectories();

    // 3. Prepare test data
    await prepareTestData();

    // 4. Setup global authentication if needed
    await setupGlobalAuthentication();

    // 5. Log environment information
    await logEnvironmentInfo(fullConfig);

    logger.info('✅ Global setup completed successfully');
  } catch (error) {
    logger.error('❌ Global setup failed', error);
    throw error;
  }
}

/**
 * Validate environment configuration
 */
async function validateEnvironment(): Promise<void> {
  logger.info('🔍 Validating environment configuration');

  try {
    const envConfig = config.getConfig();
    
    // Validate required URLs are accessible
    logger.info(`Environment: ${envConfig.name}`);
    logger.info(`Base URL: ${envConfig.baseUrl}`);
    logger.info(`API Base URL: ${envConfig.apiBaseUrl}`);

    // Test basic connectivity (optional - can be enabled for critical environments)
    if (config.getEnvironment() !== 'local') {
      await testConnectivity(envConfig.baseUrl);
      await testConnectivity(envConfig.apiBaseUrl);
    }

    logger.info('✅ Environment validation passed');
  } catch (error) {
    logger.error('❌ Environment validation failed', error);
    throw new Error(`Environment validation failed: ${error}`);
  }
}

/**
 * Test connectivity to a URL
 * @param url - URL to test
 */
async function testConnectivity(url: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    logger.debug(`✅ Connectivity test passed for: ${url}`);
  } catch (error) {
    logger.warn(`⚠️ Connectivity test failed for: ${url}`, error);
    // Don't throw error for connectivity issues in setup
    // Tests will handle their own connectivity requirements
  }
}

/**
 * Create necessary directories for test execution
 */
async function createDirectories(): Promise<void> {
  logger.info('📁 Creating necessary directories');

  const directories = [
    'reports',
    'reports/logs',
    'reports/screenshots',
    'reports/videos',
    'reports/traces',
    'test-results',
    'playwright-report',
    'allure-results',
  ];

  for (const dir of directories) {
    const dirPath = path.resolve(process.cwd(), dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`Created directory: ${dirPath}`);
    } catch (error) {
      logger.warn(`Failed to create directory: ${dirPath}`, error);
    }
  }

  logger.info('✅ Directory creation completed');
}

/**
 * Prepare test data for execution
 */
async function prepareTestData(): Promise<void> {
  logger.info('📊 Preparing test data');

  try {
    const testDataConfig = config.getTestDataConfig();
    
    // Create sample test data if it doesn't exist
    const testDataPath = path.resolve(process.cwd(), testDataConfig.path);
    
    try {
      await fs.access(testDataPath);
      logger.info(`Test data file exists: ${testDataPath}`);
    } catch {
      logger.info(`Creating sample test data file: ${testDataPath}`);
      await createSampleTestData(testDataPath);
    }

    // Validate test data can be loaded
    const testData = await dataHelpers.getTestData();
    logger.info(`Loaded ${testData.length} test data records`);

    logger.info('✅ Test data preparation completed');
  } catch (error) {
    logger.error('❌ Test data preparation failed', error);
    throw error;
  }
}

/**
 * Create sample test data file
 * @param filePath - Path to create the test data file
 */
async function createSampleTestData(filePath: string): Promise<void> {
  const sampleData = [
    {
      id: 'login_valid_admin',
      scenario: 'Valid Admin Login',
      data: {
        username: 'admin@example.com',
        password: 'AdminPassword123!',
        expectedRole: 'admin',
        expectedRedirect: '/dashboard',
      },
      tags: ['login', 'admin', 'positive'],
      priority: 'high',
    },
    {
      id: 'login_valid_user',
      scenario: 'Valid User Login',
      data: {
        username: 'user@example.com',
        password: 'UserPassword123!',
        expectedRole: 'user',
        expectedRedirect: '/profile',
      },
      tags: ['login', 'user', 'positive'],
      priority: 'high',
    },
    {
      id: 'login_invalid_credentials',
      scenario: 'Invalid Login Credentials',
      data: {
        username: 'invalid@example.com',
        password: 'WrongPassword',
        expectedError: 'Invalid credentials',
      },
      tags: ['login', 'negative'],
      priority: 'medium',
    },
    {
      id: 'registration_valid',
      scenario: 'Valid User Registration',
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        acceptTerms: true,
      },
      tags: ['registration', 'positive'],
      priority: 'high',
    },
    {
      id: 'api_users_get',
      scenario: 'Get Users API',
      data: {
        endpoint: '/users',
        method: 'GET',
        expectedStatus: 200,
        expectedFields: ['id', 'name', 'email'],
      },
      tags: ['api', 'users', 'get'],
      priority: 'high',
    },
  ];

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(sampleData, null, 2), 'utf-8');
  logger.info(`Created sample test data file: ${filePath}`);
}

/**
 * Setup global authentication if needed
 */
async function setupGlobalAuthentication(): Promise<void> {
  logger.info('🔐 Setting up global authentication');

  try {
    // This is where you would set up global authentication state
    // For example, logging in as different users and saving auth tokens
    
    const credentials = dataHelpers.getAllUserCredentials();
    logger.info(`Available user roles: ${Object.keys(credentials).join(', ')}`);

    // Example: Pre-authenticate users and save auth state
    // This is optional and depends on your application's authentication flow
    
    logger.info('✅ Global authentication setup completed');
  } catch (error) {
    logger.warn('⚠️ Global authentication setup failed (non-critical)', error);
    // Don't throw error for authentication setup failures
    // Individual tests can handle their own authentication
  }
}

/**
 * Log environment information
 * @param fullConfig - Playwright full configuration
 */
async function logEnvironmentInfo(fullConfig: FullConfig): Promise<void> {
  logger.info('📋 Environment Information:');
  
  const envConfig = config.getConfig();
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  logger.info(`Node.js Version: ${nodeVersion}`);
  logger.info(`Platform: ${platform} (${arch})`);
  logger.info(`Environment: ${envConfig.name}`);
  logger.info(`Base URL: ${envConfig.baseUrl}`);
  logger.info(`API Base URL: ${envConfig.apiBaseUrl}`);
  logger.info(`Headless Mode: ${envConfig.headless}`);
  logger.info(`Workers: ${envConfig.workers}`);
  logger.info(`Retries: ${envConfig.retries}`);
  logger.info(`Timeout: ${envConfig.timeout}ms`);
  logger.info(`CI Mode: ${config.isCI()}`);
  logger.info(`Debug Mode: ${config.isDebugMode()}`);
  logger.info(`Verbose Logging: ${config.isVerboseLogging()}`);
  
  // Log project information
  const projects = fullConfig.projects.map(p => p.name).join(', ');
  logger.info(`Test Projects: ${projects}`);
  
  // Log reporter information
  const reporters = Array.isArray(fullConfig.reporter) 
    ? fullConfig.reporter.map(r => Array.isArray(r) ? r[0] : r).join(', ')
    : fullConfig.reporter;
  logger.info(`Reporters: ${reporters}`);
}

export default globalSetup;
