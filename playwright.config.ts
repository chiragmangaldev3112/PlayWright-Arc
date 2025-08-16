import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Enterprise Playwright Configuration
 * 
 * This configuration file sets up a comprehensive testing environment for:
 * - Web Application Testing (Desktop & Mobile)
 * - API Testing
 * - Cross-browser compatibility
 * - Parallel execution with retries
 * - Comprehensive reporting
 * - Environment-specific configurations
 */

// Load environment variables from .env file
dotenv.config();

// Determine environment (default to 'local' if not specified)
const environment = process.env.NODE_ENV || 'local';

// Load environment-specific configuration
dotenv.config({ 
  path: path.resolve(__dirname, `config/.env.${environment}`) 
});

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Global test timeout (30 seconds per test)
  timeout: 30 * 1000,
  
  // Expect timeout for assertions (10 seconds)
  expect: {
    timeout: 10 * 1000,
  },
  
  // Test execution configuration
  fullyParallel: true,                    // Run tests in parallel across all workers
  forbidOnly: !!process.env.CI,          // Fail build on CI if test.only is left in code
  retries: process.env.CI ? 2 : 1,       // Retry failed tests (2 times on CI, 1 time locally)
  workers: process.env.CI ? 2 : 1, // Limit workers on CI, use 1 locally
  
  // Global test configuration
  use: {
    // Base URL for web tests
    baseURL: process.env.BASE_URL || 'https://example.com',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: {
      mode: 'only-on-failure',           // Capture screenshots only on test failures
      fullPage: true                     // Capture full page screenshots
    },
    video: {
      mode: 'on',                      // Record videos for ALL tests (pass or fail)
      size: { width: 1280, height: 720 }
    },
    
    // Tracing for debugging
    trace: 'retain-on-failure',         // Keep traces only for failed tests
    
    // Action timeout
    actionTimeout: 15 * 1000,           // 15 seconds for actions like click, fill, etc.
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,       // 30 seconds for page navigation
    
    // API testing configuration
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  // Test projects for different browsers and devices
  projects: [
    // Desktop Browsers - Web Testing
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Add custom headers or authentication if needed
        extraHTTPHeaders: {
          'User-Agent': 'Playwright-Automation-Framework/1.0',
        }
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },
    
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'] 
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },
    
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'] 
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },

    // Mobile Devices - Mobile Web Testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'] 
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      grep: /@mobile/,
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'] 
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      grep: /@mobile/,
    },

    // API Testing Project
    {
      name: 'api-tests',
      testMatch: /.*api.*\.(spec|test)\.ts$/,
      use: {
        // API-specific configuration
        baseURL: process.env.API_BASE_URL || 'https://api.example.com',
        extraHTTPHeaders: {
          'Authorization': `Bearer ${process.env.API_TOKEN || ''}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // Cross-browser testing setup (can be enabled/disabled via environment variable)
    ...(process.env.CROSS_BROWSER_TESTING === 'true' ? [
      {
        name: 'Microsoft Edge',
        use: { ...devices['Desktop Edge'], channel: 'msedge' },
        testMatch: /.*\.(spec|test)\.ts$/,
        grep: /@web/,
      },
      {
        name: 'Google Chrome',
        use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        testMatch: /.*\.(spec|test)\.ts$/,
        grep: /@web/,
      },
    ] : []),
  ],

  // Test output and reporting configuration
  outputDir: 'test-results/',
  
  // Reporters configuration
  reporter: [
    // Console reporter with summary
    ['list'],
    
    // HTML reporter for detailed test results
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    
    // JUnit reporter for CI/CD integration
    ['junit', { 
      outputFile: 'test-results/junit-results.xml' 
    }],
    
    // JSON reporter for custom processing
    ['json', { 
      outputFile: 'test-results/test-results.json' 
    }],
    
    // Allure reporter (uncomment if using Allure)
    // ['allure-playwright', {
    //   detail: true,
    //   outputFolder: 'allure-results',
    //   suiteTitle: false,
    // }],
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./utils/core/global-setup.ts'),
  globalTeardown: require.resolve('./utils/core/global-teardown.ts'),

  // Web server configuration (if testing local applications)
  ...(process.env.START_LOCAL_SERVER === 'true' ? {
    webServer: {
      command: 'npm run start:test',
      port: 3000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    }
  } : {}),

  // Metadata for reports
  metadata: {
    environment: environment,
    baseURL: process.env.BASE_URL || 'https://example.com',
    apiBaseURL: process.env.API_BASE_URL || 'https://api.example.com',
    testSuite: 'Enterprise Automation Framework',
    version: '1.0.0',
    author: 'Enterprise Automation Team',
    executionDate: new Date().toISOString(),
  },
});
