-- Migration: Fix member_profiles constraints and transfer data
-- Step 1: Temporarily drop foreign key constraint if it exists
ALTER TABLE public.member_profiles DROP CONSTRAINT IF EXISTS member_profiles_id_fkey;

-- Step 2: Insert existing MemberMST data into member_profiles
INSERT INTO public.member_profiles (
  id,
  first_name,
  last_name,
  phone_number,
  email,
  address,
  pincode,
  sex,
  date_of_birth,
  marital_status,
  spouse_name,
  has_children,
  number_of_children,
  children_details,
  member_status,
  synthetic_email
)
SELECT 
  uuid as id,
  "MemberFirstName" as first_name,
  "MemberLastName" as last_name,
  "MemberPhNo" as phone_number,
  "MemberEmailId" as email,
  "MemberAdress" as address,
  "MemberPincode" as pincode,
  "MemberSex" as sex,
  "MemberDOB" as date_of_birth,
  "MaritalStatus" as marital_status,
  "SpouseName" as spouse_name,
  "HasChildren" as has_children,
  "NumberOfChildren" as number_of_children,
  "ChildrenDetails" as children_details,
  "MemberStatus" as member_status,
  synthetic_email
FROM public."MemberMST"
WHERE uuid IS NOT NULL;

-- Step 3: Update wishlist table to use UUIDs
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS user_uuid uuid;

-- Update wishlist to use member_profiles UUID
UPDATE public.wishlist 
SET user_uuid = mm.uuid
FROM public."MemberMST" mm
WHERE wishlist.user_id = mm.id;

-- Replace user_id column with UUID type
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE public.wishlist DROP COLUMN user_id;
ALTER TABLE public.wishlist RENAME COLUMN user_uuid TO user_id;

-- Add foreign key constraint to member_profiles
ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.member_profiles(id) ON DELETE CASCADE;