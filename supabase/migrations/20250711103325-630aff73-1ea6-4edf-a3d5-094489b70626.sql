-- First, remove the constraint we added earlier
ALTER TABLE "MemberMST" 
DROP CONSTRAINT IF EXISTS check_id_uuid_match;

-- Remove the uuid column from MemberMST table
ALTER TABLE "MemberMST" 
DROP COLUMN IF EXISTS uuid;