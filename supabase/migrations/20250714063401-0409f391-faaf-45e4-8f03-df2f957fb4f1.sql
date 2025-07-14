-- Update RLS policies for UserMST to allow both admin and superadmin roles

-- Drop existing policies
DROP POLICY IF EXISTS "Only superadmin can insert users" ON public."UserMST";
DROP POLICY IF EXISTS "Only superadmin can update users" ON public."UserMST";
DROP POLICY IF EXISTS "Only superadmin can delete users" ON public."UserMST";

-- Create new policies that allow both admin and superadmin
CREATE POLICY "Admin and superadmin can insert users" 
ON public."UserMST"
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text]));

CREATE POLICY "Admin and superadmin can update users" 
ON public."UserMST"
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text]));

CREATE POLICY "Admin and superadmin can delete users" 
ON public."UserMST"
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text]));