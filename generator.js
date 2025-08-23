// generator.js
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const pageName = args.pageName || 'GeneratedPage';
const testPrefix = args.testPrefix || 'generated';
const tags = args.tags || '@ui';

const RAW_DIR = path.resolve('./codegen-raw');
const PAGE_DIR = path.resolve('./pages');
const TEST_DIR = path.resolve('./tests/web');

if (!fs.existsSync(PAGE_DIR)) fs.mkdirSync(PAGE_DIR, { recursive: true });
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

function toCamelCase(selector) {
  return selector
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

function parseSteps(content) {
  const lines = content.split('\n').filter(l => l.trim() && l.includes('page.'));
  return lines.map(l => {
    const trimmed = l.trim();
    
    // Handle page.goto()
    if (trimmed.includes('page.goto')) {
      return { action: 'goto', raw: l, selector: null };
    }
    
    // Handle page.locator().click()
    if (trimmed.includes('.locator(') && trimmed.includes(').click()')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      return { action: 'click', raw: l, selector: sel };
    }
    
    // Handle page.getByRole().click()
    if (trimmed.includes('.getByRole(') && trimmed.includes(').click()')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        return { 
          action: 'click', 
          raw: l, 
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          methodName: `click${role.charAt(0).toUpperCase() + role.slice(1)}${name ? toCamelCase(name) : 'Button'}`
        };
      }
    }
    
    // Handle page.locator().fill()
    if (trimmed.includes('.locator(') && trimmed.includes(').fill(')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      return { action: 'fill', raw: l, selector: sel };
    }
    
    // Handle page.locator().press()
    if (trimmed.includes('.locator(') && trimmed.includes(').press(')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      const key = trimmed.match(/\.press\(['"`](.*?)['"`]\)/)?.[1];
      return { action: 'press', raw: l, selector: sel, key };
    }
    
    // Handle page.getByRole().click() with button text
    if (trimmed.includes('.getByRole(') && trimmed.includes(').click()')) {
      const role = trimmed.match(/getByRole\(['"`]([^'`"]+)['"`]/)?.[1];
      const name = trimmed.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
      if (role && name) {
        return { 
          action: 'click', 
          raw: l, 
          selector: `role=${role}[name="${name}"]`,
          methodName: `click${role.charAt(0).toUpperCase() + role.slice(1)}${toCamelCase(name)}`
        };
      }
    }
    
    // Handle other actions
    return { action: 'other', raw: l };
  });
}

/**
 * Generates a Page Object Model class with methods for page interactions
 * @param {Array} steps - Array of parsed test steps
 * @returns {string} Generated page object class code
 */
function generatePageObject(steps) {
  const methods = [];
  const methodSet = new Set();
  
  for (const step of steps) {
    if (step.action === 'goto') {
      methods.push(`
  /**
   * Navigates to the page URL
   * @returns {Promise<void>}
   */
  async goto(): Promise<void> {
    logger.step('Navigate to page');
    ${step.raw.trim().replace('page.', 'this.page.')}
  }`);
    }
    else if (step.action === 'click') {
      const methodName = step.methodName || 'click' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase());
      const selectorDescription = step.selector.startsWith('role=') 
        ? step.selector.replace('role=', '') + ' role' 
        : `element with selector: ${step.selector}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        methods.push(`
  /**
   * Clicks on ${selectorDescription}
   * @returns {Promise<void>}
   */
  async ${methodName}(): Promise<void> {
    logger.elementInteraction('click', '${step.selector}');
    await this.page.locator('${step.selector}').click();
  }`);
      }
    }
    else if (step.action === 'fill') {
      const methodName = 'enter' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase());
      const fieldName = toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase())
        .replace(/([A-Z])/g, ' $1').trim();
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        methods.push(`
  /**
   * Fills the ${fieldName} field with the provided value
   * @param {string} value - The value to enter in the field
   * @returns {Promise<void>}
   */
  async ${methodName}(value: string): Promise<void> {
    logger.elementInteraction('fill', '${step.selector}', value);
    await this.page.locator('${step.selector}').fill(value);
  }`);
      }
    }
    else if (step.action === 'press') {
      const methodName = 'press' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase()) + 
                        step.key.charAt(0).toUpperCase() + step.key.slice(1);
      const keyName = step.key.replace(/['"]/g, '').toUpperCase();
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        methods.push(`
  /**
   * Presses the ${keyName} key on ${step.selector}
   * @returns {Promise<void>}
   */
  async ${methodName}(): Promise<void> {
    logger.elementInteraction('press', '${step.selector}', '${step.key}');
    await this.page.locator('${step.selector}').press('${step.key}');
  }`);
      }
    }
  }

  return `import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';

export class ${pageName} {
  constructor(private page: Page) {}
  ${methods.join('\n')}
}`;
}

/**
 * Generates test code with the specified test steps
 * @param {Array} steps - Array of parsed test steps
 * @returns {string} Generated test code
 */
/**
 * Generates test code with the specified test steps
 * @param {Array} steps - Array of parsed test steps
 * @param {string} testName - Base name for the test and screenshots
 * @returns {string} Generated test code
 */
/**
 * Generates test code with the specified test steps
 * @param {Array} steps - Array of parsed test steps
 * @param {string} testName - Base name for test files and screenshots
 * @param {string} pageClassName - Name of the page class to use
 * @returns {string} Generated test code
 */
function generateTest(steps, testName = 'test', pageClassName = 'GeneratedPage') {
  const actions = [];
  const methodCalls = new Set();
  
  // Add test description based on actions
  const testDescription = [];
  
  for (const step of steps) {
    if (step.action === 'goto') {
      const url = step.raw.match(/page\.goto\(['"]([^'"]+)['"]\)/)?.[1] || 'the page';
      testDescription.push(`navigate to ${url}`);
      actions.push(`// Navigate to the page
      await ${pageName.toLowerCase()}.goto();`);
    }
    else if (step.action === 'click') {
      const methodName = step.methodName || 'click' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase());
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}();`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const elementDesc = step.selector.startsWith('role=') 
          ? step.selector.replace('role=', '') + ' button'
          : `element with selector: ${step.selector}`;
        actions.push(`// Click on ${elementDesc}
      ${methodCall}`);
        testDescription.push(`click on ${elementDesc}`);
      }
    }
    else if (step.action === 'fill') {
      const methodName = 'enter' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase());
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}('test-value');`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const fieldName = toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase())
          .replace(/([A-Z])/g, ' $1').trim();
        actions.push(`// Fill in the ${fieldName} field
      ${methodCall}`);
        testDescription.push(`fill ${fieldName} field`);
      }
    }
    else if (step.action === 'press') {
      const methodName = 'press' + toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase()) + 
                        step.key.charAt(0).toUpperCase() + step.key.slice(1);
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}();`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const keyName = step.key.replace(/['"]/g, '').toUpperCase();
        actions.push(`// Press ${keyName} key
      ${methodCall}`);
        testDescription.push(`press ${keyName} key`);
      }
    }
  }

  const testDescriptionText = testDescription.length > 0 
    ? `Test to ${testDescription.join(', ')}`
    : 'Generated test';

  return `import { test, expect } from '@playwright/test';
import { ${pageClassName} } from '@pages/${pageClassName}';
import { logger } from '@utils/core/logger';

/**
 * ${testDescriptionText}
 * @test ${testPrefix} test
 * @tags ${tags}
 */
test('${testName} ${tags}', async ({ page }, testInfo) => {
  // Initialize page object
  const ${pageClassName.toLowerCase()} = new ${pageClassName}(page);
  
  // Start test logging
  logger.testStart('${testName} test', ['${tags}']);
  
  try {
    // Setup test environment
    const video = page.video();
    if (video) {
      const videoPath = testInfo.outputPath('${testName}-recording.webm');
      await video.saveAs(videoPath);
      await video.delete();
    }
    await page.screenshot({ path: testInfo.outputPath('${testName}-initial.png') });

    // Execute test steps
    ${actions.join('\n    ')}
    
    // Take final screenshot on success
    await page.screenshot({ path: testInfo.outputPath('${testName}-success.png') });
    
    // Mark test as passed
    logger.testEnd('${testName} test', 'passed', Date.now());
  } catch (error) {
    // Capture screenshot on failure
    await page.screenshot({ path: testInfo.outputPath('${testName}-failed.png') });
    
    // Log test failure
    logger.testEnd('${testName} test', 'failed', Date.now());
    throw error;
  }
});`;
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const steps = parseSteps(raw);
  
  // Use provided pageName or generate from filename
  const baseName = args.pageName || path.basename(filePath, path.extname(filePath));
  const safeBaseName = baseName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  // Use provided testPrefix or use the safeBaseName
  const testPrefix = args.testPrefix || safeBaseName;
  
  // Use the exact pageName for the class name and file
  const pageClassName = args.pageName || baseName;
  
  // Generate page object code with correct class name
  let pageCode = generatePageObject(steps);
  pageCode = pageCode.replace(/class \w+/, `class ${pageClassName}`);
  
  // Generate test code with correct page class name and import
  const testCode = generateTest(steps, testPrefix, pageClassName);
  
  // Set up file paths
  const pageFile = path.join(PAGE_DIR, `${pageClassName}.ts`);
  const testFile = path.join(TEST_DIR, `${testPrefix}.spec.ts`);

  fs.writeFileSync(pageFile, pageCode);
  fs.writeFileSync(testFile, testCode);

  console.log(`✅ Generated ${pageFile} and ${testFile}`);
}

console.log('👀 Watching /codegen-raw for new files...');
chokidar.watch(RAW_DIR).on('add', processFile);
