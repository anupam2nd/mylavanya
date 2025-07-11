-- Create RLS policies for FaqMST table - only superadmin can manipulate

-- Step 1: Enable RLS on FaqMST table
ALTER TABLE public."FaqMST" ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view active FAQs" ON public."FaqMST";
DROP POLICY IF EXISTS "Only superadmin can insert FAQs" ON public."FaqMST";
DROP POLICY IF EXISTS "Only superadmin can update FAQs" ON public."FaqMST";
DROP POLICY IF EXISTS "Only superadmin can delete FAQs" ON public."FaqMST";

-- Step 3: Create policy for public to view active FAQs
CREATE POLICY "Public can view active FAQs" 
  ON public."FaqMST" 
  FOR SELECT 
  USING (active = true);

-- Step 4: Create policy for superadmin to insert FAQs
CREATE POLICY "Only superadmin can insert FAQs" 
  ON public."FaqMST" 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'superadmin');

-- Step 5: Create policy for superadmin to update FAQs
CREATE POLICY "Only superadmin can update FAQs" 
  ON public."FaqMST" 
  FOR UPDATE 
  USING (get_current_user_role() = 'superadmin');

-- Step 6: Create policy for superadmin to delete FAQs
CREATE POLICY "Only superadmin can delete FAQs" 
  ON public."FaqMST" 
  FOR DELETE 
  USING (get_current_user_role() = 'superadmin');