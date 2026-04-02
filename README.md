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
