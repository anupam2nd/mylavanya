-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ExternalLeadMST table for public booking submissions
CREATE TABLE public."ExternalLeadMST" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  phonenumber TEXT NOT NULL,
  is_phone_whatsapp BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  selected_service_id INTEGER,
  selected_service_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."ExternalLeadMST" ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (submit forms)
CREATE POLICY "Public can submit booking forms" 
ON public."ExternalLeadMST" 
FOR INSERT 
WITH CHECK (true);

-- Only admin and superadmin can view submissions
CREATE POLICY "Admin and SuperAdmin can view submissions" 
ON public."ExternalLeadMST" 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public."UserMST" 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'superadmin') 
  AND active = true
));

-- Only admin and superadmin can update submissions
CREATE POLICY "Admin and SuperAdmin can update submissions" 
ON public."ExternalLeadMST" 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public."UserMST" 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'superadmin') 
  AND active = true
));

-- Only admin and superadmin can delete submissions
CREATE POLICY "Admin and SuperAdmin can delete submissions" 
ON public."ExternalLeadMST" 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public."UserMST" 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'superadmin') 
  AND active = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_external_lead_updated_at
BEFORE UPDATE ON public."ExternalLeadMST"
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to PriceMST for service reference
ALTER TABLE public."ExternalLeadMST" 
ADD CONSTRAINT fk_external_lead_service 
FOREIGN KEY (selected_service_id) 
REFERENCES public."PriceMST"(prod_id);