import { PrismaClient } from '@prisma/client';

export const TEST_USER_FIXTURES = {
  customer: {
    email: 'e2e-customer@example.com',
    name: 'E2E Customer',
    role: 'CLIENT' as const,
  },
  developer: {
    email: 'e2e-developer@example.com',
    name: 'E2E Developer',
    role: 'CLIENT' as const,
  },
  admin: {
    email: 'e2e-admin@example.com',
    name: 'E2E Admin',
    role: 'ADMIN' as const,
  },
};

export async function seedE2ETestData(prisma: PrismaClient) {
  const customerUser = await prisma.user.upsert({
    where: { email: TEST_USER_FIXTURES.customer.email },
    update: {
      name: TEST_USER_FIXTURES.customer.name,
      role: TEST_USER_FIXTURES.customer.role,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: TEST_USER_FIXTURES.customer.email,
      name: TEST_USER_FIXTURES.customer.name,
      role: TEST_USER_FIXTURES.customer.role,
      emailVerifiedAt: new Date(),
    },
  });

  const developerUser = await prisma.user.upsert({
    where: { email: TEST_USER_FIXTURES.developer.email },
    update: {
      name: TEST_USER_FIXTURES.developer.name,
      role: TEST_USER_FIXTURES.developer.role,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: TEST_USER_FIXTURES.developer.email,
      name: TEST_USER_FIXTURES.developer.name,
      role: TEST_USER_FIXTURES.developer.role,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: TEST_USER_FIXTURES.admin.email },
    update: {
      name: TEST_USER_FIXTURES.admin.name,
      role: TEST_USER_FIXTURES.admin.role,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: TEST_USER_FIXTURES.admin.email,
      name: TEST_USER_FIXTURES.admin.name,
      role: TEST_USER_FIXTURES.admin.role,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {
      displayName: 'E2E Customer',
      introduction: 'Customer profile for end-to-end testing',
    },
    create: {
      userId: customerUser.id,
      displayName: 'E2E Customer',
      introduction: 'Customer profile for end-to-end testing',
    },
  });

  await prisma.developer.upsert({
    where: { userId: developerUser.id },
    update: {
      displayName: 'E2E Developer Studio',
      headline: 'E2E approved developer profile',
      introduction: 'Developer profile seeded for browser E2E',
      type: 'FREELANCER',
      skills: ['React', 'NestJS'],
      specialties: ['Landing', 'Chat'],
      supportedProjectTypes: ['landing', 'brochure', 'webapp'],
      supportedCoreFeatures: ['contactForm', 'chat', 'auth'],
      supportedEcommerceFeatures: [],
      supportedDesignStyles: ['minimal', 'corporate'],
      supportedDesignComplexities: ['template', 'custom'],
      supportedTimelines: ['flexible', 'standard', 'urgent'],
      budgetMin: 500000,
      budgetMax: 10000000,
      availabilityStatus: 'AVAILABLE',
      avgResponseHours: 2,
      portfolioLinks: [],
      regions: ['KR'],
      languages: ['ko', 'en'],
      active: true,
    },
    create: {
      userId: developerUser.id,
      displayName: 'E2E Developer Studio',
      headline: 'E2E approved developer profile',
      introduction: 'Developer profile seeded for browser E2E',
      type: 'FREELANCER',
      skills: ['React', 'NestJS'],
      specialties: ['Landing', 'Chat'],
      supportedProjectTypes: ['landing', 'brochure', 'webapp'],
      supportedCoreFeatures: ['contactForm', 'chat', 'auth'],
      supportedEcommerceFeatures: [],
      supportedDesignStyles: ['minimal', 'corporate'],
      supportedDesignComplexities: ['template', 'custom'],
      supportedTimelines: ['flexible', 'standard', 'urgent'],
      budgetMin: 500000,
      budgetMax: 10000000,
      availabilityStatus: 'AVAILABLE',
      avgResponseHours: 2,
      portfolioLinks: [],
      regions: ['KR'],
      languages: ['ko', 'en'],
      active: true,
    },
  });

  await prisma.pricingRuleVersion.upsert({
    where: { version: 'e2e-v1' },
    update: {
      effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
      rules: {
        baseTiers: {},
        featureAdditions: {},
        designMultipliers: {},
        timelineMultipliers: {},
        integrationCosts: {},
      },
    },
    create: {
      version: 'e2e-v1',
      effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
      rules: {
        baseTiers: {},
        featureAdditions: {},
        designMultipliers: {},
        timelineMultipliers: {},
        integrationCosts: {},
      },
    },
  });
}
