process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@127.0.0.1:5432/spec_gen_dev?schema=e2e';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'e2e-test-secret-key-e2e-test-secret-key';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.REDIS_DB = process.env.REDIS_DB || '1';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:4173';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'e2e-google-client-id';
process.env.ADMIN_GOOGLE_EMAILS =
  process.env.ADMIN_GOOGLE_EMAILS || 'e2e-admin@example.com';
