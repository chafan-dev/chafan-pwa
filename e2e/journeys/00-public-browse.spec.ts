import { test, expect } from '@playwright/test';
import { TEST_SITE } from '../fixtures/sites';
import { waitForApp } from '../helpers/app';

/**
 * Logged-out cold open — does the deploy shell + public pages render?
 */
test.describe('Public browse (logged out)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('home loads', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('login page shows form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible();
  });

  test('explore page loads', async ({ page }) => {
    await page.goto('/explore/');
    await waitForApp(page);
  });

  test('test site page loads', async ({ page }) => {
    await page.goto(TEST_SITE.path);
    await waitForApp(page);
    await expect(page.getByRole('button', { name: '提问' })).toBeVisible({ timeout: 30_000 });
  });
});
