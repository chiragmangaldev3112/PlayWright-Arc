import { Page, Locator } from '@playwright/test';
import { logger } from '../core/logger';

export async function waitAndClick(
  page: Page,
  selector: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 1000000 } = options;
  
  try {
    logger.debug(`Waiting for element to be visible: ${selector}`);
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    logger.debug(`Clicking on element: ${selector}`);
    await element.click();
    
    logger.info(`✅ Successfully clicked on element: ${selector}`);
  } catch (error) {
    logger.error(`❌ Failed to interact with element: ${selector}`);
    await page.screenshot({ path: 'element-interaction-error.png' });
    throw error;
  }
}

export async function waitAndFill(
  page: Page,
  selector: string,
  text: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 1000000 } = options;
  
  try {
    logger.debug(`Waiting for input to be visible: ${selector}`);
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    logger.debug(`Filling input: ${selector}`);
    await element.fill(text);
    
    logger.info(`✅ Successfully filled input: ${selector}`);
  } catch (error) {
    logger.error(`❌ Failed to fill input: ${selector}`);
    await page.screenshot({ path: 'fill-input-error.png' });
    throw error;
  }
}
