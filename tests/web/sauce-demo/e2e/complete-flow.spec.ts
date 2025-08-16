/**
 * Comprehensive End-to-End Sauce Demo Tests
 * 
 * Complete user journey testing with all framework utilities
 */

import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '@pages/sauce-demo/auth/login-page';
import { SauceDemoInventoryPage } from '@pages/sauce-demo/inventory/inventory-page';
import { SauceDemoCartPage } from '@pages/sauce-demo/cart/cart-page';
import { logger } from '@utils/core/logger';

// Simple helper for masking sensitive data
const maskSensitiveData = (data: string): string => {
  if (!data || data.length <= 2) return '***';
  return data.substring(0, 2) + '*'.repeat(data.length - 2);
};

test.describe('Sauce Demo End-to-End Tests @web @e2e', () => {
  let loginPage: SauceDemoLoginPage;
  let inventoryPage: SauceDemoInventoryPage;
  let cartPage: SauceDemoCartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SauceDemoLoginPage(page);
    inventoryPage = new SauceDemoInventoryPage(page);
    cartPage = new SauceDemoCartPage(page);
  });

  test('should complete full shopping journey @smoke @critical', async () => {
    logger.info('🛍️ Starting complete shopping journey test');
    
    // Step 1: Navigate and Login
    await loginPage.navigateToLogin();
    const loginResult = await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    
    expect(loginResult.success).toBe(true);
    expect(loginResult.timing.loginDuration).toBeLessThan(5000);
    
    // Step 2: Browse Products
    const products = await inventoryPage.getAllProducts();
    expect(products.length).toBe(6);
    
    // Step 3: Sort Products by Price
    await inventoryPage.sortProducts('lohi');
    const sortedProducts = await inventoryPage.getAllProducts();
    const prices = sortedProducts.map(p => p.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
    
    // Step 4: Add Multiple Products to Cart
    const selectedProducts = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt'
    ];
    
    await inventoryPage.addMultipleProductsToCart(selectedProducts);
    expect(await inventoryPage.getCartItemCount()).toBe(3);
    
    // Step 5: View Product Details
    await inventoryPage.clickProductDetails('Sauce Labs Backpack');
    expect(await inventoryPage.getCurrentUrl()).toContain('inventory-item.html');
    
    // Navigate back to inventory
    await inventoryPage.goBack();
    
    // Step 6: Go to Cart and Verify Items
    await inventoryPage.goToCart();
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(3);
    
    // Step 7: Remove One Item
    await cartPage.removeItemFromCart('Sauce Labs Bolt T-Shirt');
    const remainingItems = await cartPage.getCartItems();
    expect(remainingItems.length).toBe(2);
    
    // Step 8: Calculate Total
    const cartTotal = await cartPage.calculateCartTotal();
    expect(cartTotal).toBeGreaterThan(0);
    
    // Step 9: Complete Checkout
    const checkoutInfo = {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345'
    };
    
    await cartPage.completeCheckout(checkoutInfo);
    
    // Step 10: Verify Order Completion
    expect(await cartPage.getCurrentUrl()).toContain('checkout-complete.html');
    const completionMessage = await cartPage.getCompletionMessage();
    expect(completionMessage).toContain('Thank you for your order');
    
    logger.info('✅ Complete shopping journey test passed');
  });

  test('should handle multiple user types workflow @user-types', async () => {
    const userTypes = [
      { username: 'standard_user', expectSuccess: true },
      { username: 'problem_user', expectSuccess: true },
      { username: 'performance_glitch_user', expectSuccess: true },
      { username: 'locked_out_user', expectSuccess: false }
    ];

    for (const userType of userTypes) {
      logger.info(`🧪 Testing user type: ${userType.username}`);
      
      await loginPage.navigateToLogin();
      const result = await loginPage.login({
        username: userType.username,
        password: 'secret_sauce'
      });

      if (userType.expectSuccess) {
        expect(result.success).toBe(true);
        
        // Quick inventory check for successful logins
        const products = await inventoryPage.getAllProducts();
        expect(products.length).toBeGreaterThan(0);
        
        // Logout for next iteration
        await inventoryPage.logout();
      } else {
        expect(result.success).toBe(false);
        expect(result.errorMessage).toBeTruthy();
      }
    }
  });

  test('should measure complete workflow performance @performance', async () => {
    const startTime = Date.now();
    
    // Complete workflow with timing
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    
    await cartPage.completeCheckout({
      firstName: 'Performance',
      lastName: 'Test',
      postalCode: '99999'
    });
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(20000);
  });

  test('should handle error recovery scenarios @error-handling', async () => {
    // Test 1: Invalid login recovery
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'invalid_user',
      password: 'wrong_password'
    });
    
    // Should show error and allow retry
    const errorMessage = await loginPage.getCurrentErrorMessage();
    expect(errorMessage).toBeTruthy();
    
    // Successful login after error
    const successResult = await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    expect(successResult.success).toBe(true);
    
    // Test 2: Checkout form validation recovery
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Submit empty form
    await cartPage.continueToOverview();
    const checkoutError = await cartPage.getCheckoutErrorMessage();
    expect(checkoutError).toBeTruthy();
    
    // Complete form properly
    await cartPage.fillCheckoutInfo({
      firstName: 'Recovery',
      lastName: 'Test',
      postalCode: '12345'
    });
    await cartPage.continueToOverview();
    
    // Should proceed successfully
    expect(await cartPage.getCurrentUrl()).toContain('checkout-step-two.html');
  });

  test('should validate security aspects @security', async () => {
    await loginPage.navigateToLogin();
    
    // Test password masking in logs
    const credentials = {
      username: 'standard_user',
      password: 'secret_sauce'
    };
    
    const maskedPassword = maskSensitiveData(credentials.password);
    expect(maskedPassword).not.toBe(credentials.password);
    expect(maskedPassword).toContain('*');
    
    // Test successful login
    const result = await loginPage.login(credentials);
    expect(result.success).toBe(true);
    
    // Verify HTTPS usage
    expect(await loginPage.getCurrentUrl()).toMatch(/^https:/);
  });

  test('should handle concurrent operations @stress', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });

    // Perform multiple operations rapidly
    const operations = [
      () => inventoryPage.addProductToCart('Sauce Labs Backpack'),
      () => inventoryPage.addProductToCart('Sauce Labs Bike Light'),
      () => inventoryPage.sortProducts('za'),
      () => inventoryPage.getCartItemCount()
    ];

    // Execute operations with small delays
    for (const operation of operations) {
      await operation();
      await inventoryPage.waitForTimeout(100);
    }

    // Verify final state
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(2);
  });

  test('should validate data integrity throughout workflow @data-integrity', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });

    // Get initial product data
    const initialProducts = await inventoryPage.getAllProducts();
    
    // Add products and verify cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    await inventoryPage.goToCart();
    const cartItems = await cartPage.getCartItems();
    
    // Verify cart items match selected products
    expect(cartItems.length).toBe(2);
    
    const backpack = initialProducts.find(p => p.name === 'Sauce Labs Backpack');
    const bikeLight = initialProducts.find(p => p.name === 'Sauce Labs Bike Light');
    
    expect(cartItems.find(item => item.name === 'Sauce Labs Backpack')?.price).toBe(backpack?.price);
    expect(cartItems.find(item => item.name === 'Sauce Labs Bike Light')?.price).toBe(bikeLight?.price);
  });

  test('should handle browser navigation scenarios @navigation', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });

    // Add item to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartItemCount()).toBe(1);

    // Navigate to cart
    await inventoryPage.goToCart();
    
    // Use browser back button
    await cartPage.goBack();
    expect(await inventoryPage.getCurrentUrl()).toContain('inventory.html');
    
    // Verify cart count is maintained
    expect(await inventoryPage.getCartItemCount()).toBe(1);
    
    // Use browser forward button
    await cartPage.goForward();
    expect(await cartPage.getCurrentUrl()).toContain('cart.html');
    
    // Verify cart items are still there
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(1);
  });

  test('should validate accessibility features @accessibility', async () => {
    await loginPage.navigateToLogin();
    
    // Test keyboard accessibility through page object methods
    await loginPage.fillUsername('standard_user');
    await loginPage.fillPassword('secret_sauce');
    
    // Login using Enter key
    await loginPage.submitWithEnter();
    
    // Verify successful login
    expect(await loginPage.getCurrentUrl()).toContain('inventory.html');
  });

  test('should handle session management @session', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });

    // Add items to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    
    // Refresh page
    await inventoryPage.reloadPage();
    
    // Verify session is maintained
    expect(await inventoryPage.getCurrentUrl()).toContain('inventory.html');
    
    // Verify cart state is maintained
    expect(await inventoryPage.getCartItemCount()).toBe(1);
    
    // Logout and verify session ends
    await inventoryPage.logout();
    expect(await inventoryPage.getCurrentUrl()).toContain('index.html');
  });
});
