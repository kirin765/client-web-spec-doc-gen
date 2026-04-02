import { defineConfig, devices } from '@playwright/test';

const webBaseUrl = process.env.E2E_WEB_BASE_URL?.trim() || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
