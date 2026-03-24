-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'DEVELOPER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CALCULATING', 'GENERATING_DOCUMENT', 'MATCHING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeveloperType" AS ENUM ('FREELANCER', 'AGENCY');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'LIMITED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SUGGESTED', 'CONTACTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SUBMITTED', 'VIEWED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "name" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_link_tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "project_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "project_name" TEXT,
    "site_type" TEXT,
    "raw_answers" JSONB,
    "normalized_spec" JSONB,
    "cost_estimate" JSONB,
    "pricing_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "project_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_documents" (
    "id" TEXT NOT NULL,
    "project_request_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "format" TEXT NOT NULL DEFAULT 'json',
    "storage_url" TEXT,
    "snapshot_json" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developers" (
    "id" TEXT NOT NULL,
    "type" "DeveloperType" NOT NULL DEFAULT 'FREELANCER',
    "display_name" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "introduction" TEXT,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "supported_project_types" JSONB NOT NULL DEFAULT '[]',
    "supported_core_features" JSONB NOT NULL DEFAULT '[]',
    "supported_ecommerce_features" JSONB NOT NULL DEFAULT '[]',
    "supported_design_styles" JSONB NOT NULL DEFAULT '[]',
    "supported_design_complexities" JSONB NOT NULL DEFAULT '[]',
    "supported_timelines" JSONB NOT NULL DEFAULT '[]',
    "budget_min" INTEGER NOT NULL DEFAULT 0,
    "budget_max" INTEGER NOT NULL DEFAULT 0,
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "avg_response_hours" INTEGER NOT NULL DEFAULT 24,
    "portfolio_links" JSONB NOT NULL DEFAULT '[]',
    "regions" JSONB NOT NULL DEFAULT '[]',
    "languages" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "project_request_id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" JSONB NOT NULL DEFAULT '[]',
    "status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "project_request_id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    "price_min" INTEGER NOT NULL,
    "price_max" INTEGER NOT NULL,
    "estimated_duration_text" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "portfolio_links" JSONB NOT NULL DEFAULT '[]',
    "status" "ProposalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "viewed_at" TIMESTAMP(3),
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rule_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "pricing_rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_tokens_email_key" ON "magic_link_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_tokens_token_key" ON "magic_link_tokens"("token");

-- CreateIndex
CREATE INDEX "project_requests_user_id_idx" ON "project_requests"("user_id");

-- CreateIndex
CREATE INDEX "project_requests_status_idx" ON "project_requests"("status");

-- CreateIndex
CREATE INDEX "project_requests_site_type_idx" ON "project_requests"("site_type");

-- CreateIndex
CREATE INDEX "project_requests_submitted_at_idx" ON "project_requests"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_documents_project_request_id_version_format_key" ON "requirement_documents"("project_request_id", "version", "format");

-- CreateIndex
CREATE INDEX "developers_active_availability_status_idx" ON "developers"("active", "availability_status");

-- CreateIndex
CREATE INDEX "developers_budget_min_budget_max_idx" ON "developers"("budget_min", "budget_max");

-- CreateIndex
CREATE INDEX "match_results_developer_id_idx" ON "match_results"("developer_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_project_request_id_developer_id_key" ON "match_results"("project_request_id", "developer_id");

-- CreateIndex
CREATE INDEX "proposals_project_request_id_status_idx" ON "proposals"("project_request_id", "status");

-- CreateIndex
CREATE INDEX "proposals_developer_id_status_idx" ON "proposals"("developer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_project_request_id_developer_id_key" ON "proposals"("project_request_id", "developer_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_rule_versions_version_key" ON "pricing_rule_versions"("version");

-- CreateIndex
CREATE INDEX "pricing_rule_versions_effective_from_idx" ON "pricing_rule_versions"("effective_from");

-- AddForeignKey
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_project_request_id_fkey" FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_project_request_id_fkey" FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_request_id_fkey" FOREIGN KEY ("project_request_id") REFERENCES "project_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

