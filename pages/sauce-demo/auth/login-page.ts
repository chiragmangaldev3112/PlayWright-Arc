/**
 * Sauce Demo Login Page Object
 * 
 * Comprehensive login page for https://www.saucedemo.com
 * Demonstrates real-world login flow testing with all framework utilities
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';

// Simple security helper for masking sensitive data
class SecurityHelpers {
  static maskSensitiveData(data: string): string {
    if (!data || data.length <= 2) return '***';
    return data.substring(0, 2) + '*'.repeat(data.length - 2);
  }
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  errorMessage?: string;
  redirectUrl?: string;
  timing: {
    loginDuration: number;
    pageLoadDuration: number;
  };
}

export class SauceDemoLoginPage extends BasePage {
  // Required abstract properties
  public readonly url = 'https://www.saucedemo.com';

  /**
   * Override getFullUrl since Sauce Demo is an external site
   * @returns string - Full URL
   */
  protected override getFullUrl(): string {
    return this.url;
  }
  public readonly pageTitle = 'Swag Labs';

  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginContainer: Locator;
  private readonly loginLogo: Locator;
  private readonly credentialsInfo: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.usernameInput = this.page.locator('[data-test="username"]');
    this.passwordInput = this.page.locator('[data-test="password"]');
    this.loginButton = this.page.locator('[data-test="login-button"]');
    this.errorMessage = this.page.locator('[data-test="error"]');
    this.loginContainer = this.page.locator('.login_container');
    this.loginLogo = this.page.locator('.login_logo');
    this.credentialsInfo = this.page.locator('#login_credentials');
  }

  /**
   * Verify page elements are present
   */
  protected async verifyPageElements(): Promise<void> {
    logger.info('🔍 Verifying login page elements');
    
    await this.waitForVisible(this.usernameInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.loginButton);
    await this.waitForVisible(this.loginLogo);
    
    logger.info('✅ All login page elements verified');
  }

  /**
   * Wait for page-specific elements to load
   */
  protected async waitForPageSpecificElements(): Promise<void> {
    await this.waitForVisible(this.loginContainer);
    await this.waitForVisible(this.credentialsInfo);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    logger.info('🚀 Navigating to Sauce Demo login page');
    
    // Use simpler navigation to avoid infinite loop in waitForPageLoad
    const fullUrl = this.getFullUrl();
    logger.info(`Navigating to: ${fullUrl}`);
    
    await this.page.goto(fullUrl, { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for key elements to be visible
    await this.waitForVisible(this.usernameInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.loginButton);
    
    logger.info('✅ Successfully navigated to login page');
  }

  /**
   * Perform login with credentials
   * @param credentials Login credentials
   * @returns Login result with timing information
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const startTime = Date.now();
    
    logger.info('🔐 Attempting login', {
      username: SecurityHelpers.maskSensitiveData(credentials.username),
      password: SecurityHelpers.maskSensitiveData(credentials.password)
    });

    try {
      // Clear any existing values
      await this.clearLoginForm();
      
      // Fill credentials
      await this.fill(this.usernameInput, credentials.username);
      await this.fill(this.passwordInput, credentials.password);
      
      // Click login button
      const loginStartTime = Date.now();
      await this.click(this.loginButton);
      
      // Wait for navigation or error
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const currentUrl = this.page.url();
      const loginDuration = Date.now() - loginStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Check if login was successful (redirected to inventory page)
      if (currentUrl.includes('/inventory.html')) {
        logger.info('✅ Login successful', {
          username: SecurityHelpers.maskSensitiveData(credentials.username),
          redirectUrl: currentUrl,
          loginDuration,
          totalDuration
        });
        
        return {
          success: true,
          redirectUrl: currentUrl,
          timing: {
            loginDuration,
            pageLoadDuration: totalDuration
          }
        };
      } else {
        // Check for error message
        const errorText = await this.getCurrentErrorMessage();
        
        logger.warn('❌ Login failed', {
          username: SecurityHelpers.maskSensitiveData(credentials.username),
          error: errorText,
          currentUrl,
          loginDuration,
          totalDuration
        });
        
        return {
          success: false,
          errorMessage: errorText || 'Login failed - no error message displayed',
          timing: {
            loginDuration,
            pageLoadDuration: totalDuration
          }
        };
      }
      
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('💥 Login process failed', { 
        error: errorMessage,
        username: credentials.username,
        duration
      });
      
      return {
        success: false,
        errorMessage,
        timing: {
          loginDuration: duration,
          pageLoadDuration: duration
        }
      };
    }
  }

  /**
   * Get available test users from the page
   */
  async getAvailableTestUsers(): Promise<string[]> {
    logger.info('📋 Retrieving available test users');
    
    const credentialsText = await this.getText(this.credentialsInfo);
    const usernames = credentialsText
      .split('\n')
      .filter((line: string) => line.includes('standard_user') || line.includes('locked_out_user') || 
                     line.includes('problem_user') || line.includes('performance_glitch_user'))
      .map((line: string) => line.trim());
    
    logger.info('✅ Found test users', { users: usernames });
    return usernames;
  }

  /**
   * Test login with invalid credentials
   */
  async testInvalidLogin(credentials: LoginCredentials): Promise<LoginResult> {
    logger.info('🧪 Testing invalid login credentials');
    return await this.login(credentials);
  }

  /**
   * Test login with empty fields
   */
  async testEmptyFieldsLogin(): Promise<LoginResult> {
    logger.info('🧪 Testing login with empty fields');
    return await this.login({ username: '', password: '' });
  }

  /**
   * Get login button state
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Get current error message if any
   */
  async getCurrentErrorMessage(): Promise<string | null> {
    return await this.getText(this.errorMessage).catch(() => null);
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    logger.info('🧹 Clearing login form');
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    logger.info('✅ Login form cleared');
  }

  /**
   * Test form validation scenarios
   * @returns Validation test results
   */
  async testFormValidation(): Promise<{
    emptyUsername: boolean;
    emptyPassword: boolean;
    emptyBoth: boolean;
  }> {
    const results = {
      emptyUsername: false,
      emptyPassword: false,
      emptyBoth: false
    };

    try {
      // Test empty username
      await this.clearLoginForm();
      await this.fill(this.passwordInput, 'test_password');
      await this.click(this.loginButton);
      await this.page.waitForTimeout(1000); // Wait for error to appear
      const errorMessage1 = await this.getCurrentErrorMessage();
      results.emptyUsername = errorMessage1?.includes('Username') || false;

      // Clear and test empty password
      await this.clearLoginForm();
      await this.page.waitForTimeout(500); // Wait for form to clear
      await this.fill(this.usernameInput, 'test_user');
      await this.click(this.loginButton);
      await this.page.waitForTimeout(1000); // Wait for error to appear
      const errorMessage2 = await this.getCurrentErrorMessage();
      results.emptyPassword = errorMessage2?.includes('Password') || false;

      // Test both empty
      await this.clearLoginForm();
      await this.page.waitForTimeout(500); // Wait for form to clear
      await this.click(this.loginButton);
      await this.page.waitForTimeout(1000); // Wait for error to appear
      const errorMessage3 = await this.getCurrentErrorMessage();
      results.emptyBoth = errorMessage3?.includes('Username') || false;

    } catch (error) {
      logger.error('Form validation test failed:', error);
    }

    return results;
  }

  /**
   * Helper method to get input field value
   * @param locator Input field locator
   * @returns Input field value
   */
  private async getInputValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  /**
   * Get current username field value
   * @returns Username field value
   */
  async getUsernameValue(): Promise<string> {
    return await this.getInputValue(this.usernameInput);
  }

  /**
   * Get current password field value
   * @returns Password field value
   */
  async getPasswordValue(): Promise<string> {
    return await this.getInputValue(this.passwordInput);
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Fill username field
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Submit form using Enter key
   */
  async submitWithEnter(): Promise<void> {
    await this.passwordInput.press('Enter');
  }
}
