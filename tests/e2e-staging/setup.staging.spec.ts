import { expect, test } from '@playwright/test';
import {
  DEFAULT_STAGING_BASE_URL,
  ensureStagingAuthDir,
  STAGING_AUTH_STORAGE_STATE_PATH,
} from './helpers/staging-auth';

test('captures reusable auth storage state for staging', async ({ page, context }) => {
  test.setTimeout(10 * 60_000);

  await ensureStagingAuthDir();
  await page.goto('/');

  console.log(
    `Manual authentication is required. Complete the Vercel access flow in the opened browser for ${DEFAULT_STAGING_BASE_URL}.`,
  );

  await page.waitForURL(
    (url) => url.toString().startsWith(DEFAULT_STAGING_BASE_URL),
    { timeout: 10 * 60_000 },
  );
  await expect(page.locator('body')).toBeVisible({ timeout: 120_000 });

  await context.storageState({ path: STAGING_AUTH_STORAGE_STATE_PATH });
  console.log(`Saved staging storage state to ${STAGING_AUTH_STORAGE_STATE_PATH}`);
});
