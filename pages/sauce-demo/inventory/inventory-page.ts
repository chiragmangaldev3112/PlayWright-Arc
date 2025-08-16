/**
 * Sauce Demo Inventory Page Object
 * 
 * Comprehensive product inventory page for https://www.saucedemo.com/inventory.html
 * Demonstrates product browsing, filtering, sorting, and cart operations
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export class SauceDemoInventoryPage extends BasePage {
  // Required abstract properties
  public readonly url = 'https://www.saucedemo.com/inventory.html';

  /**
   * Override getFullUrl since Sauce Demo is an external site
   * @returns string - Full URL
   */
  protected override getFullUrl(): string {
    return this.url;
  }
  public readonly pageTitle = 'Swag Labs';

  // Header elements
  private readonly appLogo: Locator;
  private readonly menuButton: Locator;
  private readonly cartButton: Locator;
  private readonly cartBadge: Locator;
  
  // Inventory elements
  private readonly inventoryContainer: Locator;
  private readonly inventoryItems: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.appLogo = page.locator('.app_logo');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.cartButton = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    
    this.inventoryContainer = page.locator('#inventory_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Implement required abstract method - verify page elements
   */
  protected async verifyPageElements(): Promise<void> {
    await this.assertVisible(this.appLogo);
    await this.assertVisible(this.menuButton);
    await this.assertVisible(this.cartButton);
    await this.assertVisible(this.inventoryContainer);
    await this.assertVisible(this.sortDropdown);
  }

  /**
   * Implement required abstract method - wait for page specific elements
   */
  protected async waitForPageSpecificElements(): Promise<void> {
    await this.waitForVisible(this.inventoryContainer);
    await this.waitForVisible(this.inventoryItems.first());
  }

  /**
   * Navigate to inventory page and verify it loads
   */
  async navigateToInventory(): Promise<void> {
    const startTime = Date.now();
    
    logger.info('🌐 Navigating to inventory page');
    await this.goto();
    
    await this.waitForPageLoad();
    await this.waitForVisible(this.inventoryContainer);
    
    const loadTime = Date.now() - startTime;
    logger.info('✅ Inventory page loaded successfully', { loadTime });
    
    await this.verifyPageElements();
  }

  /**
   * Get all products on the page
   */
  async getAllProducts(): Promise<Product[]> {
    logger.info('📦 Retrieving all products from inventory');
    
    await this.waitForVisible(this.inventoryItems.first());
    const itemCount = await this.inventoryItems.count();
    
    const products: Product[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const item = this.inventoryItems.nth(i);
      const nameElement = item.locator('.inventory_item_name');
      const descElement = item.locator('.inventory_item_desc');
      const priceElement = item.locator('.inventory_item_price');
      const imageElement = item.locator('.inventory_item_img img');
      
      const name = await this.getText(nameElement);
      const description = await this.getText(descElement);
      const priceText = await this.getText(priceElement);
      const imageUrl = await imageElement.getAttribute('src') || '';
      
      // Extract price number
      const price = parseFloat(priceText.replace('$', ''));
      
      // Generate ID from name
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      products.push({
        id,
        name,
        description,
        price,
        imageUrl
      });
    }
    
    logger.info('✅ Retrieved products from inventory', { 
      productCount: products.length,
      products: products.map(p => ({ name: p.name, price: p.price }))
    });
    
    return products;
  }

  /**
   * Add product to cart by name
   */
  async addProductToCart(productName: string): Promise<void> {
    logger.info('🛒 Adding product to cart', { productName });
    
    const products = await this.getAllProducts();
    const product = products.find(p => p.name === productName);
    
    if (!product) {
      throw new Error(`Product "${productName}" not found`);
    }
    
    // Find the add to cart button for this product
    const productId = product.id;
    const addButton = this.page.locator(`[data-test="add-to-cart-${productId}"]`);
    
    await this.click(addButton);
    
    // Wait for button to change to "Remove"
    await this.page.waitForSelector(`[data-test="remove-${productId}"]`, { timeout: 5000 });
    
    logger.info('✅ Product added to cart successfully', { productName });
  }

  /**
   * Remove product from cart by name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    logger.info('🗑️ Removing product from cart', { productName });
    
    const products = await this.getAllProducts();
    const product = products.find(p => p.name === productName);
    
    if (!product) {
      throw new Error(`Product "${productName}" not found`);
    }
    
    const productId = product.id;
    const removeButton = this.page.locator(`[data-test="remove-${productId}"]`);
    
    await this.click(removeButton);
    
    // Wait for button to change back to "Add to cart"
    await this.page.waitForSelector(`[data-test="add-to-cart-${productId}"]`, { timeout: 5000 });
    
    logger.info('✅ Product removed from cart successfully', { productName });
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    const badgeText = await this.getText(this.cartBadge).catch(() => null);
    const count = badgeText ? parseInt(badgeText) : 0;
    
    logger.info('🔢 Cart item count retrieved', { count });
    return count;
  }

  /**
   * Sort products by option
   */
  async sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    logger.info('🔄 Sorting products', { sortOption });
    
    await this.sortDropdown.selectOption(sortOption);
    
    // Wait for products to be re-sorted
    await this.page.waitForTimeout(1000);
    
    logger.info('✅ Products sorted successfully', { sortOption });
  }

  /**
   * Click on product to view details
   */
  async clickProductDetails(productName: string): Promise<void> {
    logger.info('👁️ Clicking product for details', { productName });
    
    const productLink = this.page.locator('.inventory_item_name', { hasText: productName });
    await this.click(productLink);
    
    // Wait for navigation to product details page
    await this.page.waitForURL('**/inventory-item.html*', { timeout: 10000 });
    
    logger.info('✅ Navigated to product details', { productName });
  }

  /**
   * Navigate to cart
   */
  async goToCart(): Promise<void> {
    logger.info('🛒 Navigating to cart');
    
    await this.click(this.cartButton);
    
    // Wait for navigation to cart page
    await this.page.waitForURL('**/cart.html', { timeout: 10000 });
    
    logger.info('✅ Navigated to cart successfully');
  }

  /**
   * Open hamburger menu
   */
  async openMenu(): Promise<void> {
    logger.info('📱 Opening hamburger menu');
    
    await this.click(this.menuButton);
    
    // Wait for menu to be visible
    await this.page.waitForSelector('.bm-menu-wrap', { state: 'visible', timeout: 5000 });
    
    logger.info('✅ Menu opened successfully');
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    logger.info('🚪 Logging out from application');
    
    await this.openMenu();
    
    const logoutLink = this.page.locator('#logout_sidebar_link');
    await this.click(logoutLink);
    
    // Wait for navigation back to login page
    await this.page.waitForURL('**/index.html', { timeout: 10000 });
    
    logger.info('✅ Logged out successfully');
  }



  /**
   * Verify products are loaded
   */
  async verifyProductsLoaded(): Promise<boolean> {
    const itemCount = await this.inventoryItems.count();
    const isLoaded = itemCount > 0;
    
    logger.info('📦 Product loading verification', { 
      itemCount, 
      isLoaded 
    });
    
    return isLoaded;
  }

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    const filteredProducts = allProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    logger.info('💰 Filtered products by price range', {
      minPrice,
      maxPrice,
      totalProducts: allProducts.length,
      filteredCount: filteredProducts.length
    });
    
    return filteredProducts;
  }

  /**
   * Add multiple products to cart
   */
  async addMultipleProductsToCart(productNames: string[]): Promise<void> {
    logger.info('🛒 Adding multiple products to cart', { productNames });
    
    for (const productName of productNames) {
      await this.addProductToCart(productName);
      await this.page.waitForTimeout(500); // Small delay between additions
    }
    
    logger.info('✅ All products added to cart successfully');
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if hamburger menu is visible
   */
  async isMenuVisible(): Promise<boolean> {
    const menuElement = this.page.locator('.bm-menu-wrap');
    return await menuElement.isVisible();
  }

  /**
   * Navigate back in browser history
   */
  override async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Measure page load performance
   */
  async measurePageLoadPerformance(): Promise<{ loadTime: number; domContentLoaded: number }> {
    const startTime = Date.now();
    
    await this.goto();
    
    const loadTime = Date.now() - startTime;
    const domContentLoaded = loadTime; // Simplified for this implementation
    
    return { loadTime, domContentLoaded };
  }

  /**
   * Validate product images
   */
  async validateProductImages(count: number): Promise<Array<{ isVisible: boolean; hasSrc: boolean }>> {
    const results: Array<{ isVisible: boolean; hasSrc: boolean }> = [];
    
    for (let i = 0; i < count; i++) {
      const imageElement = this.page.locator('.inventory_item_img img').nth(i);
      
      const isVisible = await imageElement.isVisible();
      const src = await imageElement.getAttribute('src');
      const hasSrc = !!src;
      
      results.push({ isVisible, hasSrc });
    }
    
    return results;
  }

  /**
   * Wait for timeout
   */
  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Reload the page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
  }
}
