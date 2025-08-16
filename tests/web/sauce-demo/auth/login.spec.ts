/**
 * Comprehensive Sauce Demo Login Tests
 * 
 * Tests all login scenarios using real website with framework utilities
 */

import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '@pages/sauce-demo/auth/login-page';
import { SauceDemoInventoryPage } from '@pages/sauce-demo/inventory/inventory-page';

test.describe('Sauce Demo Login Tests @web @login', () => {
  let loginPage: SauceDemoLoginPage;
  let inventoryPage: SauceDemoInventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SauceDemoLoginPage(page);
    inventoryPage = new SauceDemoInventoryPage(page);
    
    await loginPage.navigateToLogin();
  });

  test('should login with valid standard user credentials @smoke', async () => {
    const credentials = {
      username: 'standard_user',
      password: 'secret_sauce'
    };

    const result = await loginPage.login(credentials);

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toContain('inventory.html');
    expect(result.timing.loginDuration).toBeLessThan(5000);
    
    // Verify we're on inventory page
    await inventoryPage.verifyProductsLoaded();
    expect(await inventoryPage.verifyProductsLoaded()).toBe(true);
  });

  test('should fail login with locked out user @security', async () => {
    const credentials = {
      username: 'locked_out_user',
      password: 'secret_sauce'
    };

    const result = await loginPage.login(credentials);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('locked out');
  });

  test('should fail login with invalid credentials @security', async () => {
    const credentials = {
      username: 'invalid_user',
      password: 'wrong_password'
    };

    const result = await loginPage.testInvalidLogin(credentials);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBeTruthy();
  });

  test('should fail login with empty credentials @validation', async () => {
    const result = await loginPage.testEmptyFieldsLogin();

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Username is required');
  });

  test('should validate form fields properly @validation', async () => {
    const validation = await loginPage.testFormValidation();

    expect(validation.emptyUsername).toBe(true);
    expect(validation.emptyPassword).toBe(true);
    expect(validation.emptyBoth).toBe(true);
  });

  test('should clear login form successfully @ui', async () => {
    // Fill form first
    await loginPage.login({
      username: 'test_user',
      password: 'test_pass'
    });

    // Clear form
    await loginPage.clearLoginForm();

    // Verify fields are empty
    const usernameValue = await loginPage.getUsernameValue();
    const passwordValue = await loginPage.getPasswordValue();

    expect(usernameValue).toBe('');
    expect(passwordValue).toBe('');
  });

  test('should have login button enabled by default @ui', async () => {
    const isEnabled = await loginPage.isLoginButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  test('should retrieve available test users @data', async () => {
    const users = await loginPage.getAvailableTestUsers();
    
    expect(users.length).toBeGreaterThan(0);
    expect(users.some(user => user.includes('standard_user'))).toBe(true);
  });

  test('should measure login performance @performance', async () => {
    const startTime = Date.now();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000);
  });

  test('should handle problem user login @edge-case', async () => {
    const credentials = {
      username: 'problem_user',
      password: 'secret_sauce'
    };

    const result = await loginPage.login(credentials);

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toContain('inventory.html');
  });

  test('should handle performance glitch user @performance', async () => {
    const credentials = {
      username: 'performance_glitch_user',
      password: 'secret_sauce'
    };

    const startTime = Date.now();
    const result = await loginPage.login(credentials);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    // Performance glitch user might take longer
    expect(duration).toBeLessThan(15000);
  });

  test('should maintain session after successful login @session', async () => {
    // Login successfully
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });

    // Navigate to different page and back
    await inventoryPage.navigateToInventory();
    
    // Verify still logged in (no redirect to login)
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('inventory.html');
  });

  test('should display appropriate error messages @accessibility', async () => {
    // Test with empty username
    await loginPage.login({
      username: '',
      password: 'secret_sauce'
    });

    const errorMessage = await loginPage.getCurrentErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Username is required');
  });
});
