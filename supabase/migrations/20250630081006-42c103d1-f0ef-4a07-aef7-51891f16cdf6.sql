
-- Create ArtistApplication table
CREATE TABLE public."ArtistApplication" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_name TEXT,
  application_date DATE,
  full_name TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  full_address TEXT,
  landmark TEXT,
  pin_code TEXT,
  marital_status TEXT,
  guardian_name TEXT,
  guardian_contact_no TEXT,
  relationship_with_guardian TEXT,
  educational_qualification TEXT,
  job_type TEXT,
  job_experience_years INTEGER,
  has_job_experience BOOLEAN DEFAULT false,
  other_job_description TEXT,
  course_knowledge JSONB DEFAULT '[]'::jsonb,
  trainer_name TEXT,
  training_required BOOLEAN DEFAULT false,
  training_requirements TEXT,
  trainer_feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public."ArtistApplication" ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can apply)
CREATE POLICY "Anyone can submit artist applications" 
  ON public."ArtistApplication" 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for admin/controller to view applications
CREATE POLICY "Admins and controllers can view applications" 
  ON public."ArtistApplication" 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public."UserMST" 
      WHERE uuid = auth.uid() 
      AND (role = 'admin' OR role = 'controller')
      AND active = true
    )
  );

-- Create policy for admin/controller to update applications
CREATE POLICY "Admins and controllers can update applications" 
  ON public."ArtistApplication" 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public."UserMST" 
      WHERE uuid = auth.uid() 
      AND (role = 'admin' OR role = 'controller')
      AND active = true
    )
  );
