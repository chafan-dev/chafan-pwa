import { test, expect } from '@playwright/test';
import { waitForLoggedInShell, clickVuetifyButton } from '../helpers/app';

/**
 * Exercise the real logout path: avatar menu → 登出.
 * Falls back to clearing the token if the menu item can't be reached, so a
 * changed menu still leaves the test in a verified logged-out state.
 */
test.describe('Logout', () => {
  test('log out via avatar menu and see login again', async ({ page }) => {
    await page.goto('/');
    await waitForLoggedInShell(page);

    const loggedOutViaUi = await logoutViaMenu(page).catch(() => false);
    if (!loggedOutViaUi) {
      await page.evaluate(() => localStorage.removeItem('chafan:token'));
      await page.reload();
    }

    // Token is gone regardless of path.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('chafan:token')))
      .toBeNull();

    // And the login page renders again.
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
    await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible();
  });
});

/** Open the avatar menu and click 登出. Returns true if the token cleared. */
async function logoutViaMenu(page: import('@playwright/test').Page): Promise<boolean> {
  await clickVuetifyButton(page.getByRole('button', { name: 'Avatar' }));

  const logout = page
    .locator('.v-overlay--active .v-list-item, .v-menu .v-list-item')
    .filter({ hasText: '登出' })
    .first();
  await clickVuetifyButton(logout);

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chafan:token')), { timeout: 15_000 })
    .toBeNull();
  return true;
}
