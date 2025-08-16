/**
 * Wait Helpers Utility
 * 
 * Provides robust waiting mechanisms for various conditions in web automation
 * including element states, network requests, custom conditions, and timeouts.
 */

import type { Page, Locator, Response } from '@playwright/test';
import { expect } from '@playwright/test';
import { logger } from '@utils/core/logger';

/**
 * Wait Helper Class
 * Provides comprehensive waiting utilities for automation tests
 */
export class WaitHelpers {
  private page: Page;
  private defaultTimeout: number;

  /**
   * Constructor
   * @param page - Playwright page instance
   * @param defaultTimeout - Default timeout in milliseconds (default: 30000)
   */
  constructor(page: Page, defaultTimeout: number = 30000) {
    this.page = page;
    this.defaultTimeout = defaultTimeout;
  }

  // =============================================================================
  // ELEMENT WAITING METHODS
  // =============================================================================

  /**
   * Wait for element to be visible
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForVisible(selector: string | Locator, timeout?: number): Promise<Locator> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be visible: ${selector}`, { timeout: waitTimeout });

    try {
      await locator.waitFor({ state: 'visible', timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element not visible within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForHidden(selector: string | Locator, timeout?: number): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be hidden: ${selector}`, { timeout: waitTimeout });

    try {
      await locator.waitFor({ state: 'hidden', timeout: waitTimeout });
    } catch (error) {
      logger.error(`Element not hidden within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element to be attached to DOM
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForAttached(selector: string | Locator, timeout?: number): Promise<Locator> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be attached: ${selector}`, { timeout: waitTimeout });

    try {
      await locator.waitFor({ state: 'attached', timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element not attached within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element to be detached from DOM
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForDetached(selector: string | Locator, timeout?: number): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be detached: ${selector}`, { timeout: waitTimeout });

    try {
      await locator.waitFor({ state: 'detached', timeout: waitTimeout });
    } catch (error) {
      logger.error(`Element not detached within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element to be enabled
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForEnabled(selector: string | Locator, timeout?: number): Promise<Locator> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be enabled: ${selector}`, { timeout: waitTimeout });

    try {
      await expect(locator).toBeEnabled({ timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element not enabled within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element to be disabled
   * @param selector - CSS selector or Playwright locator
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForDisabled(selector: string | Locator, timeout?: number): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to be disabled: ${selector}`, { timeout: waitTimeout });

    try {
      await expect(locator).toBeDisabled({ timeout: waitTimeout });
    } catch (error) {
      logger.error(`Element not disabled within timeout: ${selector}`, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for element text to match expected value
   * @param selector - CSS selector or Playwright locator
   * @param expectedText - Expected text content
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForText(
    selector: string | Locator,
    expectedText: string | RegExp,
    timeout?: number
  ): Promise<Locator> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element text: ${selector}`, { expectedText, timeout: waitTimeout });

    try {
      await expect(locator).toHaveText(expectedText, { timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element text not matched within timeout: ${selector}`, {
        expectedText,
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  /**
   * Wait for element to contain specific text
   * @param selector - CSS selector or Playwright locator
   * @param expectedText - Expected text content
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForTextContains(
    selector: string | Locator,
    expectedText: string,
    timeout?: number
  ): Promise<Locator> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element to contain text: ${selector}`, {
      expectedText,
      timeout: waitTimeout,
    });

    try {
      await expect(locator).toContainText(expectedText, { timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element does not contain expected text within timeout: ${selector}`, {
        expectedText,
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  /**
   * Wait for element count to match expected value
   * @param selector - CSS selector
   * @param expectedCount - Expected number of elements
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Locator> - The element locator
   */
  public async waitForCount(
    selector: string,
    expectedCount: number,
    timeout?: number
  ): Promise<Locator> {
    const locator = this.page.locator(selector);
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for element count: ${selector}`, {
      expectedCount,
      timeout: waitTimeout,
    });

    try {
      await expect(locator).toHaveCount(expectedCount, { timeout: waitTimeout });
      return locator;
    } catch (error) {
      logger.error(`Element count not matched within timeout: ${selector}`, {
        expectedCount,
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  // =============================================================================
  // PAGE AND NAVIGATION WAITING METHODS
  // =============================================================================

  /**
   * Wait for page to load completely
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForPageLoad(timeout?: number): Promise<void> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug('Waiting for page to load completely', { timeout: waitTimeout });

    try {
      await this.page.waitForLoadState('load', { timeout: waitTimeout });
      await this.page.waitForLoadState('domcontentloaded', { timeout: waitTimeout });
      await this.page.waitForLoadState('networkidle', { timeout: waitTimeout });
    } catch (error) {
      logger.error('Page not loaded within timeout', { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for network to be idle
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForNetworkIdle(timeout?: number): Promise<void> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug('Waiting for network to be idle', { timeout: waitTimeout });

    try {
      await this.page.waitForLoadState('networkidle', { timeout: waitTimeout });
    } catch (error) {
      logger.error('Network not idle within timeout', { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Wait for specific URL or URL pattern
   * @param urlPattern - URL string or RegExp pattern
   * @param timeout - Timeout in milliseconds
   * @returns Promise<void>
   */
  public async waitForURL(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug('Waiting for URL pattern', { urlPattern, timeout: waitTimeout });

    try {
      await this.page.waitForURL(urlPattern, { timeout: waitTimeout });
    } catch (error) {
      logger.error('URL pattern not matched within timeout', { urlPattern, timeout: waitTimeout });
      throw error;
    }
  }

  // =============================================================================
  // NETWORK AND API WAITING METHODS
  // =============================================================================

  /**
   * Wait for specific network response
   * @param urlPattern - URL pattern to match
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Response> - The network response
   */
  public async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<Response> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug('Waiting for network response', { urlPattern, timeout: waitTimeout });

    try {
      const response = await this.page.waitForResponse(urlPattern, { timeout: waitTimeout });
      logger.debug('Network response received', {
        url: response.url(),
        status: response.status(),
      });
      return response;
    } catch (error) {
      logger.error('Network response not received within timeout', {
        urlPattern,
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  /**
   * Wait for specific network request
   * @param urlPattern - URL pattern to match
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Request> - The network request
   */
  public async waitForRequest(urlPattern: string | RegExp, timeout?: number): Promise<any> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug('Waiting for network request', { urlPattern, timeout: waitTimeout });

    try {
      const request = await this.page.waitForRequest(urlPattern, { timeout: waitTimeout });
      logger.debug('Network request intercepted', {
        url: request.url(),
        method: request.method(),
      });
      return request;
    } catch (error) {
      logger.error('Network request not intercepted within timeout', {
        urlPattern,
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  // =============================================================================
  // CUSTOM CONDITION WAITING METHODS
  // =============================================================================

  /**
   * Wait for custom condition to be true
   * @param condition - Function that returns a boolean or Promise<boolean>
   * @param description - Description of the condition for logging
   * @param timeout - Timeout in milliseconds
   * @param interval - Check interval in milliseconds (default: 1000)
   * @returns Promise<void>
   */
  public async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    description: string,
    timeout?: number,
    interval: number = 1000
  ): Promise<void> {
    const waitTimeout = timeout || this.defaultTimeout;
    const startTime = Date.now();

    logger.debug(`Waiting for custom condition: ${description}`, {
      timeout: waitTimeout,
      interval,
    });

    while (Date.now() - startTime < waitTimeout) {
      try {
        const result = await condition();
        if (result) {
          logger.debug(`Custom condition met: ${description}`);
          return;
        }
      } catch (error) {
        logger.debug(`Error checking condition: ${description}`, error);
      }

      await this.sleep(interval);
    }

    logger.error(`Custom condition not met within timeout: ${description}`, {
      timeout: waitTimeout,
    });
    throw new Error(`Timeout waiting for condition: ${description}`);
  }

  /**
   * Wait for JavaScript function to return true
   * @param jsFunction - JavaScript function as string
   * @param description - Description for logging
   * @param timeout - Timeout in milliseconds
   * @returns Promise<any> - Result of the JavaScript function
   */
  public async waitForFunction(
    jsFunction: string,
    description: string,
    timeout?: number
  ): Promise<any> {
    const waitTimeout = timeout || this.defaultTimeout;

    logger.debug(`Waiting for JavaScript function: ${description}`, { timeout: waitTimeout });

    try {
      const result = await this.page.waitForFunction(jsFunction, undefined, {
        timeout: waitTimeout,
      });
      logger.debug(`JavaScript function completed: ${description}`);
      return result;
    } catch (error) {
      logger.error(`JavaScript function not completed within timeout: ${description}`, {
        timeout: waitTimeout,
      });
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Sleep for specified duration
   * @param milliseconds - Duration to sleep in milliseconds
   * @returns Promise<void>
   */
  public async sleep(milliseconds: number): Promise<void> {
    logger.debug(`Sleeping for ${milliseconds}ms`);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Wait with exponential backoff
   * @param condition - Condition function
   * @param description - Description for logging
   * @param maxAttempts - Maximum number of attempts (default: 5)
   * @param baseDelay - Base delay in milliseconds (default: 1000)
   * @returns Promise<void>
   */
  public async waitWithBackoff(
    condition: () => boolean | Promise<boolean>,
    description: string,
    maxAttempts: number = 5,
    baseDelay: number = 1000
  ): Promise<void> {
    logger.debug(`Waiting with exponential backoff: ${description}`, {
      maxAttempts,
      baseDelay,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await condition();
        if (result) {
          logger.debug(`Condition met on attempt ${attempt}: ${description}`);
          return;
        }
      } catch (error) {
        logger.debug(`Attempt ${attempt} failed: ${description}`, error);
      }

      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.debug(`Waiting ${delay}ms before attempt ${attempt + 1}`);
        await this.sleep(delay);
      }
    }

    logger.error(`All attempts failed: ${description}`, { maxAttempts });
    throw new Error(`Failed after ${maxAttempts} attempts: ${description}`);
  }

  /**
   * Set default timeout for all wait operations
   * @param timeout - New default timeout in milliseconds
   */
  public setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
    logger.debug(`Default timeout set to ${timeout}ms`);
  }

  /**
   * Get current default timeout
   * @returns number - Current default timeout in milliseconds
   */
  public getDefaultTimeout(): number {
    return this.defaultTimeout;
  }
}

/**
 * Factory function to create wait helpers
 * @param page - Playwright page instance
 * @param defaultTimeout - Default timeout in milliseconds
 * @returns WaitHelpers instance
 */
export function createWaitHelpers(page: Page, defaultTimeout?: number): WaitHelpers {
  return new WaitHelpers(page, defaultTimeout);
}
