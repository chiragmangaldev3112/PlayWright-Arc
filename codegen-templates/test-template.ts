import { test, expect } from '@playwright/test';
import { logger } from '@utils/core/logger';
import type { TestInfo } from '@playwright/test';

test.describe('{{DESCRIBE_BLOCK}}', () => {
  test.beforeEach(async ({ page }) => {
    logger.info('🚀 Setting up test environment');
    // Add any common setup here
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async ({ page }, testInfo: TestInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error('❌ Test failed', { 
        testName: testInfo.title,
        error: testInfo.error?.message 
      });
      
      // Take screenshot on failure
      await page.screenshot({ 
        path: `test-results/failure-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true 
      });
    }
  });

  test('{{TEST_NAME}} {{TAGS}}', async ({ page }) => {
    logger.info('🎯 Starting test: {{TEST_NAME}}');
    
    try {
      // Generated test steps will be inserted here
      // {{TEST_STEPS}}
      
      // Add your assertions here
      expect(page).toBeTruthy();
      
      logger.info('✅ Test completed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('❌ Test execution failed', { 
        error: errorMessage,
        stack: errorStack 
      });
      throw error;
    }
  });
});
