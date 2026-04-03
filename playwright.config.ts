import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev:web:e2e',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      E2E_AUTH_ENABLED: 'true',
      PORT: '3101',
      BACKEND_PORT: '3101',
      FRONTEND_PORT: '4173',
      FRONTEND_URL: 'http://127.0.0.1:4173',
      VITE_API_URL: 'http://127.0.0.1:3101',
      VITE_GOOGLE_CLIENT_ID: 'playwright-e2e-client',
    },
  },
});
