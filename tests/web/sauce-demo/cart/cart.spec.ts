/**
 * Comprehensive Sauce Demo Cart & Checkout Tests
 * 
 * Tests cart management, checkout flow, and payment processing
 */

import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '@pages/sauce-demo/auth/login-page';
import { SauceDemoInventoryPage } from '@pages/sauce-demo/inventory/inventory-page';
import { SauceDemoCartPage } from '@pages/sauce-demo/cart/cart-page';


test.describe('Sauce Demo Cart & Checkout Tests @web @cart', () => {
  let loginPage: SauceDemoLoginPage;
  let inventoryPage: SauceDemoInventoryPage;
  let cartPage: SauceDemoCartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SauceDemoLoginPage(page);
    inventoryPage = new SauceDemoInventoryPage(page);
    cartPage = new SauceDemoCartPage(page);
    
    // Login and add some products to cart
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    
    // Add products for testing
    await inventoryPage.addMultipleProductsToCart([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light'
    ]);
  });

  test('should display cart items correctly @smoke', async () => {
    await inventoryPage.goToCart();
    
    const cartItems = await cartPage.getCartItems();
    
    expect(cartItems.length).toBe(2);
    expect(cartItems[0]?.name).toBe('Sauce Labs Backpack');
    expect(cartItems[1]?.name).toBe('Sauce Labs Bike Light');
    
    // Verify each item has required properties
    cartItems.forEach(item => {
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.price).toBeGreaterThan(0);
      expect(item.quantity).toBe(1);
    });
  });

  test('should remove item from cart @cart-management', async () => {
    await inventoryPage.goToCart();
    
    const initialItems = await cartPage.getCartItems();
    expect(initialItems.length).toBe(2);
    
    await cartPage.removeItemFromCart('Sauce Labs Backpack');
    
    const remainingItems = await cartPage.getCartItems();
    expect(remainingItems.length).toBe(1);
    expect(remainingItems[0]?.name).toBe('Sauce Labs Bike Light');
  });

  test('should continue shopping from cart @navigation', async () => {
    await inventoryPage.goToCart();
    
    await cartPage.continueShopping();
    
    // Verify navigation back to inventory
    expect(await cartPage.getCurrentUrl()).toContain('inventory.html');
  });

  test('should calculate cart total correctly @calculations', async () => {
    await inventoryPage.goToCart();
    
    const cartItems = await cartPage.getCartItems();
    const calculatedTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cartTotal = await cartPage.calculateCartTotal();
    
    expect(cartTotal).toBe(calculatedTotal);
  });

  test('should proceed to checkout successfully @checkout', async () => {
    await inventoryPage.goToCart();
    
    await cartPage.proceedToCheckout();
    
    // Verify navigation to checkout form
    expect(await cartPage.getCurrentUrl()).toContain('checkout-step-one.html');
  });

  test('should complete full checkout process @checkout @smoke', async () => {
    await inventoryPage.goToCart();
    
    const checkoutInfo = {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345'
    };
    
    await cartPage.completeCheckout(checkoutInfo);
    
    // Verify successful completion
    expect(await cartPage.getCurrentUrl()).toContain('checkout-complete.html');
    
    // Verify completion message
    const completionHeader = await cartPage.getCompletionMessage();
    expect(completionHeader).toContain('Thank you for your order');
  });

  test('should validate checkout form fields @validation', async () => {
    await inventoryPage.goToCart();
    
    const validation = await cartPage.validateEmptyCheckoutForm();
    
    expect(validation.emptyFirstName).toBe(true);
    expect(validation.emptyLastName).toBe(true);
    expect(validation.emptyPostalCode).toBe(true);
  });

  test('should cancel checkout process @checkout', async () => {
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    await cartPage.cancelCheckout();
    
    // Verify navigation back to cart
    expect(await cartPage.getCurrentUrl()).toContain('cart.html');
  });

  test('should handle empty cart scenario @edge-case', async () => {
    await inventoryPage.goToCart();
    
    // Remove all items
    await cartPage.clearCart();
    
    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBe(true);
    
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(0);
  });

  test('should validate checkout with partial information @validation', async () => {
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Fill only first name
    await cartPage.fillCheckoutInfo({
      firstName: 'John',
      lastName: '',
      postalCode: ''
    });
    
    await cartPage.continueToOverview();
    
    const errorMessage = await cartPage.getCheckoutErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Last Name is required');
  });

  test('should maintain cart state during session @session', async () => {
    await inventoryPage.goToCart();
    
    const initialItems = await cartPage.getCartItems();
    expect(initialItems.length).toBe(2);
    
    // Navigate away and back
    await cartPage.continueShopping();
    await inventoryPage.goToCart();
    
    const finalItems = await cartPage.getCartItems();
    expect(finalItems.length).toBe(2);
  });

  test('should handle checkout with special characters @edge-case', async () => {
    await inventoryPage.goToCart();
    
    const checkoutInfo = {
      firstName: 'José',
      lastName: "O'Connor",
      postalCode: 'SW1A-1AA'
    };
    
    await cartPage.completeCheckout(checkoutInfo);
    
    // Verify successful completion with special characters
    expect(await cartPage.getCurrentUrl()).toContain('checkout-complete.html');
  });

  test('should verify checkout overview displays correct information @checkout', async () => {
    await inventoryPage.goToCart();
    
    const cartItems = await cartPage.getCartItems();
    const expectedTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutInfo({
      firstName: 'Test',
      lastName: 'User',
      postalCode: '12345'
    });
    await cartPage.continueToOverview();
    
    // Verify items are displayed in overview
    const overviewItems = await cartPage.getOverviewItemCount();
    expect(overviewItems).toBe(cartItems.length);
    
    // Verify total calculation
    const subtotalText = await cartPage.getSubtotalText();
    const subtotal = parseFloat(subtotalText?.replace('Item total: $', '') || '0');
    expect(subtotal).toBe(expectedTotal);
  });

  test('should handle rapid cart modifications @stress', async () => {
    await inventoryPage.goToCart();
    
    // Rapidly add and remove items
    for (let i = 0; i < 3; i++) {
      await cartPage.continueShopping();
      await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
      await inventoryPage.goToCart();
      
      const items = await cartPage.getCartItems();
      expect(items.length).toBe(3);
      
      await cartPage.removeItemFromCart('Sauce Labs Bolt T-Shirt');
    }
  });

  test('should validate cart item quantities @data-validation', async () => {
    await inventoryPage.goToCart();
    
    const cartItems = await cartPage.getCartItems();
    
    cartItems.forEach(item => {
      expect(item.quantity).toBe(1); // Sauce Demo doesn't support quantity changes
      expect(item.quantity).toBeGreaterThan(0);
    });
  });

  test('should handle checkout timeout scenarios @performance', async () => {
    await inventoryPage.goToCart();
    
    const startTime = Date.now();
    
    await cartPage.completeCheckout({
      firstName: 'Performance',
      lastName: 'Test',
      postalCode: '99999'
    });
    
    const checkoutTime = Date.now() - startTime;
    expect(checkoutTime).toBeLessThan(15000); // Should complete within 15 seconds
  });

  test('should verify checkout form accessibility @accessibility', async () => {
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Verify form inputs are accessible
    const formAccessibility = await cartPage.validateFormAccessibility();
    
    expect(formAccessibility.firstNameVisible).toBe(true);
    expect(formAccessibility.lastNameVisible).toBe(true);
    expect(formAccessibility.postalCodeVisible).toBe(true);
  });

  test('should handle multiple checkout attempts @edge-case', async () => {
    await inventoryPage.goToCart();
    
    // First attempt - cancel
    await cartPage.proceedToCheckout();
    await cartPage.cancelCheckout();
    
    // Second attempt - complete
    await cartPage.completeCheckout({
      firstName: 'Retry',
      lastName: 'User',
      postalCode: '54321'
    });
    
    expect(await cartPage.getCurrentUrl()).toContain('checkout-complete.html');
  });
});
