
-- Add synthetic_email and original_phone columns to member_profiles table
ALTER TABLE public.member_profiles 
ADD COLUMN synthetic_email text,
ADD COLUMN original_phone text;

-- Create index on synthetic_email for faster lookups
CREATE INDEX idx_member_profiles_synthetic_email ON public.member_profiles (synthetic_email);

-- Create index on original_phone for faster lookups  
CREATE INDEX idx_member_profiles_original_phone ON public.member_profiles (original_phone);

-- Update existing member_profiles records to populate synthetic_email and original_phone
-- This will generate synthetic emails for existing phone numbers in the format +91{phone}@member.mylavanya.com
UPDATE public.member_profiles 
SET 
  synthetic_email = CASE 
    WHEN phone_number IS NOT NULL AND phone_number != '' 
    THEN '+91' || phone_number || '@member.mylavanya.com'
    ELSE NULL 
  END,
  original_phone = phone_number
WHERE phone_number IS NOT NULL AND phone_number != '';
