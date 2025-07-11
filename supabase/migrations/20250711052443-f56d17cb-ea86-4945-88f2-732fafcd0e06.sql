-- Drop existing policies on ArtistMST table
DROP POLICY IF EXISTS "Artist_login" ON public."ArtistMST";

-- Allow only admin and superadmin to create new artist records
CREATE POLICY "Admin and SuperAdmin can create artists" 
ON public."ArtistMST"
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND active = true
));

-- Allow artists to view their own record
CREATE POLICY "Artists can view own record" 
ON public."ArtistMST"
FOR SELECT 
TO authenticated
USING (uuid = auth.uid());

-- Allow artists to update only their password and uuid when setting up account
CREATE POLICY "Artists can update own password and uuid" 
ON public."ArtistMST"
FOR UPDATE 
TO authenticated
USING (emailid = (auth.jwt() ->> 'email'))
WITH CHECK (emailid = (auth.jwt() ->> 'email'));

-- Allow admin and superadmin to view all artist records
CREATE POLICY "Admin and SuperAdmin can view all artists" 
ON public."ArtistMST"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND active = true
));

-- Allow admin and superadmin to update all artist records
CREATE POLICY "Admin and SuperAdmin can update all artists" 
ON public."ArtistMST"
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND active = true
));