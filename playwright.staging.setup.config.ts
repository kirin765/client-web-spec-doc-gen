import { defineConfig } from '@playwright/test';
import { DEFAULT_STAGING_BASE_URL } from './tests/e2e-staging/helpers/staging-auth';

export default defineConfig({
  testDir: './tests/e2e-staging',
  testMatch: /setup\.staging\.spec\.ts/,
  timeout: 10 * 60_000,
  fullyParallel: false,
  workers: 1,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: DEFAULT_STAGING_BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false,
  },
});
