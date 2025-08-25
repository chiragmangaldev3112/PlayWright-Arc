import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('baljeetadmin@gmail.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@12345');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: 'Image' }).first().click();

  await page.locator('a').filter({ hasText: 'User Management' }).click();
  await page.getByRole('button', { name: 'Manage User' }).click();
  await page.getByRole('button', { name: 'Add User' }).click();
  await page.getByRole('combobox').selectOption('External');
  await page.getByRole('textbox', { name: 'First Name' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).fill('test');
  await page.getByRole('textbox', { name: 'First Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Last Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Last Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('test5646@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@12345');
  await page.getByRole('combobox').nth(1).selectOption('+91');
 
  await page.getByRole('textbox', { name: 'Phone' }).click();
  await page.getByRole('textbox', { name: 'Phone' }).fill('1234567890');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('checkbox').first().check();
  await page.getByText('Select Hospital').click();
  await page.getByRole('list').getByText('C1005 - Nightstar, Inc. [').click();
  await page.getByRole('list').getByText('C1002 - Test Company [').click();
  await page.getByRole('combobox').first().selectOption('7');
  await page.getByRole('row', { name: 'C1005 - Nightstar, Inc. [' }).locator('#radio').check();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Ok' }).click();
});