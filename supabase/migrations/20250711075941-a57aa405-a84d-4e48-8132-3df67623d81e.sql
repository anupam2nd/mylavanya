-- Fix MemberMST primary key issue

-- Step 1: Drop the existing primary key constraint
ALTER TABLE public."MemberMST" DROP CONSTRAINT "MemberMST_pkey";

-- Step 2: Set uuid as the new primary key
ALTER TABLE public."MemberMST" ADD PRIMARY KEY (uuid);

-- Step 3: Add missing columns to MemberMST for Supabase compatibility (if they don't exist)
ALTER TABLE public."MemberMST" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS original_phone TEXT;

-- Step 4: Update existing records to populate new timestamp columns
UPDATE public."MemberMST" 
SET created_at = COALESCE(created_at, now()), 
    updated_at = COALESCE(updated_at, now()) 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Step 5: Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_membermst_email ON public."MemberMST" ("MemberEmailId");
CREATE INDEX IF NOT EXISTS idx_membermst_phone ON public."MemberMST" ("MemberPhNo");
CREATE INDEX IF NOT EXISTS idx_membermst_synthetic_email ON public."MemberMST" (synthetic_email);

-- Step 6: Enable RLS on MemberMST
ALTER TABLE public."MemberMST" ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for MemberMST compatible with Supabase auth
CREATE POLICY "Members can read own profile" 
  ON public."MemberMST" 
  FOR SELECT 
  USING (auth.uid() = uuid);

CREATE POLICY "Members can update own profile" 
  ON public."MemberMST" 
  FOR UPDATE 
  USING (auth.uid() = uuid);

CREATE POLICY "Members can insert own profile" 
  ON public."MemberMST" 
  FOR INSERT 
  WITH CHECK (auth.uid() = uuid);