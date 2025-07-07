
-- Phase 1: Database Schema Updates

-- First, let's update the member_profiles table to ensure it has all necessary fields
-- and proper constraints for Supabase auth integration
ALTER TABLE public.member_profiles 
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_member_profiles_email ON public.member_profiles(email);

-- Create a function to handle new member user creation
-- This will automatically create a profile when a user signs up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_member_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.member_profiles (
    id,
    first_name,
    last_name,
    phone_number,
    sex,
    date_of_birth,
    address,
    pincode,
    email
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

-- Create trigger to automatically create member profile on signup
DROP TRIGGER IF EXISTS on_auth_member_user_created ON auth.users;
CREATE TRIGGER on_auth_member_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.raw_user_meta_data->>'userType' = 'member')
  EXECUTE PROCEDURE public.handle_new_member_user();

-- Update RLS policies for member_profiles to use auth.uid()
DROP POLICY IF EXISTS "Users can read own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.member_profiles;

-- Create new RLS policies using auth.uid()
CREATE POLICY "Members can read own profile" 
  ON public.member_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Members can update own profile" 
  ON public.member_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Members can insert own profile" 
  ON public.member_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Update BookMST RLS policies to properly work with Supabase auth
DROP POLICY IF EXISTS "Members can read own bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Members can create bookings" ON public."BookMST";

-- Create improved booking policies using auth.uid()
CREATE POLICY "Members can read own bookings via auth" 
  ON public."BookMST" 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.member_profiles 
      WHERE member_profiles.id = auth.uid() 
      AND (
        member_profiles.email = "BookMST".email 
        OR member_profiles.phone_number = ("BookMST"."Phone_no")::text
      )
    )
  );

CREATE POLICY "Members can create bookings via auth" 
  ON public."BookMST" 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.member_profiles 
      WHERE member_profiles.id = auth.uid()
    )
  );

-- Create a function to migrate existing MemberMST data to Supabase auth
-- This will be used later to help existing members transition
CREATE OR REPLACE FUNCTION public.migrate_member_to_supabase_auth(
  member_email text,
  member_password text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record record;
  new_user_id uuid;
BEGIN
  -- Get existing member data
  SELECT * INTO member_record 
  FROM "MemberMST" 
  WHERE "MemberEmailId" = member_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found with email: %', member_email;
  END IF;
  
  -- Create auth user (this would be done via the client, but we prepare the profile)
  -- The actual auth.users insertion will be done via supabase.auth.signUp()
  
  -- For now, just return a placeholder - the actual migration will be handled by the client
  RETURN gen_random_uuid();
END;
$$;
