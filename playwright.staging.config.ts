import { defineConfig } from '@playwright/test';
import {
  DEFAULT_STAGING_BASE_URL,
  assertStagingStorageStateExists,
  resolveStagingStorageState,
} from './tests/e2e-staging/helpers/staging-auth';

assertStagingStorageStateExists();

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /public-flow\.spec\.ts/,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: DEFAULT_STAGING_BASE_URL,
    storageState: resolveStagingStorageState(),
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
