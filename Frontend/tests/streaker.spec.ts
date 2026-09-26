import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Keep your fire alive.' })).toBeVisible();
});

test('opens account modal, shows Dracarys logo, and allows creating an account', async ({ page }) => {
  // Click Sign In / Register
  await page.getByRole('button', { name: /Sign In/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('DRACARYS')).toBeVisible();

  // Switch to Create Account
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByLabel('Your Full Name')).toBeVisible();
  await expect(page.getByLabel('Username (@handle)')).toBeVisible();

  // Fill registration form
  await page.getByLabel('Your Full Name').fill('Chandu Kasireddy');
  await page.getByLabel('Username (@handle)').fill('chandu');
  await page.getByLabel('Short Bio / Daily Habit Goal').fill('Building Dracarys on Monad 🔥');
  
  // Submit
  await page.getByRole('button', { name: /Create & Ignite/i }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('Chandu Kasireddy')).toBeVisible();
});

test('creates validated habit challenge and displays QR invite code', async ({ page }) => {
  await page.getByRole('button', { name: /Kindle your first habit stake|Create a challenge|New challenge/i }).first().click();
  await page.getByRole('button', { name: 'Set your commitment' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Give your habit a name');

  await page.getByLabel('What will you show up for?').fill('10k Steps Every Day');
  await page.getByRole('button', { name: '7 days', exact: true }).click();
  await page.getByRole('button', { name: 'Set your commitment' }).click();

  await page.getByLabel('Daily micro-stake').fill('0.05');
  await page.getByRole('button', { name: 'Create challenge', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Better together.' })).toBeVisible();
  await expect(page.locator('.qr-wrap svg')).toBeVisible();

  await page.getByRole('button', { name: 'Let’s start this streak' }).click();
  await expect(page.getByRole('heading', { name: '10k Steps Every Day', exact: true })).toBeVisible();
});
