/**
 * Sauce Demo Cart Page Object
 * 
 * Comprehensive cart page for https://www.saucedemo.com/cart.html
 * Demonstrates cart management, checkout flow, and validation
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';

export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class SauceDemoCartPage extends BasePage {
  // Required abstract properties
  public readonly url = 'https://www.saucedemo.com/cart.html';

  /**
   * Override getFullUrl since Sauce Demo is an external site
   * @returns string - Full URL
   */
  protected override getFullUrl(): string {
    return this.url;
  }
  public readonly pageTitle = 'Swag Labs';

  // Header elements
  private readonly cartHeader: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;
  
  // Cart items
  private readonly cartItems: Locator;
  private readonly removeButtons: Locator;
  
  // Checkout form elements
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.cartHeader = page.locator('.title');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    
    this.cartItems = page.locator('.cart_item');
    this.removeButtons = page.locator('button[id*="remove"]');
    
    // Checkout form
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Implement required abstract method - verify page elements
   */
  protected async verifyPageElements(): Promise<void> {
    await this.assertVisible(this.cartHeader);
    await this.assertVisible(this.continueShoppingButton);
    await this.assertVisible(this.checkoutButton);
  }

  /**
   * Implement required abstract method - wait for page specific elements
   */
  protected async waitForPageSpecificElements(): Promise<void> {
    await this.waitForVisible(this.cartHeader);
  }

  /**
   * Navigate to cart page and verify it loads
   */
  async navigateToCart(): Promise<void> {
    const startTime = Date.now();
    
    logger.info('🌐 Navigating to cart page');
    await this.goto();
    
    await this.waitForPageLoad();
    await this.waitForVisible(this.cartHeader);
    
    const loadTime = Date.now() - startTime;
    logger.info('✅ Cart page loaded successfully', { loadTime });
    
    await this.verifyPageElements();
  }

  /**
   * Get all items in cart
   */
  async getCartItems(): Promise<CartItem[]> {
    logger.info('🛒 Retrieving cart items');
    
    const itemCount = await this.cartItems.count();
    const cartItems: CartItem[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const item = this.cartItems.nth(i);
      const nameElement = item.locator('.inventory_item_name');
      const descElement = item.locator('.inventory_item_desc');
      const priceElement = item.locator('.inventory_item_price');
      const quantityElement = item.locator('.cart_quantity');
      
      const name = await this.getText(nameElement);
      const description = await this.getText(descElement);
      const priceText = await this.getText(priceElement);
      const quantityText = await this.getText(quantityElement);
      
      const price = parseFloat(priceText.replace('$', ''));
      const quantity = parseInt(quantityText);
      
      cartItems.push({
        name,
        description,
        price,
        quantity
      });
    }
    
    logger.info('✅ Retrieved cart items', { 
      itemCount: cartItems.length,
      items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity }))
    });
    
    return cartItems;
  }

  /**
   * Remove item from cart by name
   */
  async removeItemFromCart(itemName: string): Promise<void> {
    logger.info('🗑️ Removing item from cart', { itemName });
    
    const cartItems = await this.getCartItems();
    const itemIndex = cartItems.findIndex(item => item.name === itemName);
    
    if (itemIndex === -1) {
      throw new Error(`Item "${itemName}" not found in cart`);
    }
    
    const removeButton = this.removeButtons.nth(itemIndex);
    await this.click(removeButton);
    
    // Wait for item to be removed
    await this.page.waitForTimeout(1000);
    
    logger.info('✅ Item removed from cart successfully', { itemName });
  }

  /**
   * Continue shopping (go back to inventory)
   */
  async continueShopping(): Promise<void> {
    logger.info('🛍️ Continuing shopping');
    
    await this.click(this.continueShoppingButton);
    
    // Wait for navigation to inventory page
    await this.page.waitForURL('**/inventory.html', { timeout: 10000 });
    
    logger.info('✅ Navigated back to inventory');
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    logger.info('💳 Proceeding to checkout');
    
    await this.click(this.checkoutButton);
    
    // Wait for navigation to checkout step one
    await this.page.waitForURL('**/checkout-step-one.html', { timeout: 10000 });
    
    logger.info('✅ Navigated to checkout form');
  }

  /**
   * Fill checkout information
   */
  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    logger.info('📝 Filling checkout information', {
      firstName: info.firstName,
      lastName: info.lastName,
      postalCode: info.postalCode
    });
    
    await this.firstNameInput.clear();
    await this.fill(this.firstNameInput, info.firstName);
    await this.lastNameInput.clear();
    await this.fill(this.lastNameInput, info.lastName);
    await this.postalCodeInput.clear();
    await this.fill(this.postalCodeInput, info.postalCode);
    
    logger.info('✅ Checkout information filled');
  }

  /**
   * Continue to checkout overview
   */
  async continueToOverview(): Promise<void> {
    logger.info('➡️ Continuing to checkout overview');
    
    await this.click(this.continueButton);
    
    // Wait for navigation to checkout step two
    await this.page.waitForURL('**/checkout-step-two.html', { timeout: 10000 });
    
    logger.info('✅ Navigated to checkout overview');
  }

  /**
   * Complete checkout process
   */
  async completeCheckout(checkoutInfo: CheckoutInfo): Promise<void> {
    logger.info('🎯 Starting complete checkout process');
    
    // Step 1: Proceed to checkout
    await this.proceedToCheckout();
    
    // Step 2: Fill checkout information
    await this.fillCheckoutInfo(checkoutInfo);
    
    // Step 3: Continue to overview
    await this.continueToOverview();
    
    // Step 4: Finish checkout
    const finishButton = this.page.locator('[data-test="finish"]');
    await this.click(finishButton);
    
    // Wait for completion page
    await this.page.waitForURL('**/checkout-complete.html', { timeout: 10000 });
    
    logger.info('✅ Checkout completed successfully');
  }

  /**
   * Cancel checkout process
   */
  async cancelCheckout(): Promise<void> {
    logger.info('❌ Cancelling checkout');
    
    await this.click(this.cancelButton);
    
    // Wait for navigation back to cart
    await this.page.waitForURL('**/cart.html', { timeout: 10000 });
    
    logger.info('✅ Checkout cancelled, returned to cart');
  }

  /**
   * Get checkout error message
   */
  async getCheckoutErrorMessage(): Promise<string | null> {
    return await this.getText(this.errorMessage).catch(() => null);
  }

  /**
   * Validate checkout form with empty fields
   */
  async validateEmptyCheckoutForm(): Promise<{
    emptyFirstName: boolean;
    emptyLastName: boolean;
    emptyPostalCode: boolean;
  }> {
    logger.info('🧪 Testing checkout form validation');
    
    // Navigate to checkout if not already there
    if (!this.page.url().includes('checkout-step-one')) {
      await this.proceedToCheckout();
    }
    
    // Test empty first name
    await this.lastNameInput.clear();
    await this.fill(this.lastNameInput, 'Test');
    await this.postalCodeInput.clear();
    await this.fill(this.postalCodeInput, '12345');
    await this.click(this.continueButton);
    const emptyFirstNameError = await this.getCheckoutErrorMessage();
    
    // Test empty last name
    await this.firstNameInput.clear();
    await this.fill(this.firstNameInput, 'Test');
    await this.lastNameInput.clear();
    await this.click(this.continueButton);
    const emptyLastNameError = await this.getCheckoutErrorMessage();
    
    // Test empty postal code
    await this.lastNameInput.clear();
    await this.fill(this.lastNameInput, 'Test');
    await this.postalCodeInput.clear();
    await this.click(this.continueButton);
    const emptyPostalCodeError = await this.getCheckoutErrorMessage();
    
    const results = {
      emptyFirstName: !!emptyFirstNameError,
      emptyLastName: !!emptyLastNameError,
      emptyPostalCode: !!emptyPostalCodeError
    };
    
    logger.info('✅ Checkout form validation completed', results);
    return results;
  }

  /**
   * Calculate total cart value
   */
  async calculateCartTotal(): Promise<number> {
    const cartItems = await this.getCartItems();
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    logger.info('💰 Cart total calculated', { 
      itemCount: cartItems.length,
      total: `$${total.toFixed(2)}`
    });
    
    return total;
  }

  /**
   * Verify cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const itemCount = await this.cartItems.count();
    const isEmpty = itemCount === 0;
    
    logger.info('🔍 Cart empty check', { isEmpty, itemCount });
    return isEmpty;
  }



  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    logger.info('🧹 Clearing entire cart');
    
    const cartItems = await this.getCartItems();
    
    for (const item of cartItems) {
      await this.removeItemFromCart(item.name);
      await this.page.waitForTimeout(500); // Small delay between removals
    }
    
    logger.info('✅ Cart cleared successfully');
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get completion message from checkout complete page
   * @returns Completion message text
   */
  async getCompletionMessage(): Promise<string> {
    const completionHeader = await this.page.locator('.complete-header').textContent();
    return completionHeader || '';
  }

  /**
   * Get overview item count
   * @returns Number of items in overview
   */
  async getOverviewItemCount(): Promise<number> {
    return await this.page.locator('.cart_item').count();
  }

  /**
   * Get subtotal text from overview
   * @returns Subtotal text
   */
  async getSubtotalText(): Promise<string> {
    const subtotalText = await this.page.locator('.summary_subtotal_label').textContent();
    return subtotalText || '';
  }

  /**
   * Validate form accessibility
   * @returns Form accessibility validation results
   */
  async validateFormAccessibility(): Promise<{
    firstNameVisible: boolean;
    lastNameVisible: boolean;
    postalCodeVisible: boolean;
  }> {
    const firstNameInput = this.page.locator('[data-test="firstName"]');
    const lastNameInput = this.page.locator('[data-test="lastName"]');
    const postalCodeInput = this.page.locator('[data-test="postalCode"]');

    return {
      firstNameVisible: await firstNameInput.isVisible(),
      lastNameVisible: await lastNameInput.isVisible(),
      postalCodeVisible: await postalCodeInput.isVisible()
    };
  }
}
