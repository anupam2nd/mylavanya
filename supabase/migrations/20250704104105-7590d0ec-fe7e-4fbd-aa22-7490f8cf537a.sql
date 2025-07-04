
-- Phase 1: Database Schema Migration

-- Create member_profiles table that links to Supabase auth.users
CREATE TABLE public.member_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  address TEXT,
  pincode TEXT,
  sex TEXT,
  date_of_birth DATE,
  marital_status BOOLEAN DEFAULT false,
  spouse_name TEXT,
  has_children BOOLEAN DEFAULT false,
  number_of_children INTEGER DEFAULT 0,
  children_details JSONB DEFAULT '[]'::jsonb,
  member_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on member_profiles
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for member_profiles
CREATE POLICY "Users can read own profile" 
ON public.member_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.member_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.member_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create trigger function to auto-create member profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_member_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_profiles (
    id,
    first_name,
    last_name,
    phone_number,
    sex,
    date_of_birth,
    address,
    pincode
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
    COALESCE(NEW.raw_user_meta_data->>'pincode', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to execute the function after user signup
CREATE TRIGGER on_auth_member_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.raw_user_meta_data->>'userType' = 'member')
  EXECUTE FUNCTION public.handle_new_member_user();

-- Update BookMST RLS policies to work with Supabase auth
ALTER TABLE public."BookMST" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own bookings" 
ON public."BookMST" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.member_profiles 
    WHERE id = auth.uid() AND phone_number = "BookMST"."Phone_no"::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = "BookMST".email
  )
);

CREATE POLICY "Members can create bookings" 
ON public."BookMST" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.member_profiles 
    WHERE id = auth.uid()
  )
);

-- Admin/Controller policies for BookMST
CREATE POLICY "Admin and Controller can manage all bookings" 
ON public."BookMST" FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller') 
    AND active = true
  )
);
