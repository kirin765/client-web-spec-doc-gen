import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/db/prisma.service';

const ENV_KEYS = [
  'NODE_ENV',
  'E2E_AUTH_ENABLED',
  'JWT_SECRET',
  'JWT_EXPIRY',
  'DATABASE_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'FRONTEND_URL',
  'APP_URL',
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

export async function createE2EApp(
  overrides: Partial<Record<EnvKey, string>> = {},
): Promise<{ app: INestApplication; prisma: PrismaService; restoreEnv: () => void }> {
  const previousEnv = new Map<EnvKey, string | undefined>();

  for (const key of ENV_KEYS) {
    previousEnv.set(key, process.env[key]);
  }

  process.env.NODE_ENV = overrides.NODE_ENV ?? process.env.NODE_ENV ?? 'test';
  process.env.E2E_AUTH_ENABLED =
    overrides.E2E_AUTH_ENABLED ?? process.env.E2E_AUTH_ENABLED ?? 'true';
  process.env.JWT_SECRET =
    overrides.JWT_SECRET ??
    process.env.JWT_SECRET ??
    'e2e-test-secret-key-that-is-long-enough';
  process.env.JWT_EXPIRY = overrides.JWT_EXPIRY ?? process.env.JWT_EXPIRY ?? '24h';
  process.env.FRONTEND_URL =
    overrides.FRONTEND_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173';
  process.env.APP_URL = overrides.APP_URL ?? process.env.APP_URL ?? 'http://localhost:3001';

  if (overrides.DATABASE_URL) {
    process.env.DATABASE_URL = overrides.DATABASE_URL;
  }

  if (overrides.REDIS_HOST) {
    process.env.REDIS_HOST = overrides.REDIS_HOST;
  }

  if (overrides.REDIS_PORT) {
    process.env.REDIS_PORT = overrides.REDIS_PORT;
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
    restoreEnv: () => {
      for (const key of ENV_KEYS) {
        const value = previousEnv.get(key);
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    },
  };
}

export async function cleanupDatabase(prisma: PrismaService) {
  await prisma.review.deleteMany();
  await prisma.quoteShare.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.requirementDocument.deleteMany();
  await prisma.expertFaq.deleteMany();
  await prisma.expertPortfolio.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.projectRequest.deleteMany();
  await prisma.magicLinkToken.deleteMany();
  await prisma.pricingRuleVersion.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@e2e.local',
      },
    },
  });
}
