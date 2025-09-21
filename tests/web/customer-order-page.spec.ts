import { test, expect } from '@playwright/test';
import { CustomerOrder } from '@pages/CustomerOrder';
import { Login } from '@pages/Login';
import { logger } from '@utils/core/logger';

/**
 * Reusable login helper function
 * Performs standard login flow used across tests
 */
async function performLogin(login: Login): Promise<void> {
  await login.goto('https://web.vitadev.vero-biotech.com/');
  await login.fillTextboxEmailAddress('baljeetadmin@gmail.com');
  await login.fillTextboxPassword('Test@12345');
  await login.clickButtonSignIn();
  await login.clickButtonImage();
}

test.describe('CustomerOrder Tests - Chromium Only', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Only run on Chromium');

  /**
   * Test to navigate to https://login.vitadev.vero-biotech.com/verovitadev.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=ff104445-0acf-4da3-84b7-c85c264da404&scope=https%3A%2F%2Fverovitadev.onmicrosoft.com%2Ffb731259-88ef-466e-92b1-0e94fa7a7c3b%2Fread_write_from_web_app%20openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fweb.vitadev.vero-biotech.com%2F&client-request-id=01990a07-e538-7cdb-9259-837b6cbe39c3&response_mode=fragment&client_info=1&nonce=01990a07-e53c-7534-81de-2494f6106d58&state=eyJpZCI6IjAxOTkwYTA3LWU1M2EtNzMxZi1iMDZkLTg5NzJmZWFkZDBkNCIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D&claims=%7B%22access_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&x-client-SKU=msal.js.browser&x-client-VER=4.15.0&response_type=code&code_challenge=Qn09__JVNLMA2w7wISsRUnwc_ObJFRFezv9AbiXHNsc&code_challenge_method=S256, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, press TAB key, fill Role Textbox Name Password field, click on button[name="Sign in"] button, navigate to https://web.vitadev.vero-biotech.com/onboarding/web-app-options, click on button[name="Image"] button, navigate to https://web.vitadev.vero-biotech.com/web-main/hospital-invoice, click on element with selector: a >> text=Create New Order, click on combobox[name="Hospital"] button, fill Role Combobox Name Hospital field, perform action, click on textbox[name="Search Items.."] button, check element with selector: .custom-control-input, click on button[name="Proceed"] button, fill Role Textbox Name P O Number field, click on textbox[name="Requester"] button, fill Role Textbox Name Requester field, click on textbox[name="Phone"] button, fill Role Textbox Name Phone field, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, click on textbox[name="Notes"] button, fill Role Textbox Name Notes field, check checkbox checkbox, click on button[name="Yes"] button, click on button[name="Place Order"] button, click on button[name="Yes"] button, click on button[name="Ok"] button, click on element with selector: a >> text=Order Status
   * @test customer-order-page test
   * @tags @ui @critical
   */
  test('customer-order-page @ui @critical', async ({ page }, testInfo) => {
  // Initialize page objects
  const customerorder = new CustomerOrder(page);
  const login = new Login(page);
  
  // Start test logging
  logger.testStart('customer-order-page test', ['@ui @critical']);
  
  try {
    // Setup test environment
    // const video = page.video();
    // if (video) {
    //   const videoPath = testInfo.outputPath('customer-order-page-recording.webm');
    //   await video.saveAs(videoPath);
    //   await video.delete();
    // }
    // await page.screenshot({ path: testInfo.outputPath('customer-order-page-initial.png') });

    // Execute test steps
    // Perform login using reusable login helper
    await performLogin(login);
    
    // Navigate to hospital invoice page
    await customerorder.goto('https://web.vitadev.vero-biotech.com/web-main/hospital-invoice');
    // Start customer order flow
    // Click on element with selector: a >> text=Create New Order
      await customerorder.clickATextCreateNewOrder();
    // Click on combobox[name="Hospital"] button
      await customerorder.clickComboboxHospital();
    // Fill in the Role Combobox Name Hospital field
      await customerorder.fillComboboxHospital('C1075 - AdventHealth Orlando');
    // Wait for page to load items after hospital selection
      await page.waitForTimeout(3000);
      await customerorder.performAction()
    // Click on textbox[name="Search Items.."] button
      await customerorder.clickTextboxSearchItems();
    // Check element with selector: .custom-control-input
      await customerorder.checkcustomcontrolinput();
    // Click on button[name="Proceed"] button
      await customerorder.clickButtonProceed();
    // Fill in the Role Textbox Name P O Number field
      await customerorder.fillTextboxPONumber('123');
    // Click on textbox[name="Requester"] button
      await customerorder.clickTextboxRequester();
    // Fill in the Role Textbox Name Requester field
      await customerorder.fillTextboxRequester('abc');
    // Click on textbox[name="Phone"] button
      await customerorder.clickTextboxPhone();
    // Fill in the Role Textbox Name Phone field
      await customerorder.fillTextboxPhone('8699876778');
    // Click on textbox[name="Email Address"] button
      await customerorder.clickTextboxEmailAddress();
    // Fill in the Role Textbox Name Email Address field
      await customerorder.fillTextboxEmailAddress('test@gmail.com');
    // Click on textbox[name="Notes"] button
      await customerorder.clickTextboxNotes();
    // Fill in the Role Textbox Name Notes field
      await customerorder.fillTextboxNotes('HI');
    // Check checkbox checkbox
      await customerorder.checkCheckbox();
    // Click on button[name="Yes"] button
      await customerorder.clickButtonYes();
    // Click on button[name="Place Order"] button
      await customerorder.clickButtonPlaceOrder();
    // Click on button[name="Yes"] button
      await customerorder.clickButtonYes();
    // Click on button[name="Ok"] button
      await customerorder.clickButtonOk();
    // Click on element with selector: a >> text=Order Status
      await customerorder.clickATextOrderStatus();
    
    // Take final screenshot on success
    // await page.screenshot({ path: testInfo.outputPath('customer-order-page-success.png') });
    
    // Mark test as passed
    logger.testEnd('customer-order-page test', 'passed', Date.now());
  } catch (error) {
    // Capture screenshot on failure
    // await page.screenshot({ path: testInfo.outputPath('customer-order-page-failed.png') });
    
    // Log test failure
    logger.testEnd('customer-order-page test', 'failed', Date.now());
    throw error;
  }
  });
});