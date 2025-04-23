
-- Check if the email column exists in BookMST, if not, add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'BookMST' AND column_name = 'email'
  ) THEN
    -- If email column doesn't exist with lowercase name, check for any case variation
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'BookMST' AND lower(column_name) = 'email'
    ) THEN
      -- A column exists with a different case, we'll rename it
      EXECUTE (
        SELECT 'ALTER TABLE "BookMST" RENAME COLUMN "' || column_name || '" TO "email"'
        FROM information_schema.columns 
        WHERE table_name = 'BookMST' AND lower(column_name) = 'email'
        LIMIT 1
      );
    ELSE
      -- No email column exists at all, add it
      ALTER TABLE "BookMST" ADD COLUMN email text;
    END IF;
  END IF;
END $$;

-- Make sure we have appropriate indexes on the email column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'BookMST' AND indexname = 'BookMST_email_idx'
  ) THEN
    CREATE INDEX "BookMST_email_idx" ON "BookMST" (email);
  END IF;
END $$;
