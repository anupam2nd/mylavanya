
-- Create the BannerImageMST table
CREATE TABLE public."BannerImageMST" (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."BannerImageMST" ENABLE ROW LEVEL SECURITY;

-- Create policy for admins and superadmins to have full access
CREATE POLICY "Admins can manage banner images" 
  ON public."BannerImageMST"
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public."UserMST" 
      WHERE "Username" = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create policy for read access (if needed for public viewing)
CREATE POLICY "Public can view banner images" 
  ON public."BannerImageMST"
  FOR SELECT 
  USING (true);
