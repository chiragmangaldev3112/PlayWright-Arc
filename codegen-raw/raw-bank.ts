import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://parabank.parasoft.com/parabank/index.html');
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill('Test');
  await page.locator('input[name="username"]').press('Tab');
  await page.locator('input[name="password"]').fill('Test@123');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  await page.getByRole('link', { name: 'Bill Pay' }).click();
  await page.getByRole('link', { name: 'Find Transactions' }).click();
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await page.getByRole('button', { name: 'Transfer' }).click();
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await page.locator('#amount').click();
  await page.locator('#amount').fill('2222');
  await page.getByRole('button', { name: 'Transfer' }).click();
});