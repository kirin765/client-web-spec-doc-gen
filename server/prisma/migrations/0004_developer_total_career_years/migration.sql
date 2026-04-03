ALTER TABLE "developers"
ADD COLUMN "total_career_years" INTEGER;

CREATE INDEX IF NOT EXISTS "developers_total_career_years_idx"
ON "developers"("total_career_years");
