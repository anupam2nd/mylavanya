-- Create RLS policies for service_otps table - only authenticated users can access

-- Step 1: Enable RLS on service_otps table
ALTER TABLE public.service_otps ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can read service OTPs" ON public.service_otps;
DROP POLICY IF EXISTS "Authenticated users can insert service OTPs" ON public.service_otps;
DROP POLICY IF EXISTS "Authenticated users can update service OTPs" ON public.service_otps;
DROP POLICY IF EXISTS "Authenticated users can delete service OTPs" ON public.service_otps;

-- Step 3: Create policy for authenticated users to read service OTPs
CREATE POLICY "Authenticated users can read service OTPs" 
  ON public.service_otps 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Step 4: Create policy for authenticated users to insert service OTPs
CREATE POLICY "Authenticated users can insert service OTPs" 
  ON public.service_otps 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Step 5: Create policy for authenticated users to update service OTPs
CREATE POLICY "Authenticated users can update service OTPs" 
  ON public.service_otps 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Step 6: Create policy for authenticated users to delete service OTPs
CREATE POLICY "Authenticated users can delete service OTPs" 
  ON public.service_otps 
  FOR DELETE 
  TO authenticated
  USING (true);