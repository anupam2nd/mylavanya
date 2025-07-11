-- Fix the ID mismatch issue in MemberMST table
-- Set the id field to match uuid field for consistency
UPDATE "MemberMST" 
SET id = uuid 
WHERE id != uuid;

-- Add a constraint to ensure id and uuid are always the same going forward
ALTER TABLE "MemberMST" 
ADD CONSTRAINT check_id_uuid_match 
CHECK (id = uuid);