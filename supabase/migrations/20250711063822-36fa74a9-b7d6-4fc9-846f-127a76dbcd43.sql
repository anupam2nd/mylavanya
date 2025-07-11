-- Drop existing admin policy on BannerImageMST table
DROP POLICY IF EXISTS "Admins can manage banner images" ON public."BannerImageMST";

-- Allow admin, superadmin and controller to manage banner images
CREATE POLICY "Admin, SuperAdmin and Controller can manage banner images" 
ON public."BannerImageMST"
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public."UserMST"
  WHERE uuid = auth.uid() 
    AND role IN ('admin', 'superadmin', 'controller')
    AND active = true
));

-- Keep public read access for banner images
CREATE POLICY "Public can view banner images" 
ON public."BannerImageMST"
FOR SELECT 
USING (true);