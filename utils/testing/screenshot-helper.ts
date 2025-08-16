/**
 * Screenshot Helper Utility
 * 
 * Provides comprehensive screenshot capture capabilities for the automation framework
 * including full page, element-specific, and failure screenshots with proper naming
 * and organization.
 */

import type { Page, Locator } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';
import type { ScreenshotConfig, ScreenshotHelper as ScreenshotHelperInterface } from '@types';
import { logger } from '@utils/core/logger';
import { config } from '@config/config-loader';

/**
 * Screenshot Helper Class Implementation
 */
export class ScreenshotHelper implements ScreenshotHelperInterface {
  private page: Page;
  private testName: string;
  private screenshotDir: string;
  private screenshotCounter: number = 0;

  /**
   * Constructor
   * @param page - Playwright page instance
   * @param testName - Name of the current test for screenshot naming
   */
  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = this.sanitizeFileName(testName);
    this.screenshotDir = path.join(process.cwd(), 'reports', 'screenshots', this.testName);
    this.initializeScreenshotDirectory();
  }

  /**
   * Capture full page screenshot
   * @param name - Custom name for the screenshot
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureFullPage(name: string): Promise<string> {
    const screenshotConfig = config.getScreenshotConfig();
    
    if (!screenshotConfig.onFailure && !screenshotConfig.fullPage) {
      logger.debug('Screenshot capture is disabled in configuration');
      return '';
    }

    const fileName = this.generateFileName(name, 'fullpage');
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      await this.page.screenshot({
        path: filePath,
        fullPage: screenshotConfig.fullPage,
        type: 'png',
        quality: 90,
      });

      logger.screenshot(filePath, `Full page screenshot: ${name}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture full page screenshot: ${name}`, error);
      throw error;
    }
  }

  /**
   * Capture screenshot of a specific element
   * @param selector - CSS selector or Playwright locator
   * @param name - Custom name for the screenshot
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureElement(selector: string | Locator, name: string): Promise<string> {
    const fileName = this.generateFileName(name, 'element');
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      let locator: Locator;
      
      if (typeof selector === 'string') {
        locator = this.page.locator(selector);
      } else {
        locator = selector;
      }

      // Wait for element to be visible before taking screenshot
      await locator.waitFor({ state: 'visible', timeout: 5000 });

      await locator.screenshot({
        path: filePath,
        type: 'png',
        quality: 90,
      });

      logger.screenshot(filePath, `Element screenshot: ${name}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture element screenshot: ${name}`, error);
      // Fallback to full page screenshot if element screenshot fails
      return this.captureFullPage(`${name}_fallback`);
    }
  }

  /**
   * Capture screenshot on test failure
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureOnFailure(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `failure_${timestamp}`;
    
    try {
      return await this.captureFullPage(name);
    } catch (error) {
      logger.error('Failed to capture failure screenshot', error);
      return '';
    }
  }

  /**
   * Capture screenshot with custom configuration
   * @param name - Custom name for the screenshot
   * @param config - Screenshot configuration options
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureWithConfig(name: string, screenshotConfig: ScreenshotConfig): Promise<string> {
    const fileName = this.generateFileName(name, 'custom');
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      const options: any = {
        path: filePath,
        fullPage: screenshotConfig.fullPage,
        quality: screenshotConfig.quality || 90,
        type: screenshotConfig.type || 'png',
      };
      
      if (screenshotConfig.clip) {
        options.clip = screenshotConfig.clip;
      }
      
      await this.page.screenshot(options);

      logger.screenshot(filePath, `Custom screenshot: ${name}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture custom screenshot: ${name}`, error);
      throw error;
    }
  }

  /**
   * Capture screenshot of viewport only
   * @param name - Custom name for the screenshot
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureViewport(name: string): Promise<string> {
    return this.captureWithConfig(name, {
      fullPage: false,
      quality: 90,
      type: 'png',
    });
  }

  /**
   * Capture screenshot with annotation
   * @param name - Custom name for the screenshot
   * @param annotation - Text annotation to add to the page before screenshot
   * @returns Promise<string> - Path to the saved screenshot
   */
  public async captureWithAnnotation(name: string, annotation: string): Promise<string> {
    try {
      // Add annotation to the page
      await this.page.evaluate((text: string) => {
        // @ts-ignore - document is available in browser context
        const annotationDiv = document.createElement('div');
        annotationDiv.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          z-index: 9999;
          max-width: 300px;
        `;
        annotationDiv.textContent = text;
        annotationDiv.id = 'playwright-annotation';
        // @ts-ignore - document is available in browser context
        document.body.appendChild(annotationDiv);
      }, annotation);

      const filePath = await this.captureFullPage(name);

      // Remove annotation
      await this.page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        const annotation = document.getElementById('playwright-annotation');
        if (annotation) {
          annotation.remove();
        }
      });

      return filePath;
    } catch (error) {
      logger.error(`Failed to capture annotated screenshot: ${name}`, error);
      return this.captureFullPage(name);
    }
  }

  /**
   * Capture comparison screenshots (before/after)
   * @param name - Base name for the screenshots
   * @param action - Function to execute between screenshots
   * @returns Promise<{before: string, after: string}> - Paths to both screenshots
   */
  public async captureComparison(
    name: string,
    action: () => Promise<void>
  ): Promise<{ before: string; after: string }> {
    const beforePath = await this.captureFullPage(`${name}_before`);
    
    await action();
    
    const afterPath = await this.captureFullPage(`${name}_after`);
    
    return { before: beforePath, after: afterPath };
  }

  /**
   * Get all screenshots captured for the current test
   * @returns Promise<string[]> - Array of screenshot file paths
   */
  public async getAllScreenshots(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.screenshotDir);
      return files
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .map(file => path.join(this.screenshotDir, file))
        .sort();
    } catch (error) {
      logger.debug('No screenshots found or error reading screenshot directory', error);
      return [];
    }
  }

  /**
   * Clean up old screenshots (keep only recent ones)
   * @param keepCount - Number of recent screenshots to keep (default: 10)
   */
  public async cleanupOldScreenshots(keepCount: number = 10): Promise<void> {
    try {
      const screenshots = await this.getAllScreenshots();
      
      if (screenshots.length <= keepCount) {
        return;
      }

      const toDelete = screenshots.slice(0, screenshots.length - keepCount);
      
      for (const filePath of toDelete) {
        await fs.unlink(filePath);
        logger.debug(`Deleted old screenshot: ${filePath}`);
      }
    } catch (error) {
      logger.warn('Failed to cleanup old screenshots', error);
    }
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Initialize screenshot directory
   */
  private async initializeScreenshotDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create screenshot directory: ${this.screenshotDir}`, error);
      throw error;
    }
  }

  /**
   * Generate unique filename for screenshot
   * @param name - Base name
   * @param type - Screenshot type
   * @returns string - Generated filename
   */
  private generateFileName(name: string, type: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const counter = String(++this.screenshotCounter).padStart(3, '0');
    const sanitizedName = this.sanitizeFileName(name);
    
    return `${counter}_${type}_${sanitizedName}_${timestamp}.png`;
  }

  /**
   * Sanitize filename to remove invalid characters
   * @param fileName - Original filename
   * @returns string - Sanitized filename
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }
}

/**
 * Factory function to create screenshot helper
 * @param page - Playwright page instance
 * @param testName - Name of the current test
 * @returns ScreenshotHelper instance
 */
export function createScreenshotHelper(page: Page, testName: string): ScreenshotHelper {
  return new ScreenshotHelper(page, testName);
}
