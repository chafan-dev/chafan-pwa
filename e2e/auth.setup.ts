import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { loginViaUi } from './helpers/login';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate test account', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'E2E_EMAIL and E2E_PASSWORD must be set (see e2e/env.e2e.example → copy to env.e2e)'
    );
  }

  await loginViaUi(page, email, password);

  // Token is stored under chafan:token
  const token = await page.evaluate(() => localStorage.getItem('chafan:token'));
  expect(token, 'expected chafan:token after login').toBeTruthy();

  await page.context().storageState({ path: authFile });
});
