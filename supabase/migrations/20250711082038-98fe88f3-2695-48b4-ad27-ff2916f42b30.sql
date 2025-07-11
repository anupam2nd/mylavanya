-- Fix MemberMST primary key issue by handling all dependencies properly

-- Step 1: Drop all existing RLS policies that depend on the id column
DROP POLICY IF EXISTS "Members can read own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can update own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can insert own profile" ON public."MemberMST";

-- Step 2: Drop the foreign key constraint from wishlist table that depends on MemberMST
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;

-- Step 3: Drop the existing primary key constraint on MemberMST
ALTER TABLE public."MemberMST" DROP CONSTRAINT IF EXISTS membermst_pkey;

-- Step 4: Add uuid column temporarily and populate it
ALTER TABLE public."MemberMST" ADD COLUMN IF NOT EXISTS uuid_temp UUID DEFAULT gen_random_uuid();

-- Step 5: Update existing records to have uuid values in uuid_temp
UPDATE public."MemberMST" SET uuid_temp = gen_random_uuid() WHERE uuid_temp IS NULL;

-- Step 6: Update wishlist table to use the new uuid values before dropping the old id column
-- First add a temporary uuid column to wishlist
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS user_id_temp UUID;

-- Update wishlist with corresponding uuid values from MemberMST
UPDATE public.wishlist 
SET user_id_temp = m.uuid_temp 
FROM public."MemberMST" m 
WHERE wishlist.user_id::text = m.id::text;

-- Step 7: Drop the old columns and rename the new ones
ALTER TABLE public."MemberMST" DROP COLUMN IF EXISTS id CASCADE;
ALTER TABLE public."MemberMST" RENAME COLUMN uuid_temp TO id;

ALTER TABLE public.wishlist DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.wishlist RENAME COLUMN user_id_temp TO user_id;

-- Step 8: Set the new uuid id column as primary key
ALTER TABLE public."MemberMST" ADD PRIMARY KEY (id);

-- Step 9: Recreate the foreign key constraint with the new uuid column
ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."MemberMST"(id) ON DELETE CASCADE;

-- Step 10: Add missing columns to MemberMST for Supabase compatibility (if they don't exist)
ALTER TABLE public."MemberMST" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS original_phone TEXT;

-- Step 11: Update existing records to populate new timestamp columns
UPDATE public."MemberMST" 
SET created_at = COALESCE(created_at, now()), 
    updated_at = COALESCE(updated_at, now()) 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Step 12: Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_membermst_email ON public."MemberMST" ("MemberEmailId");
CREATE INDEX IF NOT EXISTS idx_membermst_phone ON public."MemberMST" ("MemberPhNo");
CREATE INDEX IF NOT EXISTS idx_membermst_synthetic_email ON public."MemberMST" (synthetic_email);

-- Step 13: Enable RLS on MemberMST
ALTER TABLE public."MemberMST" ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies for MemberMST compatible with Supabase auth
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