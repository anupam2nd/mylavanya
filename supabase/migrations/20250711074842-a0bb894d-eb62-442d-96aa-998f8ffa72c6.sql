-- Migration: Transfer data from MemberMST to member_profiles and update references
-- Step 1: Insert existing MemberMST data into member_profiles

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

-- Step 2: Update wishlist table to reference member_profiles by UUID instead of MemberMST id
-- First, add a temporary column to store UUID
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS user_uuid uuid;

-- Update the wishlist table to use UUID from member_profiles
UPDATE public.wishlist 
SET user_uuid = mp.id
FROM public.member_profiles mp, public."MemberMST" mm
WHERE wishlist.user_id = mm.id AND mm.uuid = mp.id;

-- Step 3: Create a new user_id column that references member_profiles by UUID
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE public.wishlist ALTER COLUMN user_id TYPE uuid USING user_uuid;
ALTER TABLE public.wishlist DROP COLUMN IF EXISTS user_uuid;

-- Step 4: Update wishlist functions to use UUID instead of numeric ID
CREATE OR REPLACE FUNCTION public.get_user_wishlist(user_uuid uuid)
RETURNS TABLE(id integer, user_id uuid, service_id integer, created_at timestamp with time zone, service_name text, service_price numeric, service_category text, service_description text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.service_id,
    w.created_at,
    p."ProductName" as service_name,
    p."Price" as service_price,
    p."Category" as service_category,
    p."Description" as service_description
  FROM 
    public.wishlist w
  JOIN 
    public."PriceMST" p ON w.service_id = p.prod_id
  WHERE 
    w.user_id = user_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_to_wishlist(service_id_param integer, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.wishlist (service_id, user_id)
  VALUES (service_id_param, user_id_param);
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_from_wishlist(wishlist_id_param integer, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.wishlist
  WHERE id = wishlist_id_param AND user_id = user_id_param;
END;
$function$;