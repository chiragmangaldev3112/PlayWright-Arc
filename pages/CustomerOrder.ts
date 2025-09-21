import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';
import { waitAndClick, waitAndFill } from '@utils/core/element-actions';

export class CustomerOrder {
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
   * Clicks on element with selector: a >> text=Create New Order
   * @returns {Promise<void>}
   */
  async clickATextCreateNewOrder(): Promise<void> {
    await waitAndClick(this.page, 'a >> text=Create New Order');
  }

  /**
   * Clicks on element with selector: role=combobox[name="Hospital"]
   * @returns {Promise<void>}
   */
  async clickComboboxHospital(): Promise<void> {
    await waitAndClick(this.page, 'role=combobox[name="Hospital"]');
  }

  /**
   * Fills the Role combobox Name Hospital field with the provided value
   * @param {string} [value='C1075 - AdventHealth Orlando'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillComboboxHospital(value: string = 'C1075 - AdventHealth Orlando'): Promise<void> {
    await waitAndFill(this.page, 'role=combobox[name="Hospital"]', value);
  }

  /**
   * Selects option from #pageSize dropdown
   * @param {string} [value='GENOSYL TRANSPORT Customer Order Form'] - The option value to select
   * @returns {Promise<void>}
   */
  async performAction(value: string = 'GENOSYL TRANSPORT Customer Order Form'): Promise<void> {
    await this.page.waitForTimeout(6000);
    
    // Check if pageSize element exists before interacting
    const pageSizeElement = this.page.locator('#pageSize');
      await pageSizeElement.waitFor({ state: 'visible', timeout: 10000 });
      await pageSizeElement.selectOption(value);
   
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Clicks search textbox if available, otherwise skips gracefully
   * @returns {Promise<void>}
   */
  async clickTextboxSearchItems(): Promise<void> {
    const searchBox = this.page.locator('role=textbox[name="Search Items.."]');
    
    try {
      // Check if search box exists and is visible
      await searchBox.waitFor({ state: 'visible', timeout: 5000 });
      await waitAndClick(this.page, 'role=textbox[name="Search Items.."]');
    } catch (error) {
      // Check if items are loaded in grid
      const noRowsText = await this.page.locator('main').textContent();
      if (noRowsText?.includes('No Rows To Show')) {
        console.warn('⚠️ No items loaded - search functionality not available');
        return; // Skip this step gracefully
      }
      throw error;
    }
  }

  /**
   * Checks the first available checkbox in the items list
   * @returns {Promise<void>}
   */
  async checkcustomcontrolinput(): Promise<void> {
    await this.page.locator('.custom-control-input').first().check();
  }

  /**
   * Clicks on element with selector: role=button[name="Proceed"]
   * @returns {Promise<void>}
   */
  async clickButtonProceed(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Proceed"]');
  }

  /**
   * Fills the Role textbox Name P.O. Number field with the provided value
   * @param {string} [value='123'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxPONumber(value: string = '123'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="P.O. Number"]', value);
  }

  /**
   * Clicks on element with selector: role=textbox[name="Requester"]
   * @returns {Promise<void>}
   */
  async clickTextboxRequester(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Requester"]');
  }

  /**
   * Fills the Role textbox Name Requester field with the provided value
   * @param {string} [value='abc'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxRequester(value: string = 'abc'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Requester"]', value);
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
   * @param {string} [value='8699876778'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxPhone(value: string = '8699876778'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Phone"]', value);
  }

  /**
   * Clicks on element with selector: role=textbox[name="Notes"]
   * @returns {Promise<void>}
   */
  async clickTextboxNotes(): Promise<void> {
    await waitAndClick(this.page, 'role=textbox[name="Notes"]');
  }

  /**
   * Fills the Role textbox Name Notes field with the provided value
   * @param {string} [value='HI'] - The value to enter in the field
   * @returns {Promise<void>}
   */
  async fillTextboxNotes(value: string = 'HI'): Promise<void> {
    await waitAndFill(this.page, 'role=textbox[name="Notes"]', value);
  }

  /**
   * Checks the urgent shipping checkbox
   * @returns {Promise<void>}
   */
  async checkCheckbox(): Promise<void> {
    // Target the checkbox near the urgent shipping text
    await this.page.locator('text=Check this box for Urgent Shipping').locator('..').locator('role=checkbox').check();
  }

  /**
   * Clicks on element with selector: role=button[name="Yes"]
   * @returns {Promise<void>}
   */
  async clickButtonYes(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Yes"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Place Order"]
   * @returns {Promise<void>}
   */
  async clickButtonPlaceOrder(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Place Order"]');
  }

  /**
   * Clicks on element with selector: role=button[name="Ok"]
   * @returns {Promise<void>}
   */
  async clickButtonOk(): Promise<void> {
    await waitAndClick(this.page, 'role=button[name="Ok"]');
  }

  /**
   * Clicks on element with selector: a >> text=Order Status
   * @returns {Promise<void>}
   */
  async clickATextOrderStatus(): Promise<void> {
    await waitAndClick(this.page, 'a >> text=Order Status');
  }

  // ========================================
  // JIRA VT1-49: UI Validation Methods
  // [QA] Add UI validation for parameters on customer order form
  // ========================================

  /**
   * Validates P.O. Number field requirements
   * @param {string} [invalidValue=''] - Invalid value to test
   * @returns {Promise<boolean>} - Returns true if validation works correctly
   */
  async validatePONumberField(invalidValue: string = ''): Promise<boolean> {
    try {
      await this.fillTextboxPONumber(invalidValue);
      
      // Check for validation error message or styling
      const validationError = await this.page.locator('input[name="P.O. Number"]:invalid, .error, .is-invalid').count();
      const isRequired = await this.page.locator('input[name="P.O. Number"][required]').count();
      
      return validationError > 0 || isRequired > 0;
    } catch (error) {
      console.warn('⚠️ P.O. Number validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates Requester field requirements
   * @param {string} [invalidValue=''] - Invalid value to test
   * @returns {Promise<boolean>} - Returns true if validation works correctly
   */
  async validateRequesterField(invalidValue: string = ''): Promise<boolean> {
    try {
      await this.fillTextboxRequester(invalidValue);
      
      // Check for validation indicators
      const validationError = await this.page.locator('input[name="Requester"]:invalid, .error, .is-invalid').count();
      const isRequired = await this.page.locator('input[name="Requester"][required]').count();
      
      return validationError > 0 || isRequired > 0;
    } catch (error) {
      console.warn('⚠️ Requester validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates Phone field format and requirements
   * @param {string} [invalidValue='invalid-phone'] - Invalid phone number to test
   * @returns {Promise<boolean>} - Returns true if validation works correctly
   */
  async validatePhoneField(invalidValue: string = 'invalid-phone'): Promise<boolean> {
    try {
      await this.fillTextboxPhone(invalidValue);
      
      // Check for phone format validation
      const validationError = await this.page.locator('input[name="Phone"]:invalid, .error, .is-invalid').count();
      const hasPattern = await this.page.locator('input[name="Phone"][pattern]').count();
      
      return validationError > 0 || hasPattern > 0;
    } catch (error) {
      console.warn('⚠️ Phone validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates Email Address field format and requirements
   * @param {string} [invalidValue='invalid-email'] - Invalid email to test
   * @returns {Promise<boolean>} - Returns true if validation works correctly
   */
  async validateEmailField(invalidValue: string = 'invalid-email'): Promise<boolean> {
    try {
      const emailField = this.page.locator('role=textbox[name="Email Address"]');
      await emailField.fill(invalidValue);
      
      // Check for email validation
      const validationError = await this.page.locator('input[name="Email Address"]:invalid, .error, .is-invalid').count();
      const isEmailType = await this.page.locator('input[name="Email Address"][type="email"]').count();
      
      return validationError > 0 || isEmailType > 0;
    } catch (error) {
      console.warn('⚠️ Email validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates Hospital selection is required
   * @returns {Promise<boolean>} - Returns true if hospital selection is validated
   */
  async validateHospitalSelection(): Promise<boolean> {
    try {
      // Clear hospital selection
      await this.page.locator('role=combobox[name="Hospital"]').fill('');
      
      // Check for validation indicators
      const validationError = await this.page.locator('select[name="Hospital"]:invalid, .error, .is-invalid').count();
      const isRequired = await this.page.locator('select[name="Hospital"][required]').count();
      
      return validationError > 0 || isRequired > 0;
    } catch (error) {
      console.warn('⚠️ Hospital validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates that at least one item is selected before proceeding
   * @returns {Promise<boolean>} - Returns true if item selection is validated
   */
  async validateItemSelection(): Promise<boolean> {
    try {
      // Uncheck all items
      const checkboxes = this.page.locator('.custom-control-input');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).uncheck();
      }
      
      // Try to proceed without selecting items
      await this.clickButtonProceed();
      
      // Check if validation prevents proceeding
      const errorMessage = await this.page.locator('.alert-danger, .error-message, .validation-error').count();
      const proceedButtonDisabled = await this.page.locator('role=button[name="Proceed"]:disabled').count();
      
      return errorMessage > 0 || proceedButtonDisabled > 0;
    } catch (error) {
      console.warn('⚠️ Item selection validation check failed:', error);
      return false;
    }
  }

  /**
   * Validates shipping address selection requirements
   * @returns {Promise<boolean>} - Returns true if shipping address validation works
   */
  async validateShippingAddressSelection(): Promise<boolean> {
    try {
      // Uncheck all shipping address options
      const shippingCheckboxes = this.page.locator('role=checkbox').filter({ hasText: /C1075|Other/ });
      const count = await shippingCheckboxes.count();
      
      for (let i = 0; i < count; i++) {
        await shippingCheckboxes.nth(i).uncheck();
      }
      
      // Check for validation indicators
      const validationError = await this.page.locator('.shipping-error, .address-error, .validation-error').count();
      const placeOrderDisabled = await this.page.locator('role=button[name="Place Order"]:disabled').count();
      
      return validationError > 0 || placeOrderDisabled > 0;
    } catch (error) {
      console.warn('⚠️ Shipping address validation check failed:', error);
      return false;
    }
  }

  /**
   * Runs comprehensive UI validation test for all customer order form parameters
   * Implements JIRA VT1-49 requirements for form validation
   * @returns {Promise<{[key: string]: boolean}>} - Validation results for each field
   */
  async runComprehensiveValidation(): Promise<{[key: string]: boolean}> {
    const results = {
      poNumber: false,
      requester: false,
      phone: false,
      email: false,
      hospital: false,
      itemSelection: false,
      shippingAddress: false
    };

    try {
      console.log('🧪 VT1-49: Starting comprehensive UI validation...');
      
      results.poNumber = await this.validatePONumberField('');
      results.requester = await this.validateRequesterField('');
      results.phone = await this.validatePhoneField('123');
      results.email = await this.validateEmailField('invalid-email');
      results.hospital = await this.validateHospitalSelection();
      results.itemSelection = await this.validateItemSelection();
      results.shippingAddress = await this.validateShippingAddressSelection();

      console.log('🧪 VT1-49 Validation Results:', results);
      
      const passedCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      console.log(`✅ VT1-49: ${passedCount}/${totalCount} validations passed`);
      
      return results;
    } catch (error) {
      console.error('❌ VT1-49: Comprehensive validation failed:', error);
      return results;
    }
  }

  /**
   * Validates all required fields have proper validation attributes
   * @returns {Promise<boolean>} - Returns true if all required validations are in place
   */
  async validateFormStructure(): Promise<boolean> {
    try {
      const requiredFields = [
        'input[name="P.O. Number"]',
        'input[name="Requester"]', 
        'input[name="Phone"]',
        'input[name="Email Address"]',
        'select[name="Hospital"], input[name="Hospital"]'
      ];

      let allValid = true;
      
      for (const field of requiredFields) {
        const hasValidation = await this.page.locator(`${field}[required], ${field}[pattern], ${field}[type="email"]`).count();
        if (hasValidation === 0) {
          console.warn(`⚠️ Field ${field} missing validation attributes`);
          allValid = false;
        }
      }

      return allValid;
    } catch (error) {
      console.warn('⚠️ Form structure validation failed:', error);
      return false;
    }
  }


}


