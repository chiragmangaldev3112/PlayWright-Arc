import { test, expect } from '@playwright/test';
import { Login } from '@pages/Login';
import { logger } from '@utils/core/logger';

/**
 * Test to navigate to https://example.com, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, press TAB key, fill Role Textbox Name Password field, click on button[name="Sign in"] button, click on button[name="Image"] button, click on element with selector: a >> text=User Management, click on button[name="Manage User"] button, click on button[name="Add User"] button, click on textbox[name="First Name"] button, fill Role Textbox Name First Name field, press TAB key, fill Role Textbox Name Last Name field, press TAB key, fill Role Textbox Name Email Address field, click on textbox[name="Password"] button, click on textbox[name="Phone"] button, fill Role Textbox Name Phone field, click on button[name="Next"] button, click on element with selector: text=Select Hospital, click on list button, click on button[name="Add"] button, click on button[name="Ok"] button
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
      await login.goto('https://example.com');
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
      await login.fillTextboxEmailAddress('test5646@gmail.com');
    // Click on textbox[name="Password"] button
      await login.clickTextboxPassword();
    // Click on textbox[name="Phone"] button
      await login.clickTextboxPhone();
    // Fill in the Role Textbox Name Phone field
      await login.fillTextboxPhone('1234567890');
    // Click on button[name="Next"] button
      await login.clickButtonNext();
    // Click on element with selector: text=Select Hospital
      await login.clickTextSelectHospital();
    // Click on list button
      await login.clickListButton();
    // Click on button[name="Add"] button
      await login.clickButtonAdd();
    // Click on button[name="Ok"] button
      await login.clickButtonOk();
    
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