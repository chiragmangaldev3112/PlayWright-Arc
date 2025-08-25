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
  if (!selector || typeof selector !== 'string') {
    return '';
  }
  
  // Remove all special characters and numbers, keep only letters
  const sanitized = selector
    .replace(/[!@#$%^&*()_+\-=\[\]{}\\||,.<>.;:'"/?`~0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!sanitized) return '';
  
  return sanitized
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

function toProperCamelCase(text) {
  // Convert text to proper camelCase with first letter uppercase for method names
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove all special characters and numbers, keep only letters and spaces
  const sanitized = text
    .replace(/[!@#$%^&*()_+\-=\[\]{}\\||,.<>.;:'"/?`~0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!sanitized) return '';
  
  return sanitized
    .split(/[\s\-_]+/)
    .map((word, index) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

function parseSteps(content) {
  const lines = content.split('\n').filter(l => l.trim() && l.includes('page.'));
  return lines.map(l => {
    const trimmed = l.trim();
    
    // Handle page.goto()
    if (trimmed.includes('page.goto')) {
      const url = l.match(/page\.goto\(['"]([^'"]+)['"]/)?.[1] || '';
      return { 
        action: 'goto', 
        raw: l, 
        selector: null,
        url: url
      };
    }
    
    // Handle page.locator().click()
    if (trimmed.includes('.locator(') && trimmed.includes(').click()')) {
      // Handle locator().filter() pattern
      if (trimmed.includes('.filter(')) {
        const filterText = trimmed.match(/\.filter\(\{ hasText: ['"`](.*?)['"`] \}\)/)?.[1];
        const baseSelector = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
        
        // Generate proper camelCase method name
        const methodName = 'click' + 
          toProperCamelCase(baseSelector) + 
          'Text' + 
          toProperCamelCase(filterText);
        
        return { 
          action: 'click', 
          raw: l, 
          selector: `${baseSelector} >> text=${filterText}`,
          isFiltered: true,
          methodName: methodName
        };
      }
      
      // Regular locator
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      const methodName = 'click' + toCamelCase(sel);
      return { action: 'click', raw: l, selector: sel, methodName: methodName };
    }
    
    // Handle page.getByRole().click() with modifiers
    if (trimmed.includes('.getByRole(') && trimmed.includes(').click()')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        
        // Handle modifiers like .first() or .nth()
        const modifierMatch = trimmed.match(/\.(first|nth)\(([^)]*)\)/);
        const modifier = modifierMatch ? modifierMatch[1] : '';
        const modifierValue = modifierMatch && modifierMatch[2] ? modifierMatch[2] : '';
        
        // Format: click + Role + Name (e.g., clickButtonLogin)
        let methodName = 'click';
        if (role) {
          methodName += role.charAt(0).toUpperCase() + role.slice(1);
        }
        if (name) {
          const sanitizedName = toProperCamelCase(name);
          methodName += sanitizedName;
        } else if (modifier) {
          const sanitizedModifier = toProperCamelCase(modifier);
          methodName += sanitizedModifier;
          if (modifierValue) {
            const sanitizedValue = modifierValue.replace(/[^a-zA-Z]/g, '');
            methodName += sanitizedValue;
          }
        } else {
          methodName += 'Button';
        }
        
        return { 
          action: 'click', 
          raw: l, 
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          modifier: modifier,
          modifierValue: modifierValue,
          methodName: methodName
        };
      }
    }
    
    // Handle page.getByRole().selectOption()
    if (trimmed.includes('.getByRole(') && trimmed.includes(').selectOption(')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        const valueMatch = trimmed.match(/\.selectOption\(['"]([^'"]+)['"]\)/);
        const value = valueMatch ? valueMatch[1] : '';
        
        // Handle modifiers like .first() or .nth()
        const modifierMatch = trimmed.match(/\.(first|nth)\(([^)]*)\)/);
        const modifier = modifierMatch ? modifierMatch[1] : '';
        const modifierValue = modifierMatch && modifierMatch[2] ? modifierMatch[2] : '';
        
        let methodName = 'select';
        if (role) {
          methodName += role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
        if (name) {
          const sanitizedName = toProperCamelCase(name);
          methodName += sanitizedName;
        } else if (modifier) {
          const sanitizedModifier = toProperCamelCase(modifier);
          methodName += sanitizedModifier;
          if (modifierValue) {
            const sanitizedValue = modifierValue.replace(/[^a-zA-Z]/g, '');
            methodName += sanitizedValue;
          }
        }
        
        methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
        
        return { 
          action: 'select', 
          raw: l, 
          role: role,
          name: name,
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          value: value,
          modifier: modifier,
          modifierValue: modifierValue,
          methodName: methodName
        };
      }
    }

    // Handle page.getByRole().press()
    if (trimmed.includes('.getByRole(') && trimmed.includes(').press(')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        const keyMatch = trimmed.match(/\.press\(['"]([^'"]+)['"]\)/);
        const key = keyMatch ? keyMatch[1] : '';
        
        let methodName = 'press';
        if (role) {
          methodName += role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
        if (name) {
          const sanitizedName = toProperCamelCase(name);
          methodName += sanitizedName;
        }
        if (key) {
          const sanitizedKey = toProperCamelCase(key);
          methodName += sanitizedKey;
        }
        
        methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
        
        return { 
          action: 'press', 
          raw: l, 
          role: role,
          name: name,
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          key: key,
          methodName: methodName
        };
      }
    }

    // Handle page.getByRole().check()
    if (trimmed.includes('.getByRole(') && trimmed.includes(').check(')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        
        // Handle modifiers like .first()
        const modifierMatch = trimmed.match(/\.(first|nth)\(([^)]*)\)/);
        const modifier = modifierMatch ? modifierMatch[1] : '';
        
        let methodName = 'check';
        if (role) {
          methodName += role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
        if (name) {
          const sanitizedName = toProperCamelCase(name);
          methodName += sanitizedName;
        } else if (modifier) {
          const sanitizedModifier = toProperCamelCase(modifier);
          methodName += sanitizedModifier;
        }
        
        methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
        
        return { 
          action: 'check', 
          raw: l, 
          role: role,
          name: name,
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          modifier: modifier,
          methodName: methodName
        };
      }
    }

    // Handle page.getByRole().fill()
    if (trimmed.includes('.getByRole(') && trimmed.includes(').fill(')) {
      const roleMatch = trimmed.match(/\.getByRole\(([^)]+)\)/);
      if (roleMatch) {
        const [_, params] = roleMatch;
        const role = params.split(',')[0].trim().replace(/['"]/g, '');
        const nameMatch = params.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : '';
        const valueMatch = trimmed.match(/\.fill\(['"]([^'"]+)['"]\)/);
        const value = valueMatch ? valueMatch[1] : '';
        
        // Generate method name in format: fill + Role + Name (e.g., fillTextboxEmailAddress)
        let methodName = 'fill';
        if (role) {
          methodName += role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
        if (name) {
          const sanitizedName = toProperCamelCase(name);
          methodName += sanitizedName;
        }
        
        // Ensure method name starts with lowercase
        methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
        
        return { 
          action: 'fill', 
          raw: l, 
          role: role,
          name: name,
          selector: `role=${role}${name ? `[name="${name}"]` : ''}`,
          value: value,
          methodName: methodName
        };
      }
    }
    // Handle page.locator().fill()
    else if (trimmed.includes('.locator(') && trimmed.includes(').fill(')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      const valueMatch = trimmed.match(/\.fill\(['"]([^'"]+)['"]\)/);
      const value = valueMatch ? valueMatch[1] : '';
      return { action: 'fill', raw: l, selector: sel, value: value };
    }
    
    // Handle page.locator().press()
    if (trimmed.includes('.locator(') && trimmed.includes(').press(')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      const key = trimmed.match(/\.press\(['"`](.*?)['"`]\)/)?.[1];
      return { action: 'press', raw: l, selector: sel, key };
    }

    // Handle page.locator().check()
    if (trimmed.includes('.locator(') && trimmed.includes(').check()')) {
      const sel = trimmed.match(/\.locator\(['"`](.*?)['"`]\)/)?.[1];
      return { action: 'check', raw: l, selector: sel };
    }

    // Handle page.getByText().click()
    if (trimmed.includes('.getByText(') && trimmed.includes(').click()')) {
      const textMatch = trimmed.match(/\.getByText\(['"`]([^'`"]+)['"`]\)/);
      if (textMatch) {
        const text = textMatch[1];
        const sanitizedText = toProperCamelCase(text);
        const methodName = 'clickText' + sanitizedText;
        return { 
          action: 'click', 
          raw: l, 
          selector: `text=${text}`,
          methodName: methodName
        };
      }
    }

    // Handle chained selectors like getByRole().getByText()
    if (trimmed.includes('.getByRole(') && trimmed.includes('.getByText(') && trimmed.includes(').click()')) {
      const roleMatch = trimmed.match(/\.getByRole\(['"`]([^'`"]+)['"`]\)/);
      const textMatch = trimmed.match(/\.getByText\(['"`]([^'`"]+)['"`]\)/);
      if (roleMatch && textMatch) {
        const role = roleMatch[1];
        const text = textMatch[1];
        const sanitizedRole = toProperCamelCase(role);
        const sanitizedText = toProperCamelCase(text);
        const methodName = `click${sanitizedRole}Text${sanitizedText}`;
        return { 
          action: 'click', 
          raw: l, 
          selector: `role=${role} >> text=${text}`,
          methodName: methodName
        };
      }
    }

    // Handle complex chained selectors with locator
    if (trimmed.includes('.getByRole(') && trimmed.includes('.locator(') && trimmed.includes(').check()')) {
      const roleMatch = trimmed.match(/\.getByRole\([^)]+name:\s*['"]([^'"]+)['"]/);
      const locatorMatch = trimmed.match(/\.locator\(['"`]([^'`"]+)['"`]\)/);
      if (roleMatch && locatorMatch) {
        const name = roleMatch[1];
        const selector = locatorMatch[1];
        const sanitizedName = toProperCamelCase(name);
        const sanitizedSelector = toProperCamelCase(selector);
        const methodName = `checkRow${sanitizedName}${sanitizedSelector}`;
        return { 
          action: 'check', 
          raw: l, 
          selector: `role=row[name="${name}"] >> ${selector}`,
          methodName: methodName
        };
      }
    }
    
    // Handle other actions
    return { action: 'other', raw: l };
  });
}

function generateGotoMethodName(url) {
    try {
      const u = new URL(url);
      const pathSegments = u.pathname
        .split('/')
        .filter(Boolean)
        .map(seg => seg.replace(/[^a-zA-Z0-9]/g, '')); // remove non-alphanum
      const lastSegment = pathSegments.length ? pathSegments.join('-') : u.hostname.split('.')[0];
      const camelCase = lastSegment
        .split(/[-_]/)
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
      return 'goto' + camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    } catch (err) {
      return 'gotoPage';
    }
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
        const url = step.url || '';
        const methodName = 'goto';
        
        // Only add the goto method once
        if (!methodSet.has(methodName)) {
          methodSet.add(methodName);
          
          // Parse URL to separate base URL and query params
          let baseUrl = url;
          let queryParams = [];
          
          try {
            if (url) {
              const urlObj = new URL(url);
              baseUrl = urlObj.origin + urlObj.pathname;
              if (urlObj.search) {
                queryParams = Array.from(urlObj.searchParams.entries())
                  .map(([key, value]) => `${key}=${value}`);
              }
            }
          } catch (e) {
            // If URL parsing fails, use the original URL as is
            console.warn('Failed to parse URL:', url);
          }
          
          methods.push(`
          /**
           * Navigate to the specified URL
           * @param {string | { url: string }} url - The URL to navigate to, or an object containing the URL
           * @param {Object} [options] - Navigation options
           * @param {number} [options.timeout=600000] - Maximum navigation time in milliseconds
           * @param {'load'|'domcontentloaded'|'networkidle'|'commit'} [options.waitUntil='load'] - When to consider navigation succeeded
           */
          async goto(
            url: string | { url: string },
            options: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' } = {}
          ) {
            logger.step('Navigate to page');
            
            // Handle both direct URL string and object with url property
            const targetUrl = typeof url === 'string' ? url : url?.url;
            
            if (!targetUrl) {
              throw new Error('URL is required for navigation');
            }
            
            const {
              timeout = 600000,
              waitUntil = 'load' // can be 'load', 'domcontentloaded', 'networkidle', or 'commit'
            } = options;
            
            logger.debug(\`Navigating to: \${targetUrl}\`);
            
            try {
              await this.page.goto(targetUrl, {
                timeout,
                waitUntil
              });
              
              // Wait for the page to be fully loaded
              await this.page.waitForLoadState('networkidle', { timeout });
              
              logger.info(\`✅ Successfully navigated to: \${targetUrl}\`);
            } catch (error: unknown) {
              logger.error(\`❌ Failed to navigate to: \${targetUrl}\`);
              if (error instanceof Error) {
                logger.error(error.message);
              } else {
                logger.error('An unknown error occurred during navigation');
              }
              throw error;
            }
          }`);
        }
      }
   
    else if (step.action === 'click') {
      const methodName = step.methodName || `click${toCamelCase(step.selector || 'Element')}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        
        let selectorToUse = step.selector;
        if (step.modifier) {
          if (step.modifier === 'first') {
            selectorToUse = `${step.selector} >> nth=0`;
          } else if (step.modifier === 'nth' && step.modifierValue) {
            selectorToUse = `${step.selector} >> nth=${step.modifierValue}`;
          }
        }
        
        methods.push(`
  /**
   * Clicks on ${step.selector ? `element with selector: ${step.selector}` : 'element'}
   * @returns {Promise<void>}
   */
  async ${methodName}(): Promise<void> {
    await waitAndClick(this.page, '${selectorToUse}');
  }`);
      }
    }
    else if (step.action === 'fill') {
      const methodName = step.methodName || `fill${toCamelCase(step.selector || 'Element')}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        
        const defaultValue = step.value || 'string';
        methods.push(`
  /**
   * Fills the ${step.name ? `Role ${step.role} Name ${step.name}` : step.selector} field with the provided value
   * @param {string} [value='${defaultValue}'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async ${methodName}(value: string = '${defaultValue}'): Promise<void> {
    await waitAndFill(this.page, '${step.selector}', value);
  }`);
      }
    }
    else if (step.action === 'select') {
      const methodName = step.methodName || `select${toCamelCase(step.selector || 'Element')}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        
        const defaultValue = step.value || 'option';
        let selectorToUse = step.selector;
        if (step.modifier) {
          if (step.modifier === 'first') {
            selectorToUse = `${step.selector} >> nth=0`;
          } else if (step.modifier === 'nth' && step.modifierValue) {
            selectorToUse = `${step.selector} >> nth=${step.modifierValue}`;
          }
        }
        
        methods.push(`
  /**
   * Selects option from ${step.name ? `Role ${step.role} Name ${step.name}` : step.selector} dropdown
   * @param {string} [value='${defaultValue}'] - The option value to select
   * @returns {Promise<void>}
   */
  async ${methodName}(value: string = '${defaultValue}'): Promise<void> {
    await this.page.locator('${selectorToUse}').selectOption(value);
  }`);
      }
    }

    // Handle press actions
    else if (step.action === 'press') {
      const methodName = step.methodName || `press${toCamelCase(step.key || 'Key')}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        
        const defaultKey = step.key || 'Tab';
        methods.push(`
  /**
   * Presses ${step.key} key on ${step.name ? `Role ${step.role} Name ${step.name}` : step.selector} element
   * @param {string} [key='${defaultKey}'] - The key to press
   * @returns {Promise<void>}
   */
  async ${methodName}(key: string = '${defaultKey}'): Promise<void> {
    await this.page.locator('${step.selector}').press(key);
  }`);
      }
    }

    // Handle check actions
    else if (step.action === 'check') {
      const methodName = step.methodName || `check${toCamelCase(step.selector || 'Element')}`;
      
      if (!methodSet.has(methodName)) {
        methodSet.add(methodName);
        
        let selectorToUse = step.selector;
        if (step.modifier) {
          if (step.modifier === 'first') {
            selectorToUse = `${step.selector} >> nth=0`;
          }
        }
        
        methods.push(`
  /**
   * Checks ${step.name ? `Role ${step.role} Name ${step.name}` : step.selector} checkbox/radio
   * @returns {Promise<void>}
   */
  async ${methodName}(): Promise<void> {
    await this.page.locator('${selectorToUse}').check();
  }`);
      }
    }
  }

  return `import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';
import { waitAndClick, waitAndFill } from '@utils/core/element-actions';

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
      const url = step.url || 'the page';
      testDescription.push(`navigate to ${url}`);
      
      // Pass the URL directly to the goto method
      actions.push(`// Navigate to the page
      await ${pageClassName.toLowerCase()}.goto('${step.url}');`);
    }
    else if (step.action === 'click') {
      const methodName = step.methodName || 'clickElement';
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
      // Use the same method name generation as in page object
      const methodName = step.methodName || 'fillElement';
      const valueToUse = step.value || 'test-value';
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}('${valueToUse}');`;
      // Always add fill actions - don't check for duplicates since fill actions should always execute
      methodCalls.add(methodCall);
      const fieldName = toCamelCase(step.selector).replace(/^[a-z]/, c => c.toUpperCase())
        .replace(/([A-Z])/g, ' $1').trim();
      actions.push(`// Fill in the ${fieldName} field
      ${methodCall}`);
      testDescription.push(`fill ${fieldName} field`);
    }
    else if (step.action === 'press') {
      const methodName = step.methodName || 'pressKey';
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}();`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const keyName = step.key.replace(/['"]/g, '').toUpperCase();
        actions.push(`// Press ${keyName} key
      ${methodCall}`);
        testDescription.push(`press ${keyName} key`);
      }
    }
    else if (step.action === 'select') {
      const methodName = step.methodName || 'selectOption';
      const valueToUse = step.value || 'option';
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}('${valueToUse}');`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const elementDesc = step.selector.startsWith('role=') 
          ? step.selector.replace('role=', '') + ' dropdown'
          : `element with selector: ${step.selector}`;
        actions.push(`// Select option from ${elementDesc}
      ${methodCall}`);
        testDescription.push(`select option from ${elementDesc}`);
      }
    }
    else if (step.action === 'check') {
      const methodName = step.methodName || 'checkElement';
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}();`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        const elementDesc = step.selector.startsWith('role=') 
          ? step.selector.replace('role=', '') + ' checkbox'
          : `element with selector: ${step.selector}`;
        actions.push(`// Check ${elementDesc}
      ${methodCall}`);
        testDescription.push(`check ${elementDesc}`);
      }
    }
    else {
      const methodName = step.methodName || 'performAction';
      const methodCall = `await ${pageName.toLowerCase()}.${methodName}();`;
      if (!methodCalls.has(methodCall)) {
        methodCalls.add(methodCall);
        actions.push(`// Perform action
      ${methodCall}`);
        testDescription.push(`perform action`);
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
    // const video = page.video();
    // if (video) {
    //   const videoPath = testInfo.outputPath('${testName}-recording.webm');
    //   await video.saveAs(videoPath);
    //   await video.delete();
    // }
    // await page.screenshot({ path: testInfo.outputPath('${testName}-initial.png') });

    // Execute test steps
    ${actions.join('\n    ')}
    
    // Take final screenshot on success
    // await page.screenshot({ path: testInfo.outputPath('${testName}-success.png') });
    
    // Mark test as passed
    logger.testEnd('${testName} test', 'passed', Date.now());
  } catch (error) {
    // Capture screenshot on failure
    // await page.screenshot({ path: testInfo.outputPath('${testName}-failed.png') });
    
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
