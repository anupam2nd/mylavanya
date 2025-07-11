-- Fix MemberMST primary key issue by converting existing id column to uuid

-- Step 1: Drop the existing primary key constraint (find the actual constraint name first)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public."MemberMST"'::regclass 
    AND contype = 'p';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public."MemberMST" DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
END $$;

-- Step 2: Add uuid column temporarily and populate it
ALTER TABLE public."MemberMST" ADD COLUMN IF NOT EXISTS uuid_temp UUID DEFAULT gen_random_uuid();

-- Step 3: Update existing records to have uuid values in uuid_temp
UPDATE public."MemberMST" SET uuid_temp = gen_random_uuid() WHERE uuid_temp IS NULL;

-- Step 4: Drop the old id column and rename uuid_temp to id
ALTER TABLE public."MemberMST" DROP COLUMN IF EXISTS id;
ALTER TABLE public."MemberMST" RENAME COLUMN uuid_temp TO id;

-- Step 5: Set the new uuid id column as primary key
ALTER TABLE public."MemberMST" ADD PRIMARY KEY (id);

-- Step 6: Add missing columns to MemberMST for Supabase compatibility (if they don't exist)
ALTER TABLE public."MemberMST" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS original_phone TEXT;

-- Step 7: Update existing records to populate new timestamp columns
UPDATE public."MemberMST" 
SET created_at = COALESCE(created_at, now()), 
    updated_at = COALESCE(updated_at, now()) 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Step 8: Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_membermst_email ON public."MemberMST" ("MemberEmailId");
CREATE INDEX IF NOT EXISTS idx_membermst_phone ON public."MemberMST" ("MemberPhNo");
CREATE INDEX IF NOT EXISTS idx_membermst_synthetic_email ON public."MemberMST" (synthetic_email);

-- Step 9: Enable RLS on MemberMST
ALTER TABLE public."MemberMST" ENABLE ROW LEVEL SECURITY;

-- Step 10: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Members can read own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can update own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can insert own profile" ON public."MemberMST";

-- Step 11: Create RLS policies for MemberMST compatible with Supabase auth
CREATE POLICY "Members can read own profile" 
  ON public."MemberMST" 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Members can update own profile" 
  ON public."MemberMST" 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Members can insert own profile" 
  ON public."MemberMST" 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);