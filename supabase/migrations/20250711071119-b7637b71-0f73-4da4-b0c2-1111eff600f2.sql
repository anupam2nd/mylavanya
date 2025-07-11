-- First, create the member_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id uuid NOT NULL PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  sex text,
  date_of_birth date,
  address text,
  pincode text,
  email text UNIQUE,
  synthetic_email text,
  original_phone text,
  marital_status boolean DEFAULT false,
  has_children boolean DEFAULT false,
  number_of_children integer DEFAULT 0,
  children_details jsonb DEFAULT '[]'::jsonb,
  spouse_name text,
  member_status boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on member_profiles
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for member_profiles
DROP POLICY IF EXISTS "Members can read own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Members can update own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Members can insert own profile" ON public.member_profiles;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_profiles_email ON public.member_profiles(email);
CREATE INDEX IF NOT EXISTS idx_member_profiles_synthetic_email ON public.member_profiles(synthetic_email);
CREATE INDEX IF NOT EXISTS idx_member_profiles_original_phone ON public.member_profiles(original_phone);

-- Create function to handle new member user creation
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

-- Now create the BookMST RLS policies (rerun the previous migration content)
-- Drop existing policies on BookMST table
DROP POLICY IF EXISTS "Admin and Controller can manage all bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Members can read own bookings via auth" ON public."BookMST";
DROP POLICY IF EXISTS "Members can create bookings via auth" ON public."BookMST";
DROP POLICY IF EXISTS "Members can create bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Members can read own bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Staff can read all bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Staff can update bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Staff can delete bookings" ON public."BookMST";

-- Allow only authenticated members to create bookings
CREATE POLICY "Members can create bookings" 
ON public."BookMST"
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.member_profiles
  WHERE id = auth.uid()
));

-- Allow members to read their own bookings
CREATE POLICY "Members can read own bookings" 
ON public."BookMST"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.member_profiles
  WHERE id = auth.uid() 
    AND (email = "BookMST".email OR phone_number = "BookMST"."Phone_no"::text)
));

-- Allow artist, controller, admin and superadmin to read all bookings
CREATE POLICY "Staff can read all bookings" 
ON public."BookMST"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));

-- Allow artist, controller, admin and superadmin to update bookings
CREATE POLICY "Staff can update bookings" 
ON public."BookMST"
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));

-- Allow artist, controller, admin and superadmin to delete bookings
CREATE POLICY "Staff can delete bookings" 
ON public."BookMST"
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));