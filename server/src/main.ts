// [수정 필요 - L1] @nestjs/swagger 의존성이 존재하지만 Swagger 설정이 누락됨
// - package.json에 @nestjs/swagger가 포함되어 있으나 bootstrap()에서 SwaggerModule.setup() 호출이 없음
// - API 문서 자동 생성을 위해 SwaggerModule.createDocument() 및 SwaggerModule.setup() 추가 필요
// - 또는 swagger를 사용하지 않을 경우 의존성 제거 검토

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('port') || 3001;
  const host = '0.0.0.0';
  const frontendUrl = configService.get<string>('frontendUrl') || 'http://localhost:5173';

  // Enable CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Health check endpoint
  const express = app.getHttpAdapter().getInstance();
  express.get('/health', (req: any, res: any) => res.json({ status: 'ok' }));

  await app.listen(port, host);
  console.log(`Server running on ${host}:${port}`);
}

bootstrap();
