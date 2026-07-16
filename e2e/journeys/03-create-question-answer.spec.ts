import { test, expect } from '@playwright/test';
import { TEST_SITE } from '../fixtures/sites';
import { uniqueTitle } from '../helpers/unique';
import { waitForLoggedInShell, writeAndPublishAnswer } from '../helpers/app';

/**
 * Real create flow: site → 提问 → question page → 写回答 → publish.
 */
test.describe('Create question and answer', () => {
  test('create a question on the test site and post an answer', async ({ page }) => {
    const questionTitle = uniqueTitle('question');
    const answerBody = `e2e answer body ${Date.now()}`;

    await page.goto(TEST_SITE.path);
    await waitForLoggedInShell(page);
    await expect(page.getByRole('button', { name: '提问' })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: '提问' }).click();
    const dialog = page.locator('.v-overlay--active .v-card, .v-dialog--active .v-card').filter({
      hasText: '提问',
    });
    await expect(dialog.getByText('提问').first()).toBeVisible();

    await dialog.locator('textarea').first().fill(questionTitle);
    await dialog.getByRole('button', { name: '提交新问题' }).click();

    await page.waitForURL(/\/questions\/[^/]+/, { timeout: 30_000 });
    await expect(page.getByText(questionTitle).first()).toBeVisible({ timeout: 20_000 });
    await waitForLoggedInShell(page);

    await writeAndPublishAnswer(page, answerBody);

    await expect(page.getByText(answerBody).first()).toBeVisible({ timeout: 30_000 });
  });
});
