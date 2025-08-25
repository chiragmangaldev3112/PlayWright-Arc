import { test, expect } from '@playwright/test';
import { GeneratedPage } from '@pages/GeneratedPage';

test.describe('GeneratedPage Tests', () => {
  let page: GeneratedPage;

  test.beforeEach(async ({ page: testPage }) => {
    page = new GeneratedPage(testPage);
  });

  test('should perform actions on GeneratedPage', async () => {
  await page.goto('https://example.com');
  await page.clickTextboxemailAddress();
  await page.clickButtonsignIn();
  await page.clickButtonimage();
  await page.clickA();
  await page.clickButtonmanageUser();
  await page.clickButtonaddUser();
  await page.clickTextboxfirstName();
  await page.clickTextboxpassword();
  await page.clickTextboxphone();
  await page.clickButtonnext();
  await page.clickListButton();
  await page.clickButtonadd();
  await page.clickButtonok();
  });
});