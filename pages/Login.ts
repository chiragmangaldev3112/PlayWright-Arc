import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';
import { waitAndClick, waitAndFill } from '@utils/core/element-actions';

export class Login {
  constructor(private page: Page) {}
  
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
            
            logger.debug(`Navigating to: ${targetUrl}`);
            
            try {
              await this.page.goto(targetUrl, {
                timeout,
                waitUntil
              });
              
              // Wait for the page to be fully loaded
              await this.page.waitForLoadState('networkidle', { timeout });
              
              logger.info(`✅ Successfully navigated to: ${targetUrl}`);
            } catch (error: unknown) {
              logger.error(`❌ Failed to navigate to: ${targetUrl}`);
              if (error instanceof Error) {
                logger.error(error.message);
              } else {
                logger.error('An unknown error occurred during navigation');
              }
              throw error;
            }
          }

  /**
   * Clicks on element with selector: role=textbox[name="Email Address"]
   * @returns {Promise<void>}
   */
  async clickTextboxEmailAddress(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Email Address"]');
  }

  /**
   * Fills the Role textbox Name Email Address field with the provided value
   * @param {string} [value='baljeetadmin@gmail.com'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxEmailAddress(value: string = 'baljeetadmin@gmail.com'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Email Address"]', value);
  }

  /**
   * Presses Tab key on Role textbox Name Email Address element
   * @param {string} [key='Tab'] - The key to press
   * @returns {Promise<void>}
   */
  async pressTextboxEmailAddressTab(key: string = 'Tab'): Promise<void> {
    await this.page.locator('role=textbox[name="Email Address"]').press(key);
  }

  /**
   * Fills the Role textbox Name Password field with the provided value
   * @param {string} [value='Test@12345'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxPassword(value: string = 'Test@12345'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Password"]', value);
  }

  /**
   * Clicks on element with selector: role=button[name="Sign in"]
   * @returns {Promise<void>}
   */
  async clickButtonSignIn(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Sign in"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Image"]
   * @returns {Promise<void>}
   */
  async clickButtonImage(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Image"] >> nth=0');
  }

  /**
   * Clicks on element with selector: a >> text=User Management
   * @returns {Promise<void>}
   */
  async clickATextUserManagement(): Promise<void> {
    await waitAndClick(this.page, 'a >> text=User Management');
  }

  /**
   * Clicks on element with selector: role=button[name="Manage User"]
   * @returns {Promise<void>}
   */
  async clickButtonManageUser(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Manage User"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Add User"]
   * @returns {Promise<void>}
   */
  async clickButtonAddUser(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Add User"]');
  }

  /**
   * Selects option from role=combobox dropdown
   * @param {string} [value='External'] - The option value to select
   * @returns {Promise<void>}
   */
  async selectCombobox(value: string = 'External'): Promise<void> {
    await this.page.locator('role=combobox').selectOption(value);
  }

  /**
   * Clicks on element with selector: role=textbox[name="First Name"]
   * @returns {Promise<void>}
   */
  async clickTextboxFirstName(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="First Name"]');
  }

  /**
   * Fills the Role textbox Name First Name field with the provided value
   * @param {string} [value='test'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxFirstName(value: string = 'test'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="First Name"]', value);
  }

  /**
   * Presses Tab key on Role textbox Name First Name element
   * @param {string} [key='Tab'] - The key to press
   * @returns {Promise<void>}
   */
  async pressTextboxFirstNameTab(key: string = 'Tab'): Promise<void> {
    await this.page.locator('role=textbox[name="First Name"]').press(key);
  }

  /**
   * Fills the Role textbox Name Last Name field with the provided value
   * @param {string} [value='test'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxLastName(value: string = 'test'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Last Name"]', value);
  }

  /**
   * Presses Tab key on Role textbox Name Last Name element
   * @param {string} [key='Tab'] - The key to press
   * @returns {Promise<void>}
   */
  async pressTextboxLastNameTab(key: string = 'Tab'): Promise<void> {
    await this.page.locator('role=textbox[name="Last Name"]').press(key);
  }

  /**
   * Clicks on element with selector: role=textbox[name="Password"]
   * @returns {Promise<void>}
   */
  async clickTextboxPassword(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Password"]');
  }

  /**
   * Selects option from role=combobox dropdown
   * @param {string} [value='+91'] - The option value to select
   * @returns {Promise<void>}
   */
  async selectComboboxNth(value: string = '+91'): Promise<void> {
    await this.page.locator('role=combobox >> nth=1').selectOption(value);
  }

  /**
   * Clicks on element with selector: role=textbox[name="Phone"]
   * @returns {Promise<void>}
   */
  async clickTextboxPhone(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Phone"]');
  }

  /**
   * Fills the Role textbox Name Phone field with the provided value
   * @param {string} [value='1234567890'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxPhone(value: string = '1234567890'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Phone"]', value);
  }

  /**
   * Clicks on element with selector: role=button[name="Next"]
   * @returns {Promise<void>}
   */
  async clickButtonNext(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Next"]');
  }

  /**
   * Checks role=checkbox checkbox/radio
   * @returns {Promise<void>}
   */
  async checkCheckboxFirst(): Promise<void> {
    await this.page.locator('role=checkbox >> nth=0').check();
  }

  /**
   * Clicks on element with selector: text=Select Hospital
   * @returns {Promise<void>}
   */
  async clickTextSelectHospital(): Promise<void> {
    await waitAndClick(this.page, 'text=Select Hospital');
  }

  /**
   * Clicks on element with selector: role=list
   * @returns {Promise<void>}
   */
  async clickListButton(): Promise<void> {
    await waitAndClick(this.page, 'role=list');
  }

  /**
   * Selects option from role=combobox dropdown
   * @param {string} [value='7'] - The option value to select
   * @returns {Promise<void>}
   */
  async selectComboboxFirst(value: string = '7'): Promise<void> {
    await this.page.locator('role=combobox >> nth=0').selectOption(value);
  }

  /**
   * Checks Role row Name C1005 - Nightstar, Inc. [ checkbox/radio
   * @returns {Promise<void>}
   */
  async checkRowCNightstarInc(): Promise<void> {
    await this.page.locator('role=row[name="C1005 - Nightstar, Inc. ["]').check();
  }

  /**
   * Clicks on element with selector: role=button[name="Add"]
   * @returns {Promise<void>}
   */
  async clickButtonAdd(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Add"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Ok"]
   * @returns {Promise<void>}
   */
  async clickButtonOk(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Ok"]');
  }
}