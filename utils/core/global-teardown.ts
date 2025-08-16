/**
 * Global Teardown for Playwright Tests
 * 
 * This file runs once after all tests and handles:
 * - Cleanup operations
 * - Report generation
 * - Log archiving
 * - Resource cleanup
 * - Final reporting
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@config/config-loader';
import { logger } from '@utils/core/logger';

/**
 * Global teardown function
 * @param config - Playwright full configuration
 */
async function globalTeardown(_fullConfig: FullConfig): Promise<void> {
  logger.info('🧹 Starting global teardown for Playwright tests');

  try {
    // 1. Generate test execution summary
    await generateExecutionSummary();

    // 2. Archive logs and reports
    await archiveReports();

    // 3. Cleanup temporary files
    await cleanupTemporaryFiles();

    // 4. Send notifications (if configured)
    await sendNotifications();

    // 5. Final logging
    await finalizeLogging();

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Generate test execution summary
 */
async function generateExecutionSummary(): Promise<void> {
  logger.info('📊 Generating test execution summary');

  try {
    const summaryPath = path.resolve(process.cwd(), 'reports', 'execution-summary.json');
    const timestamp = new Date().toISOString();
    const environment = config.getEnvironment();
    const envConfig = config.getConfig();

    // Read test results if available
    let testResults = null;
    try {
      const resultsPath = path.resolve(process.cwd(), 'test-results', 'test-results.json');
      const resultsContent = await fs.readFile(resultsPath, 'utf-8');
      testResults = JSON.parse(resultsContent);
    } catch {
      logger.debug('Test results file not found, skipping detailed summary');
    }

    const summary = {
      executionInfo: {
        timestamp,
        environment,
        baseUrl: envConfig.baseUrl,
        apiBaseUrl: envConfig.apiBaseUrl,
        headless: envConfig.headless,
        workers: envConfig.workers,
        retries: envConfig.retries,
        timeout: envConfig.timeout,
        ci: config.isCI(),
        debugMode: config.isDebugMode(),
      },
      testResults: testResults ? {
        totalTests: testResults.stats?.total || 0,
        passed: testResults.stats?.passed || 0,
        failed: testResults.stats?.failed || 0,
        skipped: testResults.stats?.skipped || 0,
        flaky: testResults.stats?.flaky || 0,
        duration: testResults.stats?.duration || 0,
      } : null,
      artifacts: {
        screenshots: await countArtifacts('reports/screenshots'),
        videos: await countArtifacts('test-results', '.webm'),
        traces: await countArtifacts('test-results', '.zip'),
        logs: await countArtifacts('reports/logs'),
      },
      reports: {
        htmlReport: await fileExists('playwright-report/index.html'),
        junitReport: await fileExists('test-results/junit-results.xml'),
        allureReport: await fileExists('allure-results'),
      },
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    logger.info(`Execution summary saved: ${summaryPath}`);

    // Log summary to console
    if (summary.testResults) {
      logger.info('📈 Test Execution Results:');
      logger.info(`  Total Tests: ${summary.testResults.totalTests}`);
      logger.info(`  Passed: ${summary.testResults.passed}`);
      logger.info(`  Failed: ${summary.testResults.failed}`);
      logger.info(`  Skipped: ${summary.testResults.skipped}`);
      logger.info(`  Flaky: ${summary.testResults.flaky}`);
      logger.info(`  Duration: ${Math.round(summary.testResults.duration / 1000)}s`);
    }

    logger.info('✅ Test execution summary generated');
  } catch (error) {
    logger.error('❌ Failed to generate execution summary', error);
  }
}

/**
 * Archive logs and reports
 */
async function archiveReports(): Promise<void> {
  logger.info('📦 Archiving logs and reports');

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.resolve(process.cwd(), 'reports', 'archive', timestamp);

    await fs.mkdir(archiveDir, { recursive: true });

    // Archive directories to preserve
    const dirsToArchive = [
      { src: 'reports/logs', dest: 'logs' },
      { src: 'reports/screenshots', dest: 'screenshots' },
      { src: 'playwright-report', dest: 'html-report' },
      { src: 'test-results', dest: 'test-results' },
    ];

    for (const { src, dest } of dirsToArchive) {
      const srcPath = path.resolve(process.cwd(), src);
      const destPath = path.resolve(archiveDir, dest);

      try {
        await fs.access(srcPath);
        await copyDirectory(srcPath, destPath);
        logger.debug(`Archived: ${src} -> ${dest}`);
      } catch {
        logger.debug(`Directory not found, skipping: ${src}`);
      }
    }

    // Create archive info file
    const archiveInfo = {
      timestamp,
      environment: config.getEnvironment(),
      archivedDirectories: dirsToArchive.map(d => d.src),
      archivePath: archiveDir,
    };

    await fs.writeFile(
      path.resolve(archiveDir, 'archive-info.json'),
      JSON.stringify(archiveInfo, null, 2),
      'utf-8'
    );

    logger.info(`Reports archived to: ${archiveDir}`);
    logger.info('✅ Report archiving completed');
  } catch (error) {
    logger.error('❌ Failed to archive reports', error);
  }
}

/**
 * Cleanup temporary files
 */
async function cleanupTemporaryFiles(): Promise<void> {
  logger.info('🗑️ Cleaning up temporary files');

  try {
    const tempDirs = [
      'test-results',
      // Add other temporary directories as needed
    ];

    // Only cleanup if not in CI or if explicitly configured
    if (!config.isCI() && !process.env.KEEP_TEMP_FILES) {
      for (const dir of tempDirs) {
        const dirPath = path.resolve(process.cwd(), dir);
        try {
          await fs.access(dirPath);
          // Only remove contents, keep the directory structure
          const files = await fs.readdir(dirPath);
          for (const file of files) {
            const filePath = path.resolve(dirPath, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              await fs.unlink(filePath);
            }
          }
          logger.debug(`Cleaned up temporary files in: ${dir}`);
        } catch {
          logger.debug(`Directory not found, skipping cleanup: ${dir}`);
        }
      }
    } else {
      logger.info('Skipping cleanup (CI mode or KEEP_TEMP_FILES set)');
    }

    logger.info('✅ Temporary file cleanup completed');
  } catch (error) {
    logger.error('❌ Failed to cleanup temporary files', error);
  }
}

/**
 * Send notifications (if configured)
 */
async function sendNotifications(): Promise<void> {
  logger.info('📢 Checking notification configuration');

  try {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;

    if (!slackWebhook && !teamsWebhook) {
      logger.debug('No notification webhooks configured, skipping notifications');
      return;
    }

    // Read execution summary for notification content
    const summaryPath = path.resolve(process.cwd(), 'reports', 'execution-summary.json');
    let summary = null;
    try {
      const summaryContent = await fs.readFile(summaryPath, 'utf-8');
      summary = JSON.parse(summaryContent);
    } catch {
      logger.debug('Execution summary not found, sending basic notification');
    }

    const notificationMessage = createNotificationMessage(summary);

    // Send Slack notification
    if (slackWebhook) {
      await sendSlackNotification(slackWebhook, notificationMessage);
    }

    // Send Teams notification
    if (teamsWebhook) {
      await sendTeamsNotification(teamsWebhook, notificationMessage);
    }

    logger.info('✅ Notifications sent');
  } catch (error) {
    logger.error('❌ Failed to send notifications', error);
  }
}

/**
 * Finalize logging
 */
async function finalizeLogging(): Promise<void> {
  try {
    logger.info('📝 Finalizing logging');
    
    // Flush and close all logger transports
    await logger.flush();
    
    // Don't log after flush to prevent 'write after end' errors
    console.log('✅ Logging finalized');
  } catch (error) {
    console.error('❌ Failed to finalize logging:', error);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Count artifacts in a directory
 * @param dirPath - Directory path
 * @param extension - File extension filter (optional)
 * @returns Promise<number> - Number of files
 */
async function countArtifacts(dirPath: string, extension?: string): Promise<number> {
  try {
    const fullPath = path.resolve(process.cwd(), dirPath);
    const files = await fs.readdir(fullPath, { recursive: true });
    
    if (extension) {
      return files.filter(file => file.toString().endsWith(extension)).length;
    }
    
    return files.length;
  } catch {
    return 0;
  }
}

/**
 * Check if file exists
 * @param filePath - File path
 * @returns Promise<boolean> - True if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy directory recursively
 * @param src - Source directory
 * @param dest - Destination directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Create notification message
 * @param summary - Execution summary
 * @returns string - Notification message
 */
function createNotificationMessage(summary: any): string {
  const environment = config.getEnvironment();
  const timestamp = new Date().toLocaleString();

  if (!summary?.testResults) {
    return `🤖 Playwright Tests Completed\n` +
           `Environment: ${environment}\n` +
           `Time: ${timestamp}\n` +
           `Status: Execution completed`;
  }

  const { testResults } = summary;
  const passRate = testResults.totalTests > 0 
    ? Math.round((testResults.passed / testResults.totalTests) * 100) 
    : 0;
  
  const status = testResults.failed > 0 ? '❌ FAILED' : '✅ PASSED';
  
  return `🤖 Playwright Test Results\n` +
         `Environment: ${environment}\n` +
         `Status: ${status}\n` +
         `Total: ${testResults.totalTests}\n` +
         `Passed: ${testResults.passed}\n` +
         `Failed: ${testResults.failed}\n` +
         `Skipped: ${testResults.skipped}\n` +
         `Pass Rate: ${passRate}%\n` +
         `Duration: ${Math.round(testResults.duration / 1000)}s\n` +
         `Time: ${timestamp}`;
}

/**
 * Send Slack notification
 * @param webhookUrl - Slack webhook URL
 * @param message - Message to send
 */
async function sendSlackNotification(webhookUrl: string, message: string): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    logger.info('Slack notification sent successfully');
  } catch (error) {
    logger.error('Failed to send Slack notification', error);
  }
}

/**
 * Send Teams notification
 * @param webhookUrl - Teams webhook URL
 * @param message - Message to send
 */
async function sendTeamsNotification(webhookUrl: string, message: string): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    logger.info('Teams notification sent successfully');
  } catch (error) {
    logger.error('Failed to send Teams notification', error);
  }
}

export default globalTeardown;
