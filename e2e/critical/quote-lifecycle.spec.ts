import { test, expect } from '../fixtures/test';

test('고객과 개발자가 상태 전이를 완료하고 고객이 리뷰 가능 상태를 확인한다', async ({
  browser,
  app,
}) => {
  const customerContext = await browser.newContext();
  const developerContext = await browser.newContext();

  const customerPage = await customerContext.newPage();
  const developerPage = await developerContext.newPage();

  try {
    const customerAuth = await app.loginAs(customerPage, 'customer', 'customer');
    const { projectName } = await app.createQuoteViaUI(customerPage, {
      projectName: `Lifecycle Quote ${Date.now()}`,
      siteType: 'webapp',
    });

    const project = (await app.listMyProjects(customerAuth.token)).find(
      (item) => item.projectName === projectName,
    );
    expect(project).toBeTruthy();

    const developer = (await app.listDevelopers()).find((item) => item.active);
    expect(developer).toBeTruthy();

    await customerPage.goto(`/experts/${developer!.id}`);
    await customerPage.getByTestId('project-request-select').selectOption(project!.id);
    await customerPage.getByTestId('send-quote-button').click();
    await expect(customerPage.getByText('견적서를 전문가에게 보냈습니다.')).toBeVisible();

    const share = (await app.listSentShares(customerAuth.token)).find(
      (item) => item.projectRequestId === project!.id,
    );
    expect(share).toBeTruthy();

    await app.loginAs(developerPage, 'developer', 'expert');
    await developerPage.goto('/mypage');
    await expect(developerPage.getByTestId(`inbox-quote-share-${share!.id}`)).toBeVisible();

    await developerPage.getByTestId(`start-quote-share-${share!.id}`).click();
    await expect(developerPage.getByText('진행 중')).toBeVisible({ timeout: 10000 });

    await developerPage.goto(`/chat/${share!.chatRoomId}`);
    await expect(
      developerPage
        .getByTestId('chat-message-list')
        .locator('span')
        .filter({ hasText: '개발자가 상담 진행을 수락했습니다.' }),
    ).toBeVisible({ timeout: 10000 });

    await developerPage.goto('/mypage');
    await developerPage.getByTestId(`complete-quote-share-${share!.id}`).click();
    await expect(
      developerPage
        .getByTestId(`inbox-quote-share-${share!.id}`)
        .getByText('상태: 완료'),
    ).toBeVisible({ timeout: 10000 });

    await customerPage.goto('/mypage');
    await expect(
      customerPage.getByText('완료된 견적입니다. 리뷰를 남겨주세요.'),
    ).toBeVisible({ timeout: 10000 });

    await customerPage.goto(`/chat/${share!.chatRoomId}`);
    await expect(
      customerPage
        .getByTestId('chat-message-list')
        .locator('span')
        .filter({ hasText: '개발자가 상담을 완료 처리했습니다.' }),
    ).toBeVisible({ timeout: 10000 });
  } finally {
    await customerContext.close();
    await developerContext.close();
  }
});
