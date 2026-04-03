// [수정 필요 - H4] APP_URL 환경 변수가 스키마에 누락됨
// - NotificationsService에서 APP_URL을 사용하지만 configSchema에 정의되어 있지 않음
// - APP_URL: z.string().url().optional() 추가 및 반환 객체에 appUrl 필드 추가 필요
//
// [수정 필요 - M17] SMTP 비밀번호 환경 변수명 불일치
// - 이 파일과 .env.example에서는 SMTP_PASS를 사용
// - email.processor.ts에서는 SMTP_PASSWORD를 사용하여 값을 읽지 못함
// - SMTP_PASS 또는 SMTP_PASSWORD 중 하나로 통일해야 함

import { z } from 'zod';

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return value;
}, z.boolean());

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('24h'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  APP_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_GOOGLE_EMAILS: z.string().optional(),
  E2E_AUTH_ENABLED: booleanFromEnv.default(false),
  E2E_TEST_MODE: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value === 'true'),
});

export type Config = z.infer<typeof configSchema>;

export default () => {
  const env = process.env;
  const validated = configSchema.parse(env);

  return {
    nodeEnv: validated.NODE_ENV,
    port: validated.PORT,
    database: {
      url: validated.DATABASE_URL,
    },
    jwt: {
      secret: validated.JWT_SECRET,
      expiresIn: validated.JWT_EXPIRY,
    },
    redis: {
      host: validated.REDIS_HOST,
      port: validated.REDIS_PORT,
      db: validated.REDIS_DB,
    },
    aws: {
      region: validated.AWS_REGION,
      accessKeyId: validated.AWS_ACCESS_KEY_ID,
      secretAccessKey: validated.AWS_SECRET_ACCESS_KEY,
      s3Bucket: validated.AWS_S3_BUCKET,
    },
    smtp: {
      host: validated.SMTP_HOST,
      port: validated.SMTP_PORT,
      user: validated.SMTP_USER,
      pass: validated.SMTP_PASS,
      from: validated.SMTP_FROM,
    },
    frontendUrl: validated.FRONTEND_URL,
    appUrl: validated.APP_URL,
    googleClientId: validated.GOOGLE_CLIENT_ID,
    adminGoogleEmails: validated.ADMIN_GOOGLE_EMAILS,
    e2eAuthEnabled: validated.E2E_AUTH_ENABLED,
    e2eTestMode: validated.E2E_TEST_MODE ?? false,
  };
};
