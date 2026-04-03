# Deployment Notes

## Local Development

Use the root scripts for an integrated local stack:

```bash
npm run dev:local
```

Before that, install dependencies in both workspaces:

```bash
npm install
cd server && npm install
```

Local environment files should live in `.env.local` for each app:

```bash
cp .env.example .env.local
cp server/.env server/.env.local
```

The frontend should read root `.env.local`, and the backend should read `server/.env.local`.

You also need Docker Desktop or an equivalent `docker compose` runtime for Postgres and Redis.

That command does three things:

1. Starts Postgres and Redis with Docker Compose.
2. Applies Prisma migrations and generates the Prisma client.
3. Starts the frontend and backend dev servers together.

If you want to run pieces separately:

```bash
npm run dev:infra
npm run dev:web
```

To stop the local containers:

```bash
npm run dev:infra:down
```

## End-to-End Tests

E2E runs assume Docker Compose Postgres and Redis are available on `5432` and `6379`.

Install browser binaries once:

```bash
npm run e2e:browsers
```

Run backend API E2E only:

```bash
npm run e2e:api
```

Run frontend browser E2E only:

```bash
npm run dev:infra
npm run e2e:web
```

Run the protected staging smoke flow:

```bash
npm run e2e:web:staging:setup
npm run e2e:web:staging
```

Staging smoke notes:

- `npm run e2e:web:staging:setup` opens a real browser and waits for you to finish the Vercel access flow manually.
- The saved Playwright storage state is written to `.playwright/staging-auth/storage-state.json` and reused by `npm run e2e:web:staging`.
- Override the target URL with `E2E_STAGING_BASE_URL` and the storage-state path with `PLAYWRIGHT_STORAGE_STATE` when needed.

Run real Google OAuth E2E setup once locally:

```bash
npm run dev:infra
npm run e2e:web:google:setup
```

Run the reusable Google OAuth verification suite:

```bash
npm run dev:infra
npm run e2e:web:google
```

Google OAuth E2E notes:

- It is intentionally separate from `npm run e2e:web` and `npm run e2e`.
- The first setup run is manual: complete the real Google login and any 2FA in the browser.
- The saved Playwright storage state is written under `.playwright/google-auth/` and is gitignored.
- If the saved session expires, rerun `npm run e2e:web:google:setup`.
- Both root `.env.local` and `server/.env.local` must contain the same Google client ID.

Run the full suite in order (`infra -> backend -> frontend`):

```bash
npm run e2e
```

E2E-specific environment behavior:

- `NODE_ENV=test` enables test-mode behavior in the backend.
- `E2E_AUTH_ENABLED=true` exposes `POST /auth/test/session` for test-only session issuance.
- Playwright starts the frontend and backend via `npm run dev:web` and points the frontend at `http://127.0.0.1:3001`.

The test auth endpoint is intended only for local/CI E2E runs and returns 404 outside test-enabled conditions.

## Unit Tests

Unit and E2E are split by runner and file pattern:

- Frontend unit: `src/**/*.test.ts(x)` via Vitest
- Server unit: `server/src/**/*.spec.ts` and `server/src/**/*.test.ts` via Jest
- Server E2E: `server/test/*.e2e-spec.ts`
- Frontend E2E: `tests/e2e/*` via Playwright

Run frontend unit tests:

```bash
npm test
```

Or explicitly:

```bash
npm run test:unit
```

Run server unit tests:

```bash
npm run test:unit:server
```

Run server E2E only:

```bash
npm run e2e:api
```

Run frontend browser E2E only:

```bash
npm run e2e:web
```

## Environment Variables

Frontend:

- `VITE_SITE_URL` - canonical URL for the deployed frontend
- `VITE_API_URL` - backend API base URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID used by the login button

Server:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret, at least 32 characters
- `FRONTEND_URL` - allowed CORS origin for the frontend
- `APP_URL` - backend public URL used by email and link generation
- `GOOGLE_CLIENT_ID` - same Google OAuth client ID used to verify login tokens
- `ADMIN_GOOGLE_EMAILS` - comma-separated Gmail list allowed to enter as admin
- `REDIS_HOST`, `REDIS_PORT` - queue/cache backend
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` - document storage
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - email delivery

If you deploy both apps together, keep the frontend and backend Google client IDs identical.

## Migration Flow

Local development:

```bash
cd server
npm run prisma:migrate
```

Production:

```bash
cd server
npx prisma migrate deploy
```

Recommended order:

1. Set environment variables in the deployment platform.
2. Run Prisma migrations on the server database.
3. Build and restart the server.
4. Build and deploy the frontend with the matching API and Google client IDs.

## Notes

- `admin` access is controlled by `ADMIN_GOOGLE_EMAILS`, not by a public form field.
- User and expert contacts are their Google Gmail addresses only.
- The new quote-sharing flow depends on the `QuoteShare` table and the `Developer.userId` link.
