DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = '_prisma_migrations'
  ) THEN
    UPDATE "_prisma_migrations"
    SET rolled_back_at = NOW()
    WHERE migration_name = '0001_init'
      AND finished_at IS NULL
      AND rolled_back_at IS NULL;
  END IF;
END $$;
