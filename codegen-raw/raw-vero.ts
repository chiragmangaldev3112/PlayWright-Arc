import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://login.vitadev.vero-biotech.com/verovitadev.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=ff104445-0acf-4da3-84b7-c85c264da404&scope=https%3A%2F%2Fverovitadev.onmicrosoft.com%2Ffb731259-88ef-466e-92b1-0e94fa7a7c3b%2Fread_write_from_web_app%20openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fweb.vitadev.vero-biotech.com%2F&client-request-id=01990a65-0a35-7fca-bf3b-a822bd6df386&response_mode=fragment&client_info=1&nonce=01990a65-0a38-7886-a062-b0f6cd934b10&state=eyJpZCI6IjAxOTkwYTY1LTBhMzctNzY1ZS1hOGU4LTFkYmY4NDU3MWYwNCIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D&claims=%7B%22access_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&x-client-SKU=msal.js.browser&x-client-VER=4.15.0&response_type=code&code_challenge=gOXoUm3epR7dYGszAt6AA9wiGtiDUUq5yRvaUS9bn4o&code_challenge_method=S256');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('baljeetadmin@gmail.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@12345');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.goto('https://web.vitadev.vero-biotech.com/onboarding/web-app-options');
  await page.getByRole('button', { name: 'Image' }).first().click();
  await page.locator('a').filter({ hasText: 'Create New Order' }).click();
  await page.getByRole('combobox', { name: 'Hospital' }).click();
  await page.getByRole('combobox', { name: 'Hospital' }).fill('C1075 - AdventHealth Orlando');
  await page.locator('#pageSize').selectOption('GENOSYL TRANSPORT Customer Order Form');
});