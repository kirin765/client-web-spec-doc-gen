import { INestApplication } from '@nestjs/common';
import { closeE2EApp, createE2EApp, loginAs } from './e2e-app';
import { TEST_USER_FIXTURES } from './e2e-test-data';

describe('Chat room access (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await closeE2EApp(app);
  });

  it('allows participants and rejects outsiders', async () => {
    const created = await createE2EApp({ e2eTestMode: true });
    app = created.app;

    const customer = await loginAs(created.http, 'customer');
    const developer = await loginAs(created.http, 'developer');
    const admin = await loginAs(created.http, 'admin');

    const seededDeveloper = await created.prisma.developer.findFirstOrThrow({
      where: {
        user: {
          email: TEST_USER_FIXTURES.developer.email,
        },
      },
    });

    const draftResponse = await created.http
      .post('/project-requests/draft')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        projectName: `E2E Access ${Date.now()}`,
        siteType: 'landing',
      })
      .expect(201);

    await created.http
      .post(`/project-requests/${draftResponse.body.id}/submit`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        rawAnswers: {
          siteType: 'landing',
          projectName: draftResponse.body.projectName ?? `E2E Access ${Date.now()}`,
          targetAudience: 'Prospects',
          contactMethod: 'kakao',
          expectedPages: 5,
          requiredPages: ['home', 'contact'],
          coreFeatures: ['contactForm', 'chat'],
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

    const roomId = shareResponse.body.chatRoomId as string;

    await created.http
      .get(`/chat/rooms/${roomId}`)
      .set('Authorization', `Bearer ${developer.token}`)
      .expect(200);

    await created.http
      .get(`/chat/rooms/${roomId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(403);

    await created.http
      .patch(`/quote-shares/${shareResponse.body.id}/cancel`)
      .set('Authorization', `Bearer ${customer.token}`)
      .expect(200);

    await created.http
      .post(`/chat/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ body: '더 보낼 수 없어야 합니다.' })
      .expect(400);
  });
});
