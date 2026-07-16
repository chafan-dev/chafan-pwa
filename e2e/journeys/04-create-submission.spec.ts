import { test, expect } from '@playwright/test';
import { TEST_SITE } from '../fixtures/sites';
import { uniqueTitle } from '../helpers/unique';
import { waitForLoggedInShell } from '../helpers/app';

/**
 * Real create flow: site → 新分享 → submission detail.
 */
test.describe('Create submission', () => {
  test('create a share on the test site', async ({ page }) => {
    const title = uniqueTitle('submission');

    await page.goto(TEST_SITE.path);
    await waitForLoggedInShell(page);
    await expect(page.getByRole('button', { name: '新分享' })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: '新分享' }).click();
    const dialog = page.locator('.v-overlay--active .v-card, .v-dialog--active .v-card').filter({
      hasText: '分享',
    });
    await expect(dialog.getByText('分享').first()).toBeVisible();

    await dialog.locator('textarea').first().fill(title);

    // Optional URL: leave empty but use a valid optional fill if the field requires one
    // vee-validate "url" rule often rejects empty string — fill a real URL instead
    const urlBox = dialog.getByRole('textbox', { name: 'URL（可选）' });
    if (await urlBox.count()) {
      await urlBox.fill('https://example.com/e2e');
    }

    await dialog.getByRole('button', { name: '提交', exact: true }).click();

    await page.waitForURL(/\/submissions\/[^/]+/, { timeout: 45_000 });
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });
  });
});
