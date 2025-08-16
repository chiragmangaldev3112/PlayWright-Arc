/**
 * Comprehensive Sauce Demo Inventory Tests
 * 
 * Tests product browsing, filtering, sorting, and cart operations
 */

import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '@pages/sauce-demo/auth/login-page';
import { SauceDemoInventoryPage } from '@pages/sauce-demo/inventory/inventory-page';

test.describe('Sauce Demo Inventory Tests @web @inventory', () => {
  let loginPage: SauceDemoLoginPage;
  let inventoryPage: SauceDemoInventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SauceDemoLoginPage(page);
    inventoryPage = new SauceDemoInventoryPage(page);
    
    // Login before each test
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
  });

  test('should load inventory page with products @smoke', async () => {
    const products = await inventoryPage.getAllProducts();
    
    expect(products.length).toBeGreaterThan(0);
    expect(products.length).toBe(6); // Sauce Demo has 6 products
    
    // Verify each product has required fields
    products.forEach(product => {
      expect(product.name).toBeTruthy();
      expect(product.description).toBeTruthy();
      expect(product.price).toBeGreaterThan(0);
      expect(product.id).toBeTruthy();
    });
  });

  test('should add single product to cart @cart', async () => {
    const productName = 'Sauce Labs Backpack';
    
    await inventoryPage.addProductToCart(productName);
    
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(1);
  });

  test('should add multiple products to cart @cart', async () => {
    const productNames = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt'
    ];
    
    await inventoryPage.addMultipleProductsToCart(productNames);
    
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(3);
  });

  test('should remove product from cart @cart', async () => {
    const productName = 'Sauce Labs Backpack';
    
    // Add product first
    await inventoryPage.addProductToCart(productName);
    expect(await inventoryPage.getCartItemCount()).toBe(1);
    
    // Remove product
    await inventoryPage.removeProductFromCart(productName);
    expect(await inventoryPage.getCartItemCount()).toBe(0);
  });

  test('should sort products by name A-Z @sorting', async () => {
    await inventoryPage.sortProducts('az');
    
    const products = await inventoryPage.getAllProducts();
    const productNames = products.map(p => p.name);
    
    // Verify alphabetical order
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by name Z-A @sorting', async () => {
    await inventoryPage.sortProducts('za');
    
    const products = await inventoryPage.getAllProducts();
    const productNames = products.map(p => p.name);
    
    // Verify reverse alphabetical order
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by price low to high @sorting', async () => {
    await inventoryPage.sortProducts('lohi');
    
    const products = await inventoryPage.getAllProducts();
    const prices = products.map(p => p.price);
    
    // Verify ascending price order
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });

  test('should sort products by price high to low @sorting', async () => {
    await inventoryPage.sortProducts('hilo');
    
    const products = await inventoryPage.getAllProducts();
    const prices = products.map(p => p.price);
    
    // Verify descending price order
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);
  });

  test('should filter products by price range @filtering', async () => {
    const minPrice = 10;
    const maxPrice = 30;
    
    const filteredProducts = await inventoryPage.getProductsByPriceRange(minPrice, maxPrice);
    
    filteredProducts.forEach(product => {
      expect(product.price).toBeGreaterThanOrEqual(minPrice);
      expect(product.price).toBeLessThanOrEqual(maxPrice);
    });
  });

  test('should navigate to product details @navigation', async () => {
    const productName = 'Sauce Labs Backpack';
    
    await inventoryPage.clickProductDetails(productName);
    
    // Verify navigation to product details page
    expect(await inventoryPage.getCurrentUrl()).toContain('inventory-item.html');
  });

  test('should navigate to cart @navigation', async () => {
    await inventoryPage.goToCart();
    
    // Verify navigation to cart page
    expect(await inventoryPage.getCurrentUrl()).toContain('cart.html');
  });

  test('should open hamburger menu @ui', async () => {
    await inventoryPage.openMenu();
    
    // Verify menu is visible
    const menuVisible = await inventoryPage.isMenuVisible();
    expect(menuVisible).toBe(true);
  });

  test('should logout successfully @session', async () => {
    await inventoryPage.logout();
    
    // Verify navigation back to login page
    expect(await inventoryPage.getCurrentUrl()).toContain('index.html');
  });

  test('should measure page load performance @performance', async () => {
    const performanceMetrics = await inventoryPage.measurePageLoadPerformance();

    expect(performanceMetrics.loadTime).toBeLessThan(5000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
  });

  test('should handle cart operations with performance tracking @performance', async () => {
    const startTime = Date.now();
    
    // Add multiple products and measure time
    await inventoryPage.addMultipleProductsToCart([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt'
    ]);
    
    const addTime = Date.now() - startTime;
    expect(addTime).toBeLessThan(10000);
    
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(3);
  });

  test('should validate all product information @data-validation', async () => {
    const products = await inventoryPage.getAllProducts();
    
    products.forEach(product => {
      // Validate product name
      expect(product.name).toMatch(/^[A-Za-z0-9\s\-\.]+$/);
      
      // Validate price is positive number
      expect(product.price).toBeGreaterThan(0);
      expect(product.price).toBeLessThan(1000); // Reasonable upper limit
      
      // Validate description exists
      expect(product.description.length).toBeGreaterThan(10);
      
      // Validate image URL
      expect(product.imageUrl).toContain('.jpg');
    });
  });

  test('should handle edge case with problem user @edge-case', async () => {
    // Logout and login with problem user
    await inventoryPage.logout();
    await loginPage.login({
      username: 'problem_user',
      password: 'secret_sauce'
    });
    
    // Try to load products (problem user might have issues)
    const products = await inventoryPage.getAllProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  test('should maintain cart state during navigation @session', async () => {
    // Add products to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartItemCount()).toBe(1);
    
    // Navigate to product details and back
    await inventoryPage.clickProductDetails('Sauce Labs Bike Light');
    await inventoryPage.goBack();
    
    // Verify cart count is maintained
    expect(await inventoryPage.getCartItemCount()).toBe(1);
  });

  test('should verify product images load correctly @ui', async () => {
    // Check first few product images
    const imageValidation = await inventoryPage.validateProductImages(3);
    
    imageValidation.forEach((result: { isVisible: boolean; hasSrc: boolean }) => {
      expect(result.isVisible).toBe(true);
      expect(result.hasSrc).toBe(true);
    });
  });

  test('should handle rapid cart operations @stress', async () => {
    const productName = 'Sauce Labs Backpack';
    
    // Rapidly add and remove product multiple times
    for (let i = 0; i < 3; i++) {
      await inventoryPage.addProductToCart(productName);
      expect(await inventoryPage.getCartItemCount()).toBe(1);
      
      await inventoryPage.removeProductFromCart(productName);
      expect(await inventoryPage.getCartItemCount()).toBe(0);
    }
  });
});
