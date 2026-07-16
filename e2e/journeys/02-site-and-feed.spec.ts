import { test, expect } from '@playwright/test';
import { TEST_SITE } from '../fixtures/sites';
import { waitForLoggedInShell } from '../helpers/app';

/**
 * Logged-in read paths on the designated test site.
 */
test.describe('Logged-in browse', () => {
  test('home as authenticated user', async ({ page }) => {
    await page.goto('/');
    await waitForLoggedInShell(page);
    await expect(page).not.toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('chafan:token'));
    expect(token).toBeTruthy();
  });

  test('open test site and switch tabs', async ({ page }) => {
    await page.goto(TEST_SITE.path);
    await waitForLoggedInShell(page);
    await expect(page.getByRole('button', { name: '提问' })).toBeVisible({ timeout: 30_000 });

    const questionsTab = page.getByRole('tab', { name: /问题/ });
    const submissionsTab = page.getByRole('tab', { name: /分享/ });

    await expect(questionsTab).toBeVisible();
    await submissionsTab.click();
    await expect(submissionsTab).toHaveAttribute('aria-selected', 'true');
    await questionsTab.click();
    await expect(questionsTab).toHaveAttribute('aria-selected', 'true');
  });
});
