import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e-google',
  testMatch: /setup\.google\.spec\.ts/,
  timeout: 10 * 60_000,
  fullyParallel: false,
  workers: 1,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false,
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
