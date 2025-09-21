import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';
import { waitAndClick, waitAndFill } from '@utils/core/element-actions';

export class CreateUser {
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
   * @param {string} [value='Baljeetadmin@gmail.com'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxEmailAddress(value: string = 'Baljeetadmin@gmail.com'): Promise<void> {
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
   * Clicks on element with selector: role=button[name="Accept"]
   * @returns {Promise<void>}
   */
  async clickButtonAccept(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Accept"]');
  }

  /**
   * Clicks on element with selector: role=heading[name="Welcome, Brayan Smitth!"]
   * @returns {Promise<void>}
   */
  async clickHeadingWelcomeBrayanSmitth(): Promise<void> {
    await waitAndClick(this.page, 'role=heading[name="Welcome, Brayan Smitth!"]');
  }

  /**
   * Clicks on element with selector: text=Select an application to
   * @returns {Promise<void>}
   */
  async clickTextSelectAnApplicationTo(): Promise<void> {
    await waitAndClick(this.page, 'text=Select an application to');
  }

  /**
   * Clicks on element with selector: role=button[name="Image"]
   * @returns {Promise<void>}
   */
  async clickButtonImage(): Promise<void> {
    try {
      await this.page.waitForTimeout(3000);
      // Wait until DOM is loaded
      await this.page.waitForLoadState('domcontentloaded');
  
      // Log current URL for debugging
      const currentUrl = this.page.url();
      logger.info(`Current URL after sign-in: ${currentUrl}`);
  
      // Wait for main container to appear
      await this.page.waitForSelector(
        'div.d-flex.justify-content-center.align-items-center',
        { state: 'visible', timeout: 60000 }
      );
  
      // Debug: log all images found inside buttons
      const allImages = await this.page.$$eval('button.btn.border-0 img', imgs =>
        imgs.map(img => ({
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
        }))
      );
      logger.info(`Found images inside buttons: ${JSON.stringify(allImages, null, 2)}`);
  
      // Candidate selectors (ordered by preference)
      const selectors = [
        'button.btn.border-0:has(img[src*="VITA.png"])',     // Prefer VITA logo
        'button.btn.border-0:has(span img[alt="Image"])',   // Match wrapped images
        'button.btn.border-0:has(img)',                     // Any button with an image
      ];
  
      // Try each selector in order
      for (const selector of selectors) {
        try {
          const button = await this.page.waitForSelector(selector, {
            state: 'visible',
            timeout: 15000,
          });
  
          await button.click();
          logger.info(`✅ Successfully clicked image with selector: ${selector}`);
  
          // Wait for navigation/network idle
          await this.page.waitForLoadState('networkidle');
          return;
        } catch (err) {
          logger.warn(`⚠️ Selector ${selector} failed: ${err}`);
        }
      }
  
      // If nothing worked, throw error
      throw new Error('❌ Could not find any image button to click');
    } catch (error) {
      // Capture debug info
      let pageContent: string;
      try {
        pageContent = await this.page.content();
      } catch {
        pageContent = 'Failed to get page content';
      }
  
      let screenshot: Buffer | null = null;
      try {
        screenshot = await this.page.screenshot({ type: 'png' });
      } catch {
        screenshot = null;
      }
  
      logger.error('Error in clickButtonImage:', {
        error: error instanceof Error ? error.message : error,
        url: this.page.url(),
        pageContent: pageContent.substring(0, 1000), // first 1000 chars only
        screenshot: screenshot ? 'Screenshot captured' : 'Failed to capture screenshot',
      });
  
      throw error;
    }
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
    await this.page.waitForTimeout(3000);
    await waitAndClick(this.page, 'role=button[name="Manage User"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Add User"]
   * @returns {Promise<void>}
   */
  async clickButtonAddUser(): Promise<void> {
    await this.page.waitForTimeout(3000);
    
    // Wait for any overlays or grids to stabilize
    const addUserButton = this.page.locator('role=button[name="Add User"]');
    await addUserButton.waitFor({ state: 'visible' });
    
    // Scroll to ensure button is in viewport and not overlapped
    await addUserButton.scrollIntoViewIfNeeded();
    
    // Use force click to bypass overlay interference
    await addUserButton.click({ force: true });
    
    // Wait for any resulting page changes
    await this.page.waitForTimeout(10000);
  }

  /**
   * Selects option from role=combobox dropdown
   * @param {string} [value='External'] - The option value to select
   * @returns {Promise<void>}
   */
  async selectCombobox(value: string = 'External'): Promise<void> {
    await this.page.waitForTimeout(6000);
    await this.page.locator('role=combobox').selectOption(value);
    await this.page.waitForTimeout(6000);
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
   * Clicks on element with selector: role=textbox[name="Last Name"]
   * @returns {Promise<void>}
   */
  async clickTextboxLastName(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Last Name"]');
  }

  /**
   * Fills the Role textbox Name Last Name field with the provided value
   * @param {string} [value='user'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxLastName(value: string = 'user'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Last Name"]', value);
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
   * Clicks on element with selector: text=Select Hospital
   * @returns {Promise<void>}
   */
  async clickTextSelectGroup(): Promise<void> {
    await waitAndClick(this.page, 'text=Select Group');
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
   * @param {string} [value='8699876867'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxPhone(value: string = '8699876867'): Promise<void> {
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
   * Clicks on element with selector: role=heading[name="Add User"]
   * @returns {Promise<void>}
   */
  async clickHeadingAddUser(): Promise<void> {
    await waitAndClick(this.page, 'role=heading[name="Add User"]');
  }

  /**
   * Clicks on element with selector: text=Application Access
   * @returns {Promise<void>}
   */
  async clickTextApplicationAccess(): Promise<void> {
    await waitAndClick(this.page, 'text=Application Access');
  }

  /**
   * Checks role=checkbox checkbox/radio
   * @returns {Promise<void>}
   */
  async checkCheckboxFirst(): Promise<void> {
    await this.page.locator('role=checkbox >> nth=0').check();
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
   * Clicks on element with selector: text=Select Hospital
   * @returns {Promise<void>}
   */
  async clickTextSelectHospital(): Promise<void> {
    await waitAndClick(this.page, 'text=Select Hospital');
  }
  /**
   * Clicks on element with selector: role=list >> text=C1002 - Test Company [
   * @returns {Promise<void>}
   */
  async clickListTextCTestCompany(): Promise<void> {
    await waitAndClick(this.page, 'role=list >> text=C1002 - Test Company [');
  }

  /**
   * Clicks on element with selector: app-create-users
   * @returns {Promise<void>}
   */
  async clickappCreateUsers(): Promise<void> {
    await waitAndClick(this.page, 'app-create-users');
  }

  /**
   * Checks #radio checkbox/radio
   * @returns {Promise<void>}
   */
  async checkradio(): Promise<void> {
    await this.page.locator('#radio').check();
  }

  /**
   * Checks role=checkbox checkbox/radio
   * @returns {Promise<void>}
   */
  async checkCheckboxNth(): Promise<void> {
    await this.page.locator('role=checkbox').nth(1).check();
  }

  /**
   * Clicks on element with selector: text=C1011 ECU Health
   * @returns {Promise<void>}
   */
  async clickTextCEcuHealth(): Promise<void> {
    await waitAndClick(this.page, 'text=C1011 ECU Health');
  }

  /**
   * Clicks on element with selector: app-create-users div >> text=Application Access Vita Role
   * @returns {Promise<void>}
   */
  async clickAppCreateUsersDivTextApplicationAccessVitaRole(): Promise<void> {
    await waitAndClick(this.page, 'app-create-users div >> text=Application Access Vita Role');
  }

  /**
   * Clicks on element with selector: role=button[name="Add"]
   * @returns {Promise<void>}
   */
  async clickButtonAdd(): Promise<void> {
    this.page.waitForTimeout(6000);
    await waitAndClick(this.page, 'role=button[name="Add"]');
    this.page.waitForTimeout(6000);
  }

  /**
   * Clicks on element with selector: role=button[name="Ok"]
   * @returns {Promise<void>}
   */
  async clickButtonOk(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Ok"]');
  }
}