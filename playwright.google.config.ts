import { defineConfig } from '@playwright/test';
import { GOOGLE_AUTH_STORAGE_STATE_PATH } from './tests/e2e-google/helpers/google-auth';

export default defineConfig({
  testDir: './tests/e2e-google',
  testMatch: /google-auth\.spec\.ts/,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  globalSetup: './tests/e2e-google/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    storageState: GOOGLE_AUTH_STORAGE_STATE_PATH,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev:web',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      PORT: '3001',
      BACKEND_PORT: '3001',
      FRONTEND_PORT: '5173',
      FRONTEND_URL: 'http://localhost:5173',
      VITE_API_URL: 'http://localhost:3001',
    },
  },
});
