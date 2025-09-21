import { test, expect } from '@playwright/test';
import { CreateUser } from '@pages/CreateUser';
import { logger } from '@utils/core/logger';
import { DataHelpers } from '@/utils';

test.describe('CreateUser Tests - Chromium Only', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Only run on Chromium');

  /**
   * Test to navigate to https://login.vitadev.vero-biotech.com/verovitadev.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=ff104445-0acf-4da3-84b7-c85c264da404&scope=https%3A%2F%2Fverovitadev.onmicrosoft.com%2Ffb731259-88ef-466e-92b1-0e94fa7a7c3b%2Fread_write_from_web_app%20openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fweb.vitadev.vero-biotech.com%2F&client-request-id=019909a5-48fa-731c-94f9-5189d37df356&response_mode=fragment&client_info=1&nonce=019909a5-48fe-78f4-9da2-85c995055517&state=eyJpZCI6IjAxOTkwOWE1LTQ4ZmMtN2I5ZC04YWI1LTJjNWI0MjVmZjUxYyIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D&claims=%7B%22access_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&x-client-SKU=msal.js.browser&x-client-VER=4.15.0&response_type=code&code_challenge=Mbt6zH6WBiRmfGQFv-R2HUFxTJl9Axt9EtSfu44NBOY&code_challenge_method=S256, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, press TAB key, fill Role Textbox Name Password field, click on button[name="Sign in"] button, navigate to https://web.vitadev.vero-biotech.com/onboarding/terms-conditions-viewer, click on button[name="Accept"] button, click on heading[name="Welcome, Brayan Smitth!"] button, click on element with selector: text=Select an application to, click on button[name="Image"] button, navigate to https://web.vitadev.vero-biotech.com/web-main/hospital-invoice, click on element with selector: a >> text=User Management, click on button[name="Manage User"] button, click on button[name="Add User"] button, select option from combobox dropdown, click on textbox[name="First Name"] button, fill Role Textbox Name First Name field, click on textbox[name="Last Name"] button, fill Role Textbox Name Last Name field, click on textbox[name="Email Address"] button, fill Role Textbox Name Email Address field, click on textbox[name="Password"] button, fill Role Textbox Name Password field, select option from combobox dropdown, click on textbox[name="Phone"] button, fill Role Textbox Name Phone field, click on button[name="Next"] button, click on heading[name="Add User"] button, click on element with selector: text=Application Access, check checkbox checkbox, select option from combobox dropdown, click on element with selector: div >> text=undefined, click on list >> text=C1002 - Test Company [ button, click on element with selector: app-create-users, check element with selector: #radio, check checkbox checkbox, select option from combobox dropdown, click on element with selector: div >> text=undefined, click on element with selector: text=C1011 ECU Health, click on element with selector: app-create-users div >> text=Application Access Vita Role, click on button[name="Add"] button, click on button[name="Ok"] button
   * @test create-user-page test
   * @tags @ui @critical
   */
  test('create-user-page @ui @critical', async ({ page }, testInfo) => {
  test.setTimeout(300000); // 5 minutes timeout for complex user creation flow
  // Initialize page object
  const createuser = new CreateUser(page);
  
  // Start test logging
  logger.testStart('create-user-page test', ['@ui @critical']);
  
  try {
    // Setup test environment
    // const video = page.video();
    // if (video) {
    //   const videoPath = testInfo.outputPath('create-user-page-recording.webm');
    //   await video.saveAs(videoPath);
    //   await video.delete();
    // }
    // await page.screenshot({ path: testInfo.outputPath('create-user-page-initial.png') });

    // Execute test steps
    // Navigate to the page
    await createuser.goto('https://web.vitadev.vero-biotech.com/');    // Click on textbox[name="Email Address"] button
      await createuser.clickTextboxEmailAddress();
    // Fill in the Role Textbox Name Email Address field
      await createuser.fillTextboxEmailAddress('Baljeetadmin@gmail.com');
    // Press TAB key
      await createuser.pressTextboxEmailAddressTab();
    // Fill in the Role Textbox Name Password field
      await createuser.fillTextboxPassword('Test@12345');
    // Click on button[name="Sign in"] button
      await createuser.clickButtonSignIn();
    // Navigate to the page
    //   await createuser.goto('https://web.vitadev.vero-biotech.com/onboarding/terms-conditions-viewer');
    // // Click on button[name="Accept"] button
    //   await createuser.clickButtonAccept();
    // Click on heading[name="Welcome, Brayan Smitth!"] button
      await createuser.clickHeadingWelcomeBrayanSmitth();
    // Click on element with selector: text=Select an application to
      await createuser.clickTextSelectAnApplicationTo();
    // Click on button[name="Image"] button
      await createuser.clickButtonImage();
    // Navigate to the page
      // await createuser.goto('https://web.vitadev.vero-biotech.com/web-main/hospital-invoice');
    // Click on element with selector: a >> text=User Management
      await createuser.clickATextUserManagement();
    // Click on button[name="Manage User"] button
      await createuser.clickButtonManageUser();
    // Click on button[name="Add User"] button
      await createuser.clickButtonAddUser();
    // Select option from combobox dropdown
      await createuser.selectCombobox('External');
    // Click on textbox[name="First Name"] button
      await createuser.clickTextboxFirstName();
    // Fill in the Role Textbox Name First Name field
      await createuser.fillTextboxFirstName('test');
    // Click on textbox[name="Last Name"] button
      await createuser.clickTextboxLastName();
    // Fill in the Role Textbox Name Last Name field
      await createuser.fillTextboxLastName('user');
    // Click on textbox[name="Email Address"] button
      await createuser.clickTextboxEmailAddress();
    // Fill in the Role Textbox Name Email Address field
      await createuser.fillTextboxEmailAddress(DataHelpers.getInstance().generateFakeUserData().email as string);
    // Click on textbox[name="Password"] button
      await createuser.clickTextboxPassword();
    // Fill in the Role Textbox Name Password field
      await createuser.fillTextboxPassword('Test@12345');
    // Select option from combobox dropdown
      await createuser.selectComboboxNth('+91');
    // Click on textbox[name="Phone"] button
      await createuser.clickTextboxPhone();
    // Fill in the Role Textbox Name Phone field
      await createuser.fillTextboxPhone('8699876867');
    // Click on button[name="Next"] button
      await createuser.clickButtonNext();
    // Click on heading[name="Add User"] button
      await createuser.clickHeadingAddUser();
    // Click on element with selector: text=Application Access
      await createuser.clickTextApplicationAccess();
    // Check checkbox checkbox
      await createuser.checkCheckboxFirst();
    // Select option from combobox dropdown
      await createuser.selectComboboxFirst('7');
    // Click on element with selector: div >> text=undefined
    await createuser.clickTextSelectHospital();
    // Click on list >> text=C1002 - Test Company [ button
      await createuser.clickListTextCTestCompany();
    // Click on element with selector: app-create-users
      await createuser.clickappCreateUsers();
    // Check element with selector: #radio
      await createuser.checkradio();
    // Check checkbox checkbox
      await createuser.checkCheckboxNth();
    // Select option from combobox dropdown
      await createuser.selectComboboxNth('14');
    // Click on element with selector: div >> text=undefined
       await createuser.clickTextSelectGroup();
    // Click on element with selector: text=C1011 ECU Health
      await createuser.clickTextCEcuHealth();
    // Click on element with selector: app-create-users div >> text=Application Access Vita Role
      await createuser.clickAppCreateUsersDivTextApplicationAccessVitaRole();
    // Click on button[name="Add"] button
      await createuser.clickButtonAdd();
    // Click on button[name="Ok"] button
      await createuser.clickButtonOk();
    
    // Take final screenshot on success
    // await page.screenshot({ path: testInfo.outputPath('create-user-page-success.png') });
    
    // Mark test as passed
    logger.testEnd('create-user-page test', 'passed', Date.now());
  } catch (error) {
    // Capture screenshot on failure
    // await page.screenshot({ path: testInfo.outputPath('create-user-page-failed.png') });
    
    // Log test failure
    logger.testEnd('create-user-page test', 'failed', Date.now());
    throw error;
  }
  });
});