ALTER TABLE "project_requests"
  ADD COLUMN IF NOT EXISTS "contact_method" TEXT;

ALTER TABLE "developers"
  ADD COLUMN IF NOT EXISTS "region_code" TEXT;

CREATE INDEX IF NOT EXISTS "developers_region_code_idx"
  ON "developers"("region_code");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quote_shares'
      AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE "quote_shares" RENAME COLUMN "approved_at" TO "started_at";
  END IF;
END $$;

ALTER TABLE "quote_shares"
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'QuoteShareStatus'
      AND e.enumlabel = 'APPROVED'
  ) THEN
    DROP TYPE IF EXISTS "QuoteShareStatus_new";
    CREATE TYPE "QuoteShareStatus_new" AS ENUM (
      'SENT',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELED_BY_USER',
      'CANCELED_BY_DEVELOPER'
    );

    ALTER TABLE "quote_shares" ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "quote_shares"
      ALTER COLUMN "status" TYPE "QuoteShareStatus_new"
      USING (
        CASE
          WHEN "status"::text = 'APPROVED' THEN 'IN_PROGRESS'
          ELSE "status"::text
        END
      )::"QuoteShareStatus_new";

    DROP TYPE "QuoteShareStatus";
    ALTER TYPE "QuoteShareStatus_new" RENAME TO "QuoteShareStatus";
  END IF;
END $$;

ALTER TABLE "quote_shares"
  ALTER COLUMN "status" SET DEFAULT 'SENT';

CREATE TABLE IF NOT EXISTS "regions" (
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "depth" INTEGER NOT NULL,
  "parent_code" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "regions_pkey" PRIMARY KEY ("code")
);

CREATE INDEX IF NOT EXISTS "regions_depth_sort_order_idx"
  ON "regions"("depth", "sort_order");

CREATE INDEX IF NOT EXISTS "regions_parent_code_sort_order_idx"
  ON "regions"("parent_code", "sort_order");

CREATE TABLE IF NOT EXISTS "customer_profiles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "introduction" TEXT,
  "region_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_profiles_user_id_key"
  ON "customer_profiles"("user_id");

CREATE INDEX IF NOT EXISTS "customer_profiles_region_code_idx"
  ON "customer_profiles"("region_code");

CREATE TABLE IF NOT EXISTS "expert_faqs" (
  "id" TEXT NOT NULL,
  "developer_id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "expert_faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "expert_faqs_developer_id_sort_order_idx"
  ON "expert_faqs"("developer_id", "sort_order");

CREATE TABLE IF NOT EXISTS "expert_portfolios" (
  "id" TEXT NOT NULL,
  "developer_id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "image_urls" JSONB NOT NULL DEFAULT '[]',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "expert_portfolios_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "expert_portfolios_developer_id_sort_order_idx"
  ON "expert_portfolios"("developer_id", "sort_order");

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" TEXT NOT NULL,
  "quote_share_id" TEXT NOT NULL,
  "developer_id" TEXT NOT NULL,
  "customer_user_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_quote_share_id_key"
  ON "reviews"("quote_share_id");

CREATE INDEX IF NOT EXISTS "reviews_developer_id_created_at_idx"
  ON "reviews"("developer_id", "created_at");

CREATE INDEX IF NOT EXISTS "reviews_customer_user_id_idx"
  ON "reviews"("customer_user_id");

DO $$
BEGIN
  ALTER TABLE "regions"
    ADD CONSTRAINT "regions_parent_code_fkey"
    FOREIGN KEY ("parent_code") REFERENCES "regions"("code")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "developers"
    ADD CONSTRAINT "developers_region_code_fkey"
    FOREIGN KEY ("region_code") REFERENCES "regions"("code")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "customer_profiles"
    ADD CONSTRAINT "customer_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "customer_profiles"
    ADD CONSTRAINT "customer_profiles_region_code_fkey"
    FOREIGN KEY ("region_code") REFERENCES "regions"("code")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "expert_faqs"
    ADD CONSTRAINT "expert_faqs_developer_id_fkey"
    FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "expert_portfolios"
    ADD CONSTRAINT "expert_portfolios_developer_id_fkey"
    FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_quote_share_id_fkey"
    FOREIGN KEY ("quote_share_id") REFERENCES "quote_shares"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_developer_id_fkey"
    FOREIGN KEY ("developer_id") REFERENCES "developers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_customer_user_id_fkey"
    FOREIGN KEY ("customer_user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
