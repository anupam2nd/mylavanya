-- Make MemberMST Supabase compatible and remove duplicate member_profiles table

-- Step 1: Add missing columns to MemberMST for Supabase compatibility
ALTER TABLE public."MemberMST" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS original_phone TEXT;

-- Step 2: Update existing records to populate new timestamp columns
UPDATE public."MemberMST" 
SET created_at = now(), updated_at = now() 
WHERE created_at IS NULL;

-- Step 3: Make uuid the primary key (drop existing primary key first)
ALTER TABLE public."MemberMST" DROP CONSTRAINT IF EXISTS "MemberMST_pkey";
ALTER TABLE public."MemberMST" ADD PRIMARY KEY (uuid);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membermst_uuid ON public."MemberMST" (uuid);
CREATE INDEX IF NOT EXISTS idx_membermst_email ON public."MemberMST" ("MemberEmailId");
CREATE INDEX IF NOT EXISTS idx_membermst_phone ON public."MemberMST" ("MemberPhNo");
CREATE INDEX IF NOT EXISTS idx_membermst_synthetic_email ON public."MemberMST" (synthetic_email);

-- Step 5: Enable RLS on MemberMST
ALTER TABLE public."MemberMST" ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for MemberMST compatible with Supabase auth
DROP POLICY IF EXISTS "Members can read own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can update own profile" ON public."MemberMST";
DROP POLICY IF EXISTS "Members can insert own profile" ON public."MemberMST";

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

-- Step 7: Update BookMST RLS policies to work with MemberMST
DROP POLICY IF EXISTS "Members can read own bookings via auth" ON public."BookMST";
DROP POLICY IF EXISTS "Members can create bookings via auth" ON public."BookMST";

CREATE POLICY "Members can read own bookings via MemberMST" 
  ON public."BookMST" 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public."MemberMST" 
      WHERE "MemberMST".uuid = auth.uid() 
      AND (
        "MemberMST"."MemberEmailId" = "BookMST".email 
        OR "MemberMST"."MemberPhNo" = ("BookMST"."Phone_no")::text
      )
    )
  );

CREATE POLICY "Members can create bookings via MemberMST" 
  ON public."BookMST" 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."MemberMST" 
      WHERE "MemberMST".uuid = auth.uid()
    )
  );

-- Step 8: Update wishlist to reference MemberMST instead of member_profiles
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."MemberMST"(uuid) ON DELETE CASCADE;

-- Step 9: Update the handle_new_member_user function to work with MemberMST
CREATE OR REPLACE FUNCTION public.handle_new_member_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public."MemberMST" (
    uuid,
    "MemberFirstName",
    "MemberLastName",
    "MemberPhNo",
    "MemberSex",
    "MemberDOB",
    "MemberAdress",
    "MemberPincode",
    "MemberEmailId"
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'phoneNumber', ''),
    COALESCE(NEW.raw_user_meta_data->>'sex', 'Male'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'dob' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'dob')::date
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'pincode', ''),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Step 10: Remove the duplicate member_profiles table
DROP TABLE IF EXISTS public.member_profiles CASCADE;