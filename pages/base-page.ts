/**
 * Base Page Object Model
 * 
 * Provides common functionality for all page objects including
 * navigation, element interactions, waiting, and screenshot capabilities.
 */

import { Page, Locator, expect } from '@playwright/test';
// Base page object imports - no additional types needed
import { logger } from '@utils/core/logger';
import { ScreenshotHelper } from '@utils/testing/screenshot-helper';
import { WaitHelpers } from '@utils/testing/wait-helpers';
import { config } from '@config/config-loader';

/**
 * Base Page Class
 * All page objects should extend this class
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;
  protected abstract readonly url: string;
  protected abstract readonly pageTitle: string;

  /**
   * Constructor
   * @param page - Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = config.getConfig().baseUrl;
  }

  // =============================================================================
  // NAVIGATION METHODS
  // =============================================================================

  /**
   * Navigate to this page
   * @param waitForLoad - Whether to wait for page load (default: true)
   * @returns Promise<void>
   */
  public async goto(waitForLoad: boolean = true): Promise<void> {
    const fullUrl = this.getFullUrl();
    logger.info(`Navigating to: ${fullUrl}`);

    await this.page.goto(fullUrl);

    if (waitForLoad) {
      await this.waitForPageLoad();
    }

    logger.info(`Successfully navigated to: ${fullUrl}`);
  }

  /**
   * Reload the current page
   * @param waitForLoad - Whether to wait for page load (default: true)
   * @returns Promise<void>
   */
  public async reload(waitForLoad: boolean = true): Promise<void> {
    logger.info('Reloading page');
    
    await this.page.reload();

    if (waitForLoad) {
      await this.waitForPageLoad();
    }

    logger.info('Page reloaded successfully');
  }

  /**
   * Go back in browser history
   * @param waitForLoad - Whether to wait for page load (default: true)
   * @returns Promise<void>
   */
  public async goBack(waitForLoad: boolean = true): Promise<void> {
    logger.info('Going back in browser history');
    
    await this.page.goBack();

    if (waitForLoad) {
      await this.waitForPageLoad();
    }

    logger.info('Successfully went back');
  }

  /**
   * Go forward in browser history
   * @param waitForLoad - Whether to wait for page load (default: true)
   * @returns Promise<void>
   */
  public async goForward(waitForLoad: boolean = true): Promise<void> {
    logger.info('Going forward in browser history');
    
    await this.page.goForward();

    if (waitForLoad) {
      await this.waitForPageLoad();
    }

    logger.info('Successfully went forward');
  }

  // =============================================================================
  // PAGE VERIFICATION METHODS
  // =============================================================================

  /**
   * Wait for page to load completely
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForPageLoad(timeout?: number): Promise<void> {
    const waitHelpers = new WaitHelpers(this.page);
    await waitHelpers.waitForPageLoad(timeout);
    await this.waitForPageSpecificElements();
  }

  /**
   * Verify that we are on the correct page
   * @returns Promise<void>
   */
  public async verifyPage(): Promise<void> {
    logger.info(`Verifying page: ${this.pageTitle}`);

    // Check URL
    await this.verifyUrl();

    // Check page title
    await this.verifyTitle();

    // Check page-specific elements
    await this.verifyPageElements();

    logger.info(`Page verification completed: ${this.pageTitle}`);
  }

  /**
   * Verify current URL matches expected URL
   * @returns Promise<void>
   */
  public async verifyUrl(): Promise<void> {
    const currentUrl = this.page.url();
    const expectedUrl = this.getFullUrl();

    expect(currentUrl, `Expected URL to be ${expectedUrl}, but got ${currentUrl}`).toBe(expectedUrl);
    logger.debug(`URL verification passed: ${currentUrl}`);
  }

  /**
   * Verify page title
   * @returns Promise<void>
   */
  public async verifyTitle(): Promise<void> {
    const actualTitle = await this.page.title();
    expect(actualTitle, `Expected title to contain "${this.pageTitle}", but got "${actualTitle}"`).toContain(this.pageTitle);
    logger.debug(`Title verification passed: ${actualTitle}`);
  }

  /**
   * Abstract method for page-specific element verification
   * Should be implemented by each page object
   * @returns Promise<void>
   */
  protected abstract verifyPageElements(): Promise<void>;

  /**
   * Abstract method for waiting for page-specific elements
   * Should be implemented by each page object
   * @returns Promise<void>
   */
  protected abstract waitForPageSpecificElements(): Promise<void>;

  // =============================================================================
  // ELEMENT INTERACTION METHODS
  // =============================================================================

  /**
   * Click an element with enhanced error handling and logging
   * @param locator - Element locator
   * @param options - Click options
   * @returns Promise<void>
   */
  public async click(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Clicking element: ${elementDescription}`);

    try {
      await locator.click(options);
      logger.debug(`Successfully clicked: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to click element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`click-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Fill input field with enhanced error handling and logging
   * @param locator - Input element locator
   * @param value - Value to fill
   * @param options - Fill options
   * @returns Promise<void>
   */
  public async fill(locator: Locator, value: string, options?: { timeout?: number }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Filling element: ${elementDescription} with value: ${value}`);

    try {
      await locator.fill(value, options);
      logger.debug(`Successfully filled: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to fill element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`fill-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Type text with enhanced error handling and logging
   * @param locator - Element locator
   * @param text - Text to type
   * @param options - Type options
   * @returns Promise<void>
   */
  public async type(locator: Locator, text: string, options?: { delay?: number; timeout?: number }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Typing in element: ${elementDescription} with text: ${text}`);

    try {
      await locator.type(text, options);
      logger.debug(`Successfully typed in: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to type in element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`type-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Select option from dropdown
   * @param locator - Select element locator
   * @param value - Value to select
   * @param options - Select options
   * @returns Promise<void>
   */
  public async selectOption(locator: Locator, value: string, options?: { timeout?: number }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Selecting option: ${value} in element: ${elementDescription}`);

    try {
      await locator.selectOption(value, options);
      logger.debug(`Successfully selected option: ${value} in: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to select option in element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`select-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Check checkbox or radio button
   * @param locator - Element locator
   * @param options - Check options
   * @returns Promise<void>
   */
  public async check(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Checking element: ${elementDescription}`);

    try {
      await locator.check(options);
      logger.debug(`Successfully checked: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to check element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`check-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Uncheck checkbox
   * @param locator - Element locator
   * @param options - Uncheck options
   * @returns Promise<void>
   */
  public async uncheck(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Unchecking element: ${elementDescription}`);

    try {
      await locator.uncheck(options);
      logger.debug(`Successfully unchecked: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to uncheck element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`uncheck-failed-${Date.now()}`);
      throw error;
    }
  }

  // =============================================================================
  // ELEMENT WAITING METHODS
  // =============================================================================

  /**
   * Wait for element to be visible
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Waiting for element to be visible: ${elementDescription}`);

    await locator.waitFor(timeout !== undefined ? { state: 'visible', timeout } : { state: 'visible' });
    logger.debug(`Element is now visible: ${elementDescription}`);
  }

  /**
   * Wait for element to be hidden
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Waiting for element to be hidden: ${elementDescription}`);

    await locator.waitFor(timeout !== undefined ? { state: 'hidden', timeout } : { state: 'hidden' });
    logger.debug(`Element is now hidden: ${elementDescription}`);
  }

  /**
   * Wait for element to be enabled
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForEnabled(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Waiting for element to be enabled: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toBeEnabled(options);
    logger.debug(`Element is now enabled: ${elementDescription}`);
  }

  /**
   * Wait for element to be disabled
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForDisabled(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Waiting for element to be disabled: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toBeDisabled(options);
    logger.debug(`Element is now disabled: ${elementDescription}`);
  }

  /**
   * Wait for custom condition
   * @param condition - Condition function
   * @param timeout - Timeout in milliseconds (optional)
   * @param interval - Check interval in milliseconds (optional)
   * @returns Promise<void>
   */
  public async waitForCondition(
    condition: () => Promise<boolean>,
    timeout?: number,
    interval?: number
  ): Promise<void> {
    const waitHelpers = new WaitHelpers(this.page);
    await waitHelpers.waitForCondition(condition, 'Custom condition', timeout, interval);
  }

  // =============================================================================
  // ASSERTION METHODS
  // =============================================================================

  /**
   * Assert element is visible
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async assertVisible(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Asserting element is visible: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toBeVisible(options);
    logger.debug(`Element visibility assertion passed: ${elementDescription}`);
  }

  /**
   * Assert element is hidden
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async assertHidden(locator: Locator, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Asserting element is hidden: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toBeHidden(options);
    logger.debug(`Element hidden assertion passed: ${elementDescription}`);
  }

  /**
   * Assert element contains text
   * @param locator - Element locator
   * @param text - Expected text
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async assertContainsText(locator: Locator, text: string, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Asserting element contains text "${text}": ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toContainText(text, options);
    logger.debug(`Text assertion passed: ${elementDescription}`);
  }

  /**
   * Assert element has exact text
   * @param locator - Element locator
   * @param text - Expected text
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async assertHasText(locator: Locator, text: string, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Asserting element has exact text "${text}": ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toHaveText(text, options);
    logger.debug(`Exact text assertion passed: ${elementDescription}`);
  }

  /**
   * Assert element has value
   * @param locator - Element locator
   * @param value - Expected value
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<void>
   */
  public async assertHasValue(locator: Locator, value: string, timeout?: number): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Asserting element has value "${value}": ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    await expect(locator).toHaveValue(value, options);
    logger.debug(`Value assertion passed: ${elementDescription}`);
  }

  // =============================================================================
  // SCREENSHOT METHODS
  // =============================================================================

  /**
   * Take page screenshot
   * @param name - Screenshot name
   * @returns Promise<string> - Screenshot path
   */
  public async takeScreenshot(name?: string): Promise<string> {
    const screenshotName = name || `${this.constructor.name}-${Date.now()}`;
    const screenshotHelper = new ScreenshotHelper(this.page, screenshotName);
    return screenshotHelper.captureFullPage(screenshotName);
  }

  /**
   * Take element screenshot
   * @param locator - Element locator
   * @param name - Screenshot name
   * @returns Promise<string> - Screenshot path
   */
  public async takeElementScreenshot(locator: Locator, name?: string): Promise<string> {
    const screenshotName = name || `element-${Date.now()}`;
    const screenshotHelper = new ScreenshotHelper(this.page, screenshotName);
    return screenshotHelper.captureElement(locator, screenshotName);
  }

  /**
   * Take failure screenshot (used internally)
   * @param name - Screenshot name
   * @returns Promise<string> - Screenshot path
   */
  protected async takeFailureScreenshot(name: string): Promise<string> {
    const screenshotHelper = new ScreenshotHelper(this.page, name);
    return screenshotHelper.captureFullPage(name);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get full URL for this page
   * @returns string - Full URL
   */
  protected getFullUrl(): string {
    return `${this.baseUrl}${this.url}`;
  }

  /**
   * Get element description for logging
   * @param locator - Element locator
   * @returns Promise<string> - Element description
   */
  protected async getElementDescription(locator: Locator): Promise<string> {
    try {
      // Try to get a meaningful description from the locator
      const locatorString = locator.toString();
      return locatorString.replace('locator(', '').replace(')', '');
    } catch {
      return 'Unknown element';
    }
  }

  /**
   * Scroll element into view
   * @param locator - Element locator
   * @returns Promise<void>
   */
  public async scrollIntoView(locator: Locator): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Scrolling element into view: ${elementDescription}`);

    await locator.scrollIntoViewIfNeeded();
    logger.debug(`Element scrolled into view: ${elementDescription}`);
  }

  /**
   * Hover over element
   * @param locator - Element locator
   * @param options - Hover options
   * @returns Promise<void>
   */
  public async hover(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Hovering over element: ${elementDescription}`);

    await locator.hover(options);
    logger.debug(`Successfully hovered over: ${elementDescription}`);
  }

  /**
   * Double click element
   * @param locator - Element locator
   * @param options - Double click options
   * @returns Promise<void>
   */
  public async doubleClick(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.info(`Double clicking element: ${elementDescription}`);

    try {
      await locator.dblclick(options);
      logger.debug(`Successfully double clicked: ${elementDescription}`);
    } catch (error) {
      logger.error(`Failed to double click element: ${elementDescription}`, error);
      await this.takeFailureScreenshot(`double-click-failed-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Right click element
   * @param locator - Element locator
   * @param options - Right click options
   * @returns Promise<void>
   */
  public async rightClick(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Right clicking element: ${elementDescription}`);

    await locator.click({ button: 'right', ...options });
    logger.debug(`Successfully right clicked: ${elementDescription}`);
  }

  /**
   * Get element text content
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<string> - Element text
   */
  public async getText(locator: Locator, timeout?: number): Promise<string> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Getting text from element: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    const text = await locator.textContent(options) || '';
    logger.debug(`Retrieved text "${text}" from: ${elementDescription}`);
    
    return text;
  }

  /**
   * Get element attribute value
   * @param locator - Element locator
   * @param attributeName - Attribute name
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<string | null> - Attribute value
   */
  public async getAttribute(locator: Locator, attributeName: string, timeout?: number): Promise<string | null> {
    const elementDescription = await this.getElementDescription(locator);
    logger.debug(`Getting attribute "${attributeName}" from element: ${elementDescription}`);

    const options = timeout !== undefined ? { timeout } : {};
    const value = await locator.getAttribute(attributeName, options);
    logger.debug(`Retrieved attribute value "${value}" from: ${elementDescription}`);
    
    return value;
  }

  /**
   * Check if element is visible
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise<boolean> - True if visible
   */
  public async isVisible(locator: Locator, timeout?: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout || 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param locator - Element locator
   * @returns Promise<boolean> - True if enabled
   */
  public async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  /**
   * Check if element is checked
   * @param locator - Element locator
   * @returns Promise<boolean> - True if checked
   */
  public async isChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }
}
