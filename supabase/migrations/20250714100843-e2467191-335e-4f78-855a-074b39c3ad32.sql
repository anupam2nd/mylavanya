-- Change primary key of UserMST from id to email_id

-- First, ensure email_id is not null for existing records
UPDATE public."UserMST" SET email_id = COALESCE(email_id, 'placeholder@example.com') WHERE email_id IS NULL;

-- Make email_id NOT NULL (required for primary key)
ALTER TABLE public."UserMST" ALTER COLUMN email_id SET NOT NULL;

-- Drop the existing primary key constraint on id
ALTER TABLE public."UserMST" DROP CONSTRAINT IF EXISTS "UserMST_pkey";

-- Add primary key constraint to email_id
ALTER TABLE public."UserMST" ADD CONSTRAINT "UserMST_pkey" PRIMARY KEY (email_id);

-- Make id column nullable since it's no longer primary key
ALTER TABLE public."UserMST" ALTER COLUMN id DROP NOT NULL;