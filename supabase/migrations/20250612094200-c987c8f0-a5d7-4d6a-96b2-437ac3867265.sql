
-- Create RLS policies for the banner-images bucket (bucket already exists)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banner-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own banner images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'banner-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete banner images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banner-images' AND 
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE "Username" = current_setting('request.jwt.claims', true)::json->>'email'
    AND role IN ('admin', 'superadmin')
  )
);
