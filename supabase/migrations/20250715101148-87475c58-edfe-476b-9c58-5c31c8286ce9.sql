
-- First, let's modify the UserMST table to properly reference auth.users
-- We need to drop the existing table and recreate it with the correct structure

-- Drop existing table (be careful - this will delete all data)
DROP TABLE IF EXISTS public."UserMST";

-- Create the new UserMST table with id referencing auth.users
CREATE TABLE public."UserMST" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL UNIQUE,
  "FirstName" TEXT,
  "LastName" TEXT,
  role TEXT DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  "PhoneNo" TEXT,
  password TEXT, -- Keep for legacy users, but new users won't use this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public."UserMST" ENABLE ROW LEVEL SECURITY;

-- Recreate the existing RLS policies
CREATE POLICY "Authenticated users can read own record" 
ON public."UserMST" 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

CREATE POLICY "Allow login access to UserMST" 
ON public."UserMST" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admin and superadmin can insert users" 
ON public."UserMST" 
FOR INSERT 
TO authenticated 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

CREATE POLICY "Admin and superadmin can update users" 
ON public."UserMST" 
FOR UPDATE 
TO authenticated 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

CREATE POLICY "Admin and superadmin can delete users" 
ON public."UserMST" 
FOR DELETE 
TO authenticated 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usermst_updated_at 
    BEFORE UPDATE ON public."UserMST" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
