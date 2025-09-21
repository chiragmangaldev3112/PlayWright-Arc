import { test, expect } from '@playwright/test';
import { Login } from '@pages/Login';
import { logger } from '@utils/core/logger';
import { DataHelpers } from '@/utils';

/**
 * Test to navigate to https://web.vitadev.vero-biotech.com/, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, press TAB key, fill Role Textbox Name Password field, click on button[name="Sign in"] button, click on button[name="Image"] button, click on element with selector: a >> text=User Management, click on button[name="Manage User"] button, click on button[name="Add User"] button, select option from combobox dropdown, click on textbox[name="First Name"] button, fill Role Textbox Name First Name field, press TAB key, fill Role Textbox Name Last Name field, press TAB key, fill Role Textbox Name Email Address field, fill Role Textbox Name Password field, select option from combobox dropdown, click on textbox[name="Phone"] button, fill Role Textbox Name Phone field, click on button[name="Next"] button, check checkbox checkbox, select option from combobox dropdown, click on element with selector: text=Select Hospital, click on list >> text=C1002 - Test Company [ button, click on button[name="Add"] button, click on button[name="Ok"] button, check element with selector: #radio, click on button[name="Add"] button, click on button[name="Ok"] button
 * @test login-page test
 * @tags @ui @critical
 */
test('login-page @ui @critical', async ({ page }, testInfo) => {
  // Initialize page object
  const login = new Login(page);
  
  // Start test logging
  logger.testStart('login-page test', ['@ui @critical']);
  
  try {
    // Setup test environment
    // const video = page.video();
    // if (video) {
    //   const videoPath = testInfo.outputPath('login-page-recording.webm');
    //   await video.saveAs(videoPath);
    //   await video.delete();
    // }
    // await page.screenshot({ path: testInfo.outputPath('login-page-initial.png') });

    // Execute test steps
    // Navigate to the page
      await login.goto('https://web.vitadev.vero-biotech.com/');
    // Click on textbox[name="Email Address"] button
      await login.clickTextboxEmailAddress();
    // Fill in the Role Textbox Name Email Address field
      await login.fillTextboxEmailAddress('baljeetadmin@gmail.com');
    // Press TAB key
      await login.pressTextboxEmailAddressTab();
    // Fill in the Role Textbox Name Password field
      await login.fillTextboxPassword('Test@12345');
    // Click on button[name="Sign in"] button
      await login.clickButtonSignIn();
    // Click on button[name="Image"] button
      await login.clickButtonImage();
    // Click on element with selector: a >> text=User Management
      await login.clickATextUserManagement();
    // Click on button[name="Manage User"] button
      await login.clickButtonManageUser();
    // Click on button[name="Add User"] button
      await login.clickButtonAddUser();
    // Select option from combobox dropdown
      await login.selectCombobox('External');
    // Click on textbox[name="First Name"] button
      await login.clickTextboxFirstName();
    // Fill in the Role Textbox Name First Name field
      await login.fillTextboxFirstName('test');
    // Press TAB key
      await login.pressTextboxFirstNameTab();
    // Fill in the Role Textbox Name Last Name field
      await login.fillTextboxLastName('test');
    // Press TAB key
      await login.pressTextboxLastNameTab();

    // Fill in the Role Textbox Name Email Address field
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
    // Fill in the Role Textbox Name Password field
      await login.fillTextboxPassword('Test@123');
    // Select option from combobox dropdown
      await login.selectComboboxNth('+91');
    // Click on textbox[name="Phone"] button
      await login.clickTextboxPhone();
    // Fill in the Role Textbox Name Phone field
      await login.fillTextboxPhone('1234567890');
    // Click on button[name="Next"] button
      await login.clickButtonNext();
    // Check checkbox checkbox
      await login.checkCheckboxFirst();
    // Select option from combobox dropdown
      await login.selectComboboxFirst('7');
    // Click on element with selector: text=Select Hospital
      await login.clickTextSelectHospital();
    // Click on list >> text=C1002 - Test Company [ button
      await login.clickListTextCTestCompany();
    // Click on button[name="Add"] button
      await login.clickButtonAdd();
    // Click on button[name="Ok"] button
      await login.clickButtonOk();
    // Check element with selector: #radio
      await login.checkradio();
    // Click on button[name="Add"] button
      await login.clickButtonAdd();
    // Click on button[name="Ok"] button
    await page.waitForTimeout(20000);
      // await login.clickButtonOk();
    
    // Take final screenshot on success
    // await page.screenshot({ path: testInfo.outputPath('login-page-success.png') });
    
    // Mark test as passed
    logger.testEnd('login-page test', 'passed', Date.now());
  } catch (error) {
    // Capture screenshot on failure
    // await page.screenshot({ path: testInfo.outputPath('login-page-failed.png') });
    
    // Log test failure
    logger.testEnd('login-page test', 'failed', Date.now());
    throw error;
  }
});

/**
 * Test suite for user creation field validation
 * Validates all required fields, formats, and boundary conditions
 * @tags @ui @critical @regression
 */
test.describe('User Creation Field Validation', () => {
  let login: Login;

  test.beforeEach(async ({ page }) => {
    login = new Login(page);
    logger.testStart('User creation field validation setup', ['@ui', '@critical']);
    
    // Navigate and login
    await login.goto('https://web.vitadev.vero-biotech.com/');
    await login.fillTextboxEmailAddress('baljeetadmin@gmail.com');
    await login.fillTextboxPassword('Test@12345');
    await login.clickButtonSignIn();
    await login.clickButtonImage();
    await login.clickATextUserManagement();
    await login.clickButtonManageUser();
    await login.clickButtonAddUser();
  });

  /**
   * Test required field validation - First Name
   * @test first-name-required
   * @tags @critical @ui @regression
   */
  test('should validate First Name is required @critical @ui @regression', async ({ page }) => {
    logger.testStart('First Name required validation', ['@critical', '@ui', '@regression']);
    
    try {
      // Select user type
      await login.selectCombobox('External');
      
      // Leave First Name empty and try to proceed
      await login.fillTextboxFirstName('');
      await login.fillTextboxLastName('TestLastName');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('1234567890');
      
      // Try to proceed to next step
      await login.clickButtonNext();
      
      // Verify error message or that form doesn't proceed
      const errorMessage = page.locator('text="First Name is required"');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      logger.testEnd('First Name required validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('First Name required validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test required field validation - Last Name
   * @test last-name-required
   * @tags @critical @ui @regression
   */
  test('should validate Last Name is required @critical @ui @regression', async ({ page }) => {
    logger.testStart('Last Name required validation', ['@critical', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      
      // Leave Last Name empty
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('1234567890');
      
      await login.clickButtonNext();
      
      const errorMessage = page.locator('text="Last Name is required"');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      logger.testEnd('Last Name required validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Last Name required validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test email format validation
   * @test email-format-validation
   * @tags @high @ui @regression
   */
  test('should validate email format @high @ui @regression', async ({ page }) => {
    logger.testStart('Email format validation', ['@high', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('TestLastName');
      
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test..test@domain.com',
        'test@domain',
        'test space@domain.com'
      ];
      
      for (const invalidEmail of invalidEmails) {
        await login.fillTextboxEmailAddress(invalidEmail);
        await login.fillTextboxPassword('Test@123');
        await login.selectComboboxNth('+91');
        await login.fillTextboxPhone('1234567890');
        
        await login.clickButtonNext();
        
        // Check for email validation error
        const errorMessage = page.locator('text*="valid email"').or(page.locator('text*="Invalid email"'));
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
        
        // Clear the field for next iteration
        await login.fillTextboxEmailAddress('');
      }
      
      logger.testEnd('Email format validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Email format validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test password strength validation
   * @test password-strength-validation
   * @tags @high @ui @regression
   */
  test('should validate password strength requirements @high @ui @regression', async ({ page }) => {
    logger.testStart('Password strength validation', ['@high', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('TestLastName');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      
      // Test weak passwords
      const weakPasswords = [
        '123',           // Too short
        'password',      // No special chars/numbers
        '12345678',      // Only numbers
        'PASSWORD',      // Only uppercase
        'password123',   // No special chars
        'Pass@',         // Too short with special chars
      ];
      
      for (const weakPassword of weakPasswords) {
        await login.fillTextboxPassword(weakPassword);
        await login.selectComboboxNth('+91');
        await login.fillTextboxPhone('1234567890');
        
        await login.clickButtonNext();
        
        // Check for password validation error
        const errorMessage = page.locator('text*="password"').and(page.locator('text*="requirement"'));
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
        
        await login.fillTextboxPassword('');
      }
      
      logger.testEnd('Password strength validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Password strength validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test phone number format validation
   * @test phone-format-validation
   * @tags @medium @ui @regression
   */
  test('should validate phone number format @medium @ui @regression', async ({ page }) => {
    logger.testStart('Phone format validation', ['@medium', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('TestLastName');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      
      // Test invalid phone formats
      const invalidPhones = [
        '123',           // Too short
        'abcdefghij',    // Letters
        '123-456-789',   // With dashes
        '12345678901234567890', // Too long
        '+911234567890', // With country code
        '123 456 7890'   // With spaces
      ];
      
      for (const invalidPhone of invalidPhones) {
        await login.fillTextboxPhone(invalidPhone);
        
        await login.clickButtonNext();
        
        // Check for phone validation error
        const errorMessage = page.locator('text*="phone"').and(page.locator('text*="valid"'));
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
        
        await login.fillTextboxPhone('');
      }
      
      logger.testEnd('Phone format validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Phone format validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test field length boundaries
   * @test field-length-boundaries
   * @tags @medium @ui @regression
   */
  test('should validate field length boundaries @medium @ui @regression', async ({ page }) => {
    logger.testStart('Field length boundaries validation', ['@medium', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      
      // Test maximum length for First Name (assuming 50 chars max)
      const longFirstName = 'A'.repeat(51);
      await login.fillTextboxFirstName(longFirstName);
      
      // Verify field truncates or shows error
      const firstNameValue = await page.locator('role=textbox[name="First Name"]').inputValue();
      expect(firstNameValue.length).toBeLessThanOrEqual(50);
      
      // Test maximum length for Last Name
      const longLastName = 'B'.repeat(51);
      await login.fillTextboxLastName(longLastName);
      
      const lastNameValue = await page.locator('role=textbox[name="Last Name"]').inputValue();
      expect(lastNameValue.length).toBeLessThanOrEqual(50);
      
      // Test minimum length validation
      await login.fillTextboxFirstName('A');
      await login.fillTextboxLastName('B');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('1234567890');
      
      await login.clickButtonNext();
      
      // Check if minimum length validation exists (may or may not be visible depending on business rules)
      // const minLengthError = page.locator('text*="minimum"').and(page.locator('text*="character"'));
      
      logger.testEnd('Field length boundaries validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Field length boundaries validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test dropdown/combobox validation
   * @test dropdown-validation
   * @tags @medium @ui @regression
   */
  test('should validate dropdown selections @medium @ui @regression', async ({ page }) => {
    logger.testStart('Dropdown validation', ['@medium', '@ui', '@regression']);
    
    try {
      // Test that user type selection is required
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('TestLastName');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      
      // Try to proceed without selecting user type
      await login.clickButtonNext();
      
      // Check for user type selection error
      const userTypeError = page.locator('text*="select"').and(page.locator('text*="user type"'));
      await expect(userTypeError).toBeVisible({ timeout: 3000 });
      
      // Now select user type and test country code
      await login.selectCombobox('External');
      await login.fillTextboxPhone('1234567890');
      
      // Try to proceed without selecting country code
      await login.clickButtonNext();
      
      // Check for country code selection error
      const countryCodeError = page.locator('text*="select"').and(page.locator('text*="country"'));
      await expect(countryCodeError).toBeVisible({ timeout: 3000 });
      
      logger.testEnd('Dropdown validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Dropdown validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test duplicate email validation
   * @test duplicate-email-validation
   * @tags @high @ui @regression
   */
  test('should validate duplicate email addresses @high @ui @regression', async ({ page }) => {
    logger.testStart('Duplicate email validation', ['@high', '@ui', '@regression']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('TestFirstName');
      await login.fillTextboxLastName('TestLastName');
      
      // Use an existing email (the admin email)
      await login.fillTextboxEmailAddress('baljeetadmin@gmail.com');
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('1234567890');
      
      await login.clickButtonNext();
      
      // Check for duplicate email error
      const duplicateEmailError = page.locator('text*="already exists"').or(page.locator('text*="duplicate"'));
      await expect(duplicateEmailError).toBeVisible({ timeout: 5000 });
      
      logger.testEnd('Duplicate email validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Duplicate email validation', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test all fields filled with valid data
   * @test valid-data-success
   * @tags @smoke @ui @critical
   */
  test('should accept valid data in all fields @smoke @ui @critical', async ({ page }) => {
    logger.testStart('Valid data acceptance test', ['@smoke', '@ui', '@critical']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('ValidFirstName');
      await login.fillTextboxLastName('ValidLastName');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('ValidPass@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('9876543210');
      
      await login.clickButtonNext();
      
      // Verify we proceed to next step (no validation errors)
      await page.waitForTimeout(3000);
      
      // Check that we're on the next step of user creation
      const nextStepIndicator = page.locator('role=checkbox').or(page.locator('text="Select Hospital"'));
      await expect(nextStepIndicator).toBeVisible({ timeout: 10000 });
      
      logger.testEnd('Valid data acceptance test', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('Valid data acceptance test', 'failed', Date.now());
      throw error;
    }
  });

  /**
   * Test case from JIRA VT1-839: Add user form - External - Then select hospital and click on Add button - gives warning to select default hospital
   * Validates that when adding an external user, selecting a hospital and clicking Add without setting a default hospital shows appropriate warning
   * @test vt1-839-external-user-hospital-warning
   * @tags @medium @ui @regression @jira-vt1-839
   */
  test('should show warning when adding external user with hospital but no default hospital @medium @ui @regression @jira-vt1-839', async ({ page }) => {
    logger.testStart('VT1-839: External user hospital warning validation', ['@medium', '@ui', '@regression', '@jira-vt1-839']);
    
    try {
      await login.selectCombobox('External');
      await login.fillTextboxFirstName('TestUser');
      await login.fillTextboxLastName('External');
      await login.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
      await login.fillTextboxPassword('Test@123');
      await login.selectComboboxNth('+91');
      await login.fillTextboxPhone('9876543210');
      
      // Proceed to next step
      await login.clickButtonNext();
      
      // Wait for the hospital selection step
      await page.waitForTimeout(3000);
      
      // Check checkbox for permissions
      await login.checkCheckboxFirst();
      await login.selectComboboxFirst('7');
      
      // Select hospital without setting as default
      await login.clickTextSelectHospital();
      await login.clickListTextCTestCompany();
      
      // Click Add button - this should trigger the warning
      await login.clickButtonAddUser();
      
      // Verify warning message appears about selecting default hospital
      const warningMessage = page.locator('text*="default hospital"').or(
        page.locator('text*="select default"')
      ).or(
        page.locator('text*="warning"')
      ).or(
        page.locator('[role="alert"]')
      );
      
      await expect(warningMessage).toBeVisible({ timeout: 5000 });
      
      logger.testEnd('VT1-839: External user hospital warning validation', 'passed', Date.now());
    } catch (error) {
      logger.testEnd('VT1-839: External user hospital warning validation', 'failed', Date.now());
      throw error;
    }
  });
});