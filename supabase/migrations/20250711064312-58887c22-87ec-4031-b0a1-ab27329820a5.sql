-- Drop existing policies on BookMST table
DROP POLICY IF EXISTS "Admin and Controller can manage all bookings" ON public."BookMST";
DROP POLICY IF EXISTS "Members can read own bookings via auth" ON public."BookMST";
DROP POLICY IF EXISTS "Members can create bookings via auth" ON public."BookMST";

-- Allow only authenticated members to create bookings
CREATE POLICY "Members can create bookings" 
ON public."BookMST"
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.member_profiles
  WHERE id = auth.uid()
));

-- Allow members to read their own bookings
CREATE POLICY "Members can read own bookings" 
ON public."BookMST"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.member_profiles
  WHERE id = auth.uid() 
    AND (email = "BookMST".email OR phone_number = "BookMST"."Phone_no"::text)
));

-- Allow artist, controller, admin and superadmin to read all bookings
CREATE POLICY "Staff can read all bookings" 
ON public."BookMST"
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));

-- Allow artist, controller, admin and superadmin to update bookings
CREATE POLICY "Staff can update bookings" 
ON public."BookMST"
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));

-- Allow artist, controller, admin and superadmin to delete bookings
CREATE POLICY "Staff can delete bookings" 
ON public."BookMST"
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
) OR EXISTS (
  SELECT 1
  FROM public."ArtistMST"
  WHERE uuid = auth.uid()
    AND "Active" = true
));