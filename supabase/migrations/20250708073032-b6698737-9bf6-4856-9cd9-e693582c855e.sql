
-- Add synthetic_email column to MemberMST table
ALTER TABLE public."MemberMST" 
ADD COLUMN synthetic_email TEXT NULL;

-- Add an index for faster lookups on synthetic_email
CREATE INDEX idx_membermst_synthetic_email ON public."MemberMST" (synthetic_email);
