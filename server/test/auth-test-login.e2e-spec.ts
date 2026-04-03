import { INestApplication } from '@nestjs/common';
import { closeE2EApp, createE2EApp } from './e2e-app';

describe('Auth test login (e2e)', () => {
  let app: INestApplication | null = null;

  afterEach(async () => {
    if (app) {
      await closeE2EApp(app);
      app = null;
    }
  });

  it('returns a seeded session in test mode', async () => {
    const created = await createE2EApp({ e2eTestMode: true });
    app = created.app;

    const response = await created.http
      .post('/auth/test-login')
      .send({ userKey: 'customer' })
      .expect(201);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('e2e-customer@example.com');
    expect(response.body.user.hasCustomerProfile).toBe(true);
  });

  it('blocks the endpoint outside test mode', async () => {
    const created = await createE2EApp({ e2eTestMode: false });
    app = created.app;

    await created.http
      .post('/auth/test-login')
      .send({ userKey: 'customer' })
      .expect(401);
  });
});
