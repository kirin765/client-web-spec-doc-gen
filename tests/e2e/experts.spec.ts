import { expect, test } from '@playwright/test';
import { createTestSession } from './helpers/session';

test('public experts directory loads active experts', async ({ page }) => {
  const expert = await createTestSession({
    email: 'playwright-experts-public@e2e.local',
    role: 'DEVELOPER',
    createDeveloperProfile: true,
    developerActive: true,
  });

  await page.goto('/experts');

  await expect(page.getByRole('heading', { name: '전문가 목록' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: new RegExp(expert.user.email.split('@')[0], 'i') }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '상세 보기' }).first()).toBeVisible();
});
