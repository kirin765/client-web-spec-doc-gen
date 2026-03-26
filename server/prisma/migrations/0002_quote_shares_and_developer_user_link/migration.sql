DO $$
BEGIN
  CREATE TYPE "QuoteShareStatus" AS ENUM (
    'SENT',
    'APPROVED',
    'CANCELED_BY_USER',
    'CANCELED_BY_DEVELOPER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "QuoteShareCanceledBy" AS ENUM ('USER', 'DEVELOPER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "developers"
  ADD COLUMN IF NOT EXISTS "user_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "developers_user_id_key" ON "developers"("user_id");

CREATE TABLE IF NOT EXISTS "quote_shares" (
  "id" TEXT NOT NULL,
  "project_request_id" TEXT NOT NULL,
  "developer_id" TEXT NOT NULL,
  "status" "QuoteShareStatus" NOT NULL DEFAULT 'SENT',
  "approved_at" TIMESTAMP(3),
  "canceled_at" TIMESTAMP(3),
  "canceled_by" "QuoteShareCanceledBy",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quote_shares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quote_shares_project_request_id_developer_id_key"
  ON "quote_shares"("project_request_id", "developer_id");
CREATE INDEX IF NOT EXISTS "quote_shares_project_request_id_status_idx"
  ON "quote_shares"("project_request_id", "status");
CREATE INDEX IF NOT EXISTS "quote_shares_developer_id_status_idx"
  ON "quote_shares"("developer_id", "status");

DO $$
BEGIN
  ALTER TABLE "developers"
    ADD CONSTRAINT "developers_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "quote_shares"
    ADD CONSTRAINT "quote_shares_project_request_id_fkey"
    FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "quote_shares"
    ADD CONSTRAINT "quote_shares_developer_id_fkey"
    FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
