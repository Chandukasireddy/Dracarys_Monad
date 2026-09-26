import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Keep your fire alive.' })).toBeVisible();
});
test('check-in requires proof, updates totals and persists without duplicate claim', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Keep the streak going' }).click();
  const claim = page.getByRole('button', { name: /Claim Daily Stake/ });
  await expect(claim).toBeDisabled();
  await page.getByRole('button', { name: 'Try with a sample photo' }).click();
  await expect(claim).toBeEnabled();
  await claim.click();
  await expect(page.getByRole('heading', { name: 'That’s another day in the bag.' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep the fire going' }).click();
  await expect(page.getByRole('button', { name: 'Done for today' })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Done for today' })).toBeDisabled();
  await expect(page.locator('.stat-card').first()).toContainText('6');
});
test('creates validated challenge with QR invite and joins demo challenge', async ({
  page,
}, testInfo) => {
  await page.getByRole('button', { name: 'New challenge' }).click();
  await page.getByRole('button', { name: 'Set your commitment' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Give your habit a name');
  await page.getByLabel('What will you show up for?').fill('Drink more water');
  await page.getByRole('button', { name: '7 days', exact: true }).click();
  await page.getByRole('button', { name: 'Set your commitment' }).click();
  await page.getByLabel('Daily micro-stake').fill('-1');
  await page.getByRole('button', { name: 'Create challenge', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Enter a stake');
  await page.getByLabel('Daily micro-stake').fill('0.1');
  await page.getByRole('button', { name: 'Create challenge', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Better together.' })).toBeVisible();
  await expect(page.locator('.qr-wrap svg')).toBeVisible();
  await page.getByRole('button', { name: 'Let’s start this streak' }).click();
  await expect(page.getByRole('heading', { name: 'Drink more water', exact: true })).toBeVisible();
  await page.locator('.join-banner').click();
  await page.getByLabel('Invite code', { exact: true }).fill('bad-code');
  await page.getByRole('button', { name: 'Join challenge', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Invite not found');
  await page.getByRole('button', { name: 'DRA-WALK7', exact: true }).click();
  await page.getByRole('button', { name: 'Join challenge', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Take the scenic route.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Drink more water', exact: true })).toBeVisible();
});
test('friend proofs approve once and history persists', async ({ page }) => {
  await page.getByRole('button', { name: 'View all approvals' }).click();
  await page.getByRole('button', { name: "View Maya Chen's proof" }).click();
  await expect(page.getByRole('dialog')).toContainText('Maya showed up.');
  await page.getByRole('button', { name: 'Approve check-in' }).click();
  await expect(page.locator('.approved-history')).toContainText('Maya Chen');
  await page.reload();
  await page.getByRole('button', { name: 'View all approvals' }).click();
  await expect(page.locator('.approved-history')).toContainText('Maya Chen');
  await expect(page.getByRole('button', { name: 'Approve Maya', exact: true })).toHaveCount(0);
});
test('responsive shell, keyboard dialog and wallet errors', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.locator('.wallet-button').click();
  await expect(page.getByRole('dialog')).toContainText('frontend demo');
  await page.getByRole('button', { name: 'Connect browser wallet' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-dashboard.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `test-results/${testInfo.project.name}-viewport.png` });
  expect(errors).toEqual([]);
});
test('install manifest and cached app shell work offline', async ({ page, context }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const response = await page.request.get('/manifest.webmanifest');
  const manifest = await response.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(2);
  await page.waitForTimeout(800);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Keep your fire alive.' })).toBeVisible();
  await expect(page.getByText('Offline · demo progress saved on this device')).toBeVisible();
  await context.setOffline(false);
});
