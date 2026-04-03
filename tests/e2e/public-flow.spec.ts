import { expect, test } from '@playwright/test';

test('public quote flow reaches the result page', async ({ page }) => {
  const answers = {
    siteType: 'landing',
    projectName: '플레이라이트 공개 플로우',
    targetAudience: '초기 스타트업 고객',
    contactMethod: 'kakao:public-flow',
    expectedPages: 5,
    coreFeatures: ['contactForm'],
    designComplexity: 'template',
    responsiveTargets: ['mobile', 'desktop'],
    designStyle: 'minimal',
    contentDelivery: 'clientProvides',
    hosting: 'agencyManaged',
    desiredTimeline: 'standard',
    budgetAwareness: 'notSure',
  };

  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: '웹 프로젝트 견적, 5분이면 충분합니다' }),
  ).toBeVisible();

  await page.getByRole('button', { name: '무료 견적 시작하기' }).first().click();
  await expect(page).toHaveURL(/\/wizard$/);
  await expect(page.getByRole('heading', { name: '프로젝트 기본 정보' })).toBeVisible();

  await page.evaluate((persistedAnswers) => {
    window.localStorage.setItem(
      'quote-store',
      JSON.stringify({
        state: {
          currentStep: 5,
          answers: persistedAnswers,
        },
        version: 0,
      }),
    );
  }, answers);

  await page.goto('/result');

  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole('heading', { name: '견적이 준비되었습니다!' })).toBeVisible();
  await expect(page.getByRole('button', { name: '비용 요약' })).toBeVisible();
  await expect(page.getByRole('button', { name: '명세서 미리보기' })).toBeVisible();
  await expect(page.getByRole('button', { name: '개발자 매칭' })).toBeVisible();

  await page.getByRole('button', { name: '명세서 미리보기' }).click();
  await expect(page.getByText('프로젝트 개요')).toBeVisible();

  await page.getByRole('button', { name: '개발자 매칭' }).click();
  await expect(page.getByText('프로젝트 조건에 맞는 추천 개발자')).toBeVisible();
});
