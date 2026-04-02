import { expect, test } from '@playwright/test';
import {
  assertGoogleOAuthConfigured,
  clickGoogleSignInButton,
  ensureGoogleAuthDir,
  GOOGLE_AUTH_STORAGE_STATE_PATH,
} from './helpers/google-auth';

test('captures a reusable Google OAuth storage state', async ({ page, context }) => {
  await assertGoogleOAuthConfigured();
  await ensureGoogleAuthDir();

  test.setTimeout(10 * 60_000);

  await page.goto('/');

  await clickGoogleSignInButton(page);
  console.log(
    'Google OAuth setup is waiting for manual completion. Finish the Google login and any 2FA in the opened window.',
  );

  await page.waitForURL('**/mypage', { timeout: 10 * 60_000 });
  await expect(page.getByText(/고객 마이페이지|전문가 마이페이지/)).toBeVisible({
    timeout: 120_000,
  });

  const authStore = await page.evaluate(() => window.localStorage.getItem('auth-store'));
  if (!authStore) {
    throw new Error(
      'Google 로그인 이후 auth-store가 저장되지 않았습니다. /auth/google 응답과 프런트 세션 저장 로직을 확인하세요.',
    );
  }

  await context.storageState({ path: GOOGLE_AUTH_STORAGE_STATE_PATH });
  console.log(`Saved Google OAuth storage state to ${GOOGLE_AUTH_STORAGE_STATE_PATH}`);
});
