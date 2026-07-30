import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/** Vue mounts on #app[data-v-app]; index.html also has a bare #app shell. */
export function appRoot(page: Page): Locator {
  return page.locator('#app[data-v-app], .v-application').first();
}

export async function waitForApp(page: Page) {
  await expect(appRoot(page)).toBeVisible({ timeout: 30_000 });
}

/** Ensure Pinia finished checkLoggedIn (avatar appears when profile is loaded). */
export async function waitForLoggedInShell(page: Page) {
  await waitForApp(page);
  await expect(page.getByRole('button', { name: 'Avatar' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('link', { name: '用户中心' })).toBeVisible({ timeout: 15_000 });
}

/**
 * Vuetify v-btn pointer overlays often block Playwright's synthetic clicks.
 * DOM element.click() reliably fires Vue @click on preview.cha.fan.
 */
export async function clickVuetifyButton(locator: Locator) {
  await expect(locator).toBeVisible({ timeout: 15_000 });
  await locator.evaluate((el: HTMLElement) => {
    el.click();
  });
}

/**
 * Write and publish an answer on the current question page.
 *
 * Note: Question.vue auto-opens the answer editor when there are zero answers
 * (`showEditor = true`). Clicking 「写回答」 toggles it — so do not click if
 * the editor is already open.
 */
export async function writeAndPublishAnswer(page: Page, text: string) {
  const editorOpen = page.getByText('编辑答案');
  const publish = page.locator('button.v-btn').filter({ hasText: '发表答案' }).first();

  // Prefer auto-opened editor; only click 写回答 if still closed after load
  const alreadyOpen = await editorOpen
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);

  if (!alreadyOpen) {
    const writeBtn = page.locator('button.v-btn.bg-primary').filter({ hasText: '写回答' }).first();
    await clickVuetifyButton(writeBtn);
    await expect(editorOpen).toBeVisible({ timeout: 15_000 });
  }

  await expect(publish).toBeVisible({ timeout: 30_000 });

  const editor = page.locator('[contenteditable="true"]:visible').last();
  await expect(editor).toBeVisible({ timeout: 15_000 });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(text, { delay: 8 });

  await clickVuetifyButton(publish);
}
