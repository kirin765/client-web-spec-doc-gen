import type { INestApplication } from '@nestjs/common';
import request = require('supertest');
import type { Queue } from 'bullmq';
import { PrismaService } from '../src/common/db/prisma.service';
import { ProjectRequestsService } from '../src/modules/project-requests/project-requests.service';
import { cleanupDatabase, createE2EApp } from './e2e-test-utils';

const VALID_ANSWERS = {
  siteType: 'landing',
  projectName: 'E2E Landing Project',
  targetAudience: 'startup founders',
  contactMethod: 'kakao:e2e-contact',
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

describe('Auth and project requests E2E', () => {
  let app: INestApplication;
  let restoreEnv: () => void;

  beforeAll(async () => {
    const testApp = await createE2EApp();
    app = testApp.app;
    restoreEnv = testApp.restoreEnv;
  });

  afterAll(async () => {
    await app.close();
    restoreEnv();
  });

  beforeEach(async () => {
    const prisma = app.get(PrismaService);
    await cleanupDatabase(prisma);
  });

  async function issueSession(input: {
    email: string;
    role?: 'CLIENT' | 'DEVELOPER' | 'ADMIN';
    createCustomerProfile?: boolean;
    createDeveloperProfile?: boolean;
    developerActive?: boolean;
  }) {
    const response = await request(app.getHttpServer())
      .post('/auth/test/session')
      .send(input)
      .expect(201);

    return response.body as {
      token: string;
      user: {
        id: string;
        email: string;
        role: 'client' | 'admin';
        hasCustomerProfile: boolean;
        customerProfileId: string | null;
        hasExpertProfile: boolean;
        expertProfileId: string | null;
        hasDeveloperProfile: boolean;
        developerProfileId: string | null;
      };
    };
  }

  it('issues a test session when E2E auth is enabled', async () => {
    const response = await issueSession({
      email: 'customer-session@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });

    expect(response.token).toEqual(expect.any(String));
    expect(response.user.email).toBe('customer-session@e2e.local');
    expect(response.user.role).toBe('client');
    expect(response.user.hasCustomerProfile).toBe(true);
  });

  it('hides the test session endpoint when E2E auth is disabled', async () => {
    const disabledApp = await createE2EApp({
      NODE_ENV: 'development',
      E2E_AUTH_ENABLED: 'false',
    });

    try {
      await request(disabledApp.app.getHttpServer())
        .post('/auth/test/session')
        .send({ email: 'disabled@e2e.local' })
        .expect(404);
    } finally {
      await disabledApp.app.close();
      disabledApp.restoreEnv();
    }
  });

  it('rejects protected routes without authentication', async () => {
    await request(app.getHttpServer()).get('/customers/me/profile').expect(401);
  });

  it('returns the current session user and customer profile for authenticated users', async () => {
    const session = await issueSession({
      email: 'customer-profile@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(200);

    expect(me.body).toMatchObject({
      email: 'customer-profile@e2e.local',
      hasCustomerProfile: true,
      role: 'client',
    });

    const profile = await request(app.getHttpServer())
      .get('/customers/me/profile')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(200);

    expect(profile.body.displayName).toContain('customer');
  });

  it('creates a draft, updates answers, submits the request, and enqueues background jobs', async () => {
    const session = await issueSession({
      email: 'project-owner@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });

    const projectRequestsService = app.get(ProjectRequestsService) as any;
    const emailQueue = projectRequestsService['emailQueue'] as Queue;
    const pdfQueue = projectRequestsService['pdfQueue'] as Queue;
    const matchingQueue = projectRequestsService['matchingQueue'] as Queue;

    const emailAddSpy = jest.spyOn(emailQueue, 'add');
    const pdfAddSpy = jest.spyOn(pdfQueue, 'add');
    const matchingAddSpy = jest.spyOn(matchingQueue, 'add');

    const draft = await request(app.getHttpServer())
      .post('/project-requests/draft')
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        projectName: 'E2E Flow Project',
        siteType: 'landing',
      })
      .expect(201);

    const projectId = draft.body.id as string;

    await request(app.getHttpServer())
      .patch(`/project-requests/${projectId}/answers`)
      .set('Authorization', `Bearer ${session.token}`)
      .send({
        rawAnswers: {
          projectName: 'E2E Flow Project',
          expectedPages: 3,
        },
      })
      .expect(200);

    const submitted = await request(app.getHttpServer())
      .post(`/project-requests/${projectId}/submit`)
      .set('Authorization', `Bearer ${session.token}`)
      .send({ rawAnswers: VALID_ANSWERS })
      .expect(201);

    expect(submitted.body.status).toBe('SUBMITTED');
    expect(pdfAddSpy).toHaveBeenCalledWith('generate-pdf', { projectRequestId: projectId });
    expect(matchingAddSpy).toHaveBeenCalledWith('execute-matching', {
      projectRequestId: projectId,
      normalizedSpec: expect.objectContaining({
        projectType: 'landing',
      }),
    });
    expect(emailAddSpy).toHaveBeenCalledWith('quote-completed', { projectRequestId: projectId });

    const detail = await request(app.getHttpServer())
      .get(`/project-requests/${projectId}`)
      .set('Authorization', `Bearer ${session.token}`)
      .expect(200);

    expect(detail.body.id).toBe(projectId);
    expect(detail.body.status).toBe('SUBMITTED');

    const list = await request(app.getHttpServer())
      .get('/project-requests?pageSize=100&page=1')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(200);

    expect(list.body.total).toBe(1);

    emailAddSpy.mockRestore();
    pdfAddSpy.mockRestore();
    matchingAddSpy.mockRestore();
  });

  it('blocks users from reading other users project requests', async () => {
    const owner = await issueSession({
      email: 'owner@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });
    const outsider = await issueSession({
      email: 'outsider@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });

    const draft = await request(app.getHttpServer())
      .post('/project-requests/draft')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        projectName: 'Private Project',
        siteType: 'landing',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/project-requests/${draft.body.id}`)
      .set('Authorization', `Bearer ${outsider.token}`)
      .expect(403);
  });

  it('enforces admin-only routes', async () => {
    const customer = await issueSession({
      email: 'customer-admin-check@e2e.local',
      role: 'CLIENT',
      createCustomerProfile: true,
    });
    const admin = await issueSession({
      email: 'admin@e2e.local',
      role: 'ADMIN',
    });

    await request(app.getHttpServer())
      .get('/admin/projects')
      .set('Authorization', `Bearer ${customer.token}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/admin/projects')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  it('returns mapped public developer directory/detail data and supports faq and portfolio APIs', async () => {
    const expert = await issueSession({
      email: 'expert-directory@e2e.local',
      role: 'DEVELOPER',
      createDeveloperProfile: true,
      developerActive: true,
    });

    const faq = await request(app.getHttpServer())
      .post('/developers/me/faqs')
      .set('Authorization', `Bearer ${expert.token}`)
      .send({
        question: '주말에도 대응하나요?',
        answer: '사전 협의 시 가능합니다.',
        sortOrder: 1,
      })
      .expect(201);

    const portfolio = await request(app.getHttpServer())
      .post('/developers/me/portfolios')
      .set('Authorization', `Bearer ${expert.token}`)
      .send({
        description: '대표 포트폴리오',
        imageUrls: ['https://example.com/portfolio-cover.png'],
        sortOrder: 1,
      })
      .expect(201);

    const directory = await request(app.getHttpServer())
      .get('/developers')
      .expect(200);

    expect(directory.body).toHaveLength(1);
    expect(directory.body[0]).toMatchObject({
      id: expert.user.developerProfileId,
      displayName: expect.stringContaining('studio'),
      type: 'freelancer',
      availabilityStatus: 'available',
      faqCount: 1,
      reviewCount: 0,
      reviewAverage: 0,
      contactEmail: 'expert-directory@e2e.local',
    });
    expect(directory.body[0].portfolioPreview[0]).toMatchObject({
      id: portfolio.body.id,
      description: '대표 포트폴리오',
      imageCount: 1,
      previewImage: {
        storageUrl: 'https://example.com/portfolio-cover.png',
        url: 'https://example.com/portfolio-cover.png',
      },
    });

    const detail = await request(app.getHttpServer())
      .get(`/developers/${expert.user.developerProfileId}`)
      .expect(200);

    expect(detail.body.id).toBe(expert.user.developerProfileId);
    expect(detail.body.faqCount).toBe(1);

    const faqs = await request(app.getHttpServer())
      .get(`/developers/${expert.user.developerProfileId}/faqs`)
      .expect(200);

    expect(faqs.body).toEqual([
      expect.objectContaining({
        id: faq.body.id,
        question: '주말에도 대응하나요?',
      }),
    ]);

    const portfolios = await request(app.getHttpServer())
      .get(`/developers/${expert.user.developerProfileId}/portfolios`)
      .expect(200);

    expect(portfolios.body).toEqual([
      expect.objectContaining({
        id: portfolio.body.id,
        description: '대표 포트폴리오',
        imageUrls: [
          {
            storageUrl: 'https://example.com/portfolio-cover.png',
            url: 'https://example.com/portfolio-cover.png',
          },
        ],
      }),
    ]);
  });
});
