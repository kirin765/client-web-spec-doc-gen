import { INestApplication } from '@nestjs/common';
import { closeE2EApp, createE2EApp, loginAs } from './e2e-app';
import { TEST_USER_FIXTURES } from './e2e-test-data';

describe('Quote share status transitions (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await closeE2EApp(app);
  });

  it('moves from sent to in_progress to completed and records system messages', async () => {
    const created = await createE2EApp({ e2eTestMode: true });
    app = created.app;

    const customer = await loginAs(created.http, 'customer');
    const developer = await loginAs(created.http, 'developer');

    const seededDeveloper = await created.prisma.developer.findFirstOrThrow({
      where: {
        user: {
          email: TEST_USER_FIXTURES.developer.email,
        },
      },
    });

    const projectName = `E2E Lifecycle ${Date.now()}`;

    const draftResponse = await created.http
      .post('/project-requests/draft')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        projectName,
        siteType: 'webapp',
      })
      .expect(201);

    await created.http
      .post(`/project-requests/${draftResponse.body.id}/submit`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        rawAnswers: {
          siteType: 'webapp',
          projectName,
          targetAudience: 'Teams',
          contactMethod: 'email',
          expectedPages: 8,
          requiredPages: ['home', 'dashboard', 'contact'],
          coreFeatures: ['auth', 'chat'],
          urgency: 'standard',
        },
      })
      .expect(201);

    const shareResponse = await created.http
      .post('/quote-shares')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        projectRequestId: draftResponse.body.id,
        developerId: seededDeveloper.id,
      })
      .expect(201);

    const shareId = shareResponse.body.id as string;
    const roomId = shareResponse.body.chatRoomId as string;

    const approved = await created.http
      .patch(`/quote-shares/${shareId}/approve`)
      .set('Authorization', `Bearer ${developer.token}`)
      .expect(200);

    expect(approved.body.status).toBe('in_progress');

    const completed = await created.http
      .patch(`/quote-shares/${shareId}/complete`)
      .set('Authorization', `Bearer ${developer.token}`)
      .expect(200);

    expect(completed.body.status).toBe('completed');
    expect(completed.body.canReview).toBe(false);
    expect(completed.body.canOpenContact).toBe(true);

    const detail = await created.http
      .get(`/quote-shares/${shareId}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .expect(200);

    expect(detail.body.status).toBe('completed');
    expect(detail.body.canReview).toBe(true);

    const messages = await created.http
      .get(`/chat/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${customer.token}`)
      .expect(200);

    const bodies = messages.body.data.map((message: { body: string }) => message.body);
    expect(bodies).toContain('고객이 견적 상담을 시작했습니다.');
    expect(bodies).toContain('개발자가 상담 진행을 수락했습니다.');
    expect(bodies).toContain('개발자가 상담을 완료 처리했습니다.');
  });
});
