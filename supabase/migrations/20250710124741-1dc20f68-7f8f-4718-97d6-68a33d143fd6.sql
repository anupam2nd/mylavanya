-- Drop existing policies on ArtistApplication table
DROP POLICY IF EXISTS "Anyone can submit artist applications" ON public."ArtistApplication";
DROP POLICY IF EXISTS "Admin, Controller and SuperAdmin can view applications" ON public."ArtistApplication";
DROP POLICY IF EXISTS "Admin, Controller and SuperAdmin can update applications" ON public."ArtistApplication";

-- Allow anyone to create new artist applications
CREATE POLICY "Anyone can create artist applications" 
ON public."ArtistApplication"
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow only admin and superadmin to view applications
CREATE POLICY "Admin and SuperAdmin can view applications" 
ON public."ArtistApplication"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND active = true
));

-- Allow only admin and superadmin to update applications
CREATE POLICY "Admin and SuperAdmin can update applications" 
ON public."ArtistApplication"
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND active = true
));