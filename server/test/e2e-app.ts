import './e2e-env';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/common/db/prisma.service';
import { seedE2ETestData } from './e2e-test-data';

export async function createE2EApp(options?: { e2eTestMode?: boolean }) {
  process.env.E2E_TEST_MODE = options?.e2eTestMode === false ? 'false' : 'true';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  const prisma = app.get(PrismaService);
  await seedE2ETestData(prisma as unknown as PrismaClient);

  return {
    app,
    prisma,
    http: request(app.getHttpServer()),
  };
}

export async function closeE2EApp(app: INestApplication) {
  if (app) {
    await app.close();
  }
}

export async function loginAs(
  http: ReturnType<typeof request>,
  userKey: 'customer' | 'developer' | 'admin',
) {
  const response = await http.post('/auth/test-login').send({ userKey }).expect(201);
  return response.body as {
    token: string;
    user: {
      id: string;
      email: string;
    };
  };
}
