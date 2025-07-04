
-- First, let's check the current policies and update them to be more explicit
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins and controllers can view applications" ON public."ArtistApplication";
DROP POLICY IF EXISTS "Admins and controllers can update applications" ON public."ArtistApplication";

-- Create updated policies with better authentication checks
CREATE POLICY "Admin, Controller and SuperAdmin can view applications" 
  ON public."ArtistApplication" 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public."UserMST" 
      WHERE uuid = auth.uid() 
      AND (role = 'admin' OR role = 'controller' OR role = 'superadmin')
      AND active = true
    )
  );

CREATE POLICY "Admin, Controller and SuperAdmin can update applications" 
  ON public."ArtistApplication" 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public."UserMST" 
      WHERE uuid = auth.uid() 
      AND (role = 'admin' OR role = 'controller' OR role = 'superadmin')
      AND active = true
    )
  );

-- Ensure the existing insert policy remains the same
-- CREATE POLICY "Anyone can submit artist applications" 
--   ON public."ArtistApplication" 
--   FOR INSERT 
--   WITH CHECK (true);
