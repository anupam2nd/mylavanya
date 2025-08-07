-- Add new columns to ExternalLeadMST table
ALTER TABLE public."ExternalLeadMST" 
ADD COLUMN from_contact_us boolean NOT NULL DEFAULT false,
ADD COLUMN email text,
ADD COLUMN message text;