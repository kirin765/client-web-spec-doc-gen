import { test, expect } from '../fixtures/test';

test('@smoke 고객이 견적을 저장하고 공유 후 채팅한다', async ({ browser, app }) => {
  const customerContext = await browser.newContext();
  const developerContext = await browser.newContext();

  const customerPage = await customerContext.newPage();
  const developerPage = await developerContext.newPage();

  try {
    const customerAuth = await app.loginAs(customerPage, 'customer', 'customer');
    const { projectName } = await app.createQuoteViaUI(customerPage, {
      projectName: `Smoke Quote ${Date.now()}`,
    });

    const projects = await app.listMyProjects(customerAuth.token);
    const project = projects.find((item) => item.projectName === projectName);
    expect(project).toBeTruthy();

    const developers = await app.listDevelopers();
    const developer = developers.find((item) => item.active);
    expect(developer).toBeTruthy();

    await customerPage.goto(`/experts/${developer!.id}`);
    await customerPage.getByTestId('project-request-select').selectOption(project!.id);
    await customerPage.getByTestId('send-quote-button').click();
    await expect(customerPage.getByText('견적서를 전문가에게 보냈습니다.')).toBeVisible();

    const sentShares = await app.listSentShares(customerAuth.token);
    const sentShare = sentShares.find((item) => item.projectRequestId === project!.id);
    expect(sentShare?.chatRoomId).toBeTruthy();

    await customerPage.goto(`/chat/${sentShare!.chatRoomId}`);
    await expect(
      customerPage
        .getByTestId('chat-message-list')
        .locator('span')
        .filter({ hasText: '고객이 견적 상담을 시작했습니다.' }),
    ).toBeVisible();

    const developerAuth = await app.loginAs(developerPage, 'developer', 'expert');
    await developerPage.goto(`/chat/${sentShare!.chatRoomId}`);
    await expect(
      developerPage
        .getByTestId('chat-message-list')
        .locator('span')
        .filter({ hasText: '고객이 견적 상담을 시작했습니다.' }),
    ).toBeVisible();

    await customerPage.getByTestId('chat-message-input').fill('고객 메시지입니다.');
    await customerPage.getByTestId('chat-send-button').click();
    await expect(
      developerPage.getByTestId('chat-message-list').getByText('고객 메시지입니다.'),
    ).toBeVisible({ timeout: 10000 });

    await developerPage.getByTestId('chat-message-input').fill('개발자 답변입니다.');
    await developerPage.getByTestId('chat-send-button').click();
    await expect(
      customerPage.getByTestId('chat-message-list').getByText('개발자 답변입니다.'),
    ).toBeVisible({ timeout: 10000 });

    const room = await app.getChatRoom(developerAuth.token, sentShare!.chatRoomId!);
    expect(room.id).toBe(sentShare!.chatRoomId);
  } finally {
    await customerContext.close();
    await developerContext.close();
  }
});
