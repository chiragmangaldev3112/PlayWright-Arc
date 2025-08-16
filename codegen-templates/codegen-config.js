/**
 * Custom Playwright Codegen Configuration
 * Generates tests following our coding standards and folder architecture
 */

const fs = require('fs');
const path = require('path');

class CustomCodegenGenerator {
  constructor() {
    this.testTemplate = this.loadTemplate('test-template.ts');
    this.pageObjectTemplate = this.loadTemplate('page-object-template.ts');
  }

  loadTemplate(templateName) {
    const templatePath = path.join(__dirname, templateName);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return null;
  }

  generateTest(options = {}) {
    const {
      testName = 'generated-test',
      describeBlock = 'Generated Test Suite',
      tags = '@smoke @generated',
      testType = 'web',
      outputDir = 'web/generated',
      actions = [],
      url = ''
    } = options;

    // Generate test steps from recorded actions
    const testSteps = this.generateTestSteps(actions, testType);
    
    // Replace template placeholders
    let testContent = this.testTemplate
      .replace(/\{\{DESCRIBE_BLOCK\}\}/g, describeBlock)
      .replace(/\{\{TEST_NAME\}\}/g, testName)
      .replace(/\{\{TAGS\}\}/g, tags)
      .replace(/\{\{TEST_STEPS\}\}/g, testSteps);

    // Add appropriate imports based on test type
    const imports = this.generateImports(testType, outputDir, testName);
    if (imports) {
      testContent = `${imports}\n${testContent}`;
    }

    return {
      content: testContent,
      filename: `${testName}.spec.ts`,
      path: `tests/${outputDir}`
    };
  }

  generateTestSteps(actions, testType) {
    if (!actions || actions.length === 0) {
      return this.getDefaultTestSteps(testType);
    }

    const steps = actions.map(action => {
      switch (action.type) {
        case 'goto':
          return `      // Navigate to page
      await page.goto('${action.url}');
      await page.waitForLoadState('networkidle');`;
        
        case 'click':
          return `      // Click element
      await page.click('${action.selector}');`;
        
        case 'fill':
          return `      // Fill input field
      await page.fill('${action.selector}', '${action.value}');`;
        
        case 'select':
          return `      // Select option
      await page.selectOption('${action.selector}', '${action.value}');`;
        
        case 'check':
          return `      // Check checkbox
      await page.check('${action.selector}');`;
        
        case 'uncheck':
          return `      // Uncheck checkbox
      await page.uncheck('${action.selector}');`;
        
        case 'hover':
          return `      // Hover over element
      await page.hover('${action.selector}');`;
        
        case 'wait':
          return `      // Wait for element
      await page.waitForSelector('${action.selector}');`;
        
        case 'assert':
          return `      // Verify element
      await expect(page.locator('${action.selector}')).${action.assertion};`;
        
        default:
          return `      // ${action.type}: ${action.description || 'Custom action'}`;
      }
    });

    return steps.join('\n\n');
  }

  getDefaultTestSteps(testType) {
    switch (testType) {
      case 'web':
        return `      // Navigate to the page
      await page.goto('https://example.com');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Add your test steps here
      // Example: await page.click('[data-test="login-button"]');
      
      // Add assertions
      // Example: await expect(page).toHaveURL(/.*dashboard/);
      await expect(page).toHaveTitle(/.*/);`;
      
      case 'api':
        return `      // Create API request context
      const apiContext = await request.newContext();
      
      // Make API request
      const response = await apiContext.get('/api/endpoint');
      
      // Validate response
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');`;
      
      case 'mobile':
        return `      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to mobile page
      await page.goto('https://example.com');
      
      // Add mobile-specific interactions
      // Example: await page.tap('[data-test="mobile-menu"]');
      
      // Add assertions
      await expect(page.locator('[data-test="mobile-content"]')).toBeVisible();`;
      
      default:
        return `      // Add your test steps here
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/.*/);`;
    }
  }

  generateImports(testType, outputDir, testName) {
    const imports = [];
    
    switch (testType) {
      case 'api':
        imports.push("import { request } from '@playwright/test';");
        break;
      
      case 'web':
        // Add page object import if it exists
        const pageClassName = this.toPascalCase(testName) + 'Page';
        imports.push(`import { ${pageClassName} } from '@pages/${outputDir}/${testName}-page';`);
        break;
    }
    
    return imports.join('\n');
  }

  generatePageObject(options = {}) {
    const {
      testName = 'generated-page',
      pageName = 'Generated Page',
      pageUrl = '/',
      pageTitle = 'Generated Page',
      elements = [],
      methods = []
    } = options;

    const pageClassName = this.toPascalCase(testName) + 'Page';
    const camelCaseName = this.toCamelCase(testName);

    // Generate page elements
    const pageElements = elements.length > 0 
      ? elements.map(el => `  private readonly ${el.name}: Locator = this.page.locator('${el.selector}');`).join('\n')
      : `  private readonly mainContainer: Locator = this.page.locator('[data-test="main-container"]');
  private readonly submitButton: Locator = this.page.locator('[data-test="submit-button"]');`;

    // Generate element verifications
    const elementVerifications = elements.length > 0
      ? elements.map(el => `    await this.waitForVisible(this.${el.name});`).join('\n')
      : `    await this.waitForVisible(this.mainContainer);
    await this.waitForVisible(this.submitButton);`;

    // Generate wait for elements
    const waitElements = elements.length > 0
      ? `    await this.waitForVisible(this.${elements[0].name});`
      : `    await this.waitForVisible(this.mainContainer);`;

    // Generate custom methods
    const customMethods = methods.length > 0
      ? methods.map(method => this.generatePageMethod(method)).join('\n\n')
      : `  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    logger.info('📝 Submitting form');
    await this.click(this.submitButton);
    logger.info('✅ Form submitted successfully');
  }`;

    // Replace template placeholders
    let pageContent = this.pageObjectTemplate
      .replace(/\{\{PAGE_CLASS_NAME\}\}/g, pageClassName)
      .replace(/\{\{CAMEL_CASE_NAME\}\}/g, camelCaseName)
      .replace(/\{\{PAGE_NAME\}\}/g, pageName)
      .replace(/\{\{PAGE_DESCRIPTION\}\}/g, `Handles ${pageName} functionality and interactions`)
      .replace(/\{\{PAGE_URL\}\}/g, pageUrl)
      .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
      .replace(/\{\{PAGE_ELEMENTS\}\}/g, pageElements)
      .replace(/\{\{ELEMENT_VERIFICATIONS\}\}/g, elementVerifications)
      .replace(/\{\{WAIT_FOR_ELEMENTS\}\}/g, waitElements)
      .replace(/\{\{CUSTOM_METHODS\}\}/g, customMethods);

    return {
      content: pageContent,
      filename: `${testName}-page.ts`,
      path: `src/pages/${options.outputDir || 'web/generated'}`
    };
  }

  generatePageMethod(method) {
    return `  /**
   * ${method.description || method.name}
   */
  async ${method.name}(${method.params || ''}): Promise<${method.returnType || 'void'}> {
    logger.info('🎯 ${method.description || method.name}');
    ${method.implementation || '// Add implementation here'}
    logger.info('✅ ${method.description || method.name} completed');
  }`;
  }

  toPascalCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
              .replace(/^[a-z]/, (g) => g.toUpperCase());
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  // Method to determine test type and folder structure based on URL
  determineTestType(url) {
    if (url.includes('/api/')) {
      return { type: 'api', folder: 'api' };
    } else if (url.includes('mobile') || url.includes('m.')) {
      return { type: 'mobile', folder: 'mobile' };
    } else {
      return { type: 'web', folder: 'web' };
    }
  }

  // Method to suggest tags based on URL and actions
  suggestTags(url, actions = []) {
    const tags = ['@generated'];
    
    // Add priority tag
    tags.push('@medium');
    
    // Add functional tags based on URL
    if (url.includes('login') || url.includes('auth')) {
      tags.push('@auth');
    }
    if (url.includes('api')) {
      tags.push('@api');
    }
    if (url.includes('checkout') || url.includes('payment')) {
      tags.push('@critical');
    }
    
    // Add test type tags based on actions
    const hasFormFill = actions.some(a => a.type === 'fill');
    const hasNavigation = actions.some(a => a.type === 'goto');
    
    if (hasFormFill) {
      tags.push('@ui');
    }
    if (hasNavigation) {
      tags.push('@navigation');
    }
    
    // Add smoke tag for simple tests
    if (actions.length <= 5) {
      tags.push('@smoke');
    }
    
    return tags.join(' ');
  }
}

module.exports = CustomCodegenGenerator;
