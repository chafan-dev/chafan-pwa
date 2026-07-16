import type { Page } from '@playwright/test';

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByRole('heading', { name: '登录' }).waitFor({ state: 'visible' });

  await page.locator('input[name="login"]').fill(email);
  await page.locator('input[name="password"], #password').fill(password);

  await page.getByRole('button', { name: '登录', exact: true }).click();

  // Successful login leaves /login (home or reload)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
}
