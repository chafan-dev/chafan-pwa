import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

// Load secrets from repo-root env.e2e (gitignored)
dotenv.config({ path: path.resolve(__dirname, '../env.e2e') });

const baseURL = process.env.BASE_URL || 'https://preview.cha.fan';

export default defineConfig({
  testDir: path.join(__dirname, 'journeys'),
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.resolve(__dirname, '../playwright-report') }],
  ],
  outputDir: path.resolve(__dirname, '../test-results'),
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    // Avoid stale PWA shells after deploys
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: __dirname,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
      dependencies: ['setup'],
      testIgnore: /00-public/,
    },
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /00-public/,
    },
  ],
});
