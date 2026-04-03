import { expect, test } from '@playwright/test';

test('stored Google OAuth session can open my page', async ({ page }) => {
  const meResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/auth/me');
  });

  await page.goto('/mypage');

  const meResponse = await meResponsePromise;
  expect(meResponse.ok()).toBeTruthy();

  await expect(page).toHaveURL(/\/mypage$/);
  await expect(page.getByText(/고객 마이페이지|전문가 마이페이지/)).toBeVisible();

  const authStore = await page.evaluate(() => {
    const raw = window.localStorage.getItem('auth-store');
    return raw ? JSON.parse(raw) : null;
  });

  expect(authStore?.state?.token).toEqual(expect.any(String));
  expect(authStore?.state?.user?.email).toEqual(expect.any(String));
});
