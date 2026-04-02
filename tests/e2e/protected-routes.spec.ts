import { expect, test } from '@playwright/test';
import { applyAuthStorage, createTestSession } from './helpers/session';

test('customer session can open customer my page', async ({ page }) => {
  const session = await createTestSession({
    email: 'playwright-customer@e2e.local',
    role: 'CLIENT',
    createCustomerProfile: true,
  });

  await applyAuthStorage(page, session, 'customer');
  await page.goto('/mypage');

  await expect(page.getByText('고객 마이페이지')).toBeVisible();
  await expect(page.getByRole('heading', { name: '프로필과 내 견적 흐름 관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '고객 프로필' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '작성한 견적 리스트' })).toBeVisible();
});

test('expert session can open expert my page', async ({ page }) => {
  const session = await createTestSession({
    email: 'playwright-expert@e2e.local',
    role: 'DEVELOPER',
    createDeveloperProfile: true,
    developerActive: true,
  });

  await applyAuthStorage(page, session, 'expert');
  await page.goto('/mypage');

  await expect(page.getByText('전문가 마이페이지')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '프로필, FAQ, 포트폴리오와 받은 견적 관리' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '전문가 프로필' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'FAQ 관리' })).toBeVisible();
});

test('legacy developer workspace route redirects to my page', async ({ page }) => {
  const session = await createTestSession({
    email: 'playwright-expert-alias@e2e.local',
    role: 'DEVELOPER',
    createDeveloperProfile: true,
    developerActive: true,
  });

  await applyAuthStorage(page, session, 'expert');
  await page.goto('/developers/workspace');

  await expect(page).toHaveURL(/\/mypage$/);
  await expect(page.getByText('전문가 마이페이지')).toBeVisible();
});
