-- Enable RLS on UserMST table
ALTER TABLE public."UserMST" ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user's role (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public."UserMST" 
    WHERE uuid = auth.uid() AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Only superadmin can insert new users
CREATE POLICY "Only superadmin can insert users" 
ON public."UserMST"
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = 'superadmin');

-- Policy: Only superadmin can update users
CREATE POLICY "Only superadmin can update users" 
ON public."UserMST"
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = 'superadmin');

-- Policy: Only superadmin can delete users
CREATE POLICY "Only superadmin can delete users" 
ON public."UserMST"
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = 'superadmin');