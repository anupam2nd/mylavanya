-- Update RLS policies for PriceMST table - only admin and superadmin can manipulate

-- Step 1: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert into PriceMST" ON public."PriceMST";
DROP POLICY IF EXISTS "Allow authenticated users to update PriceMST" ON public."PriceMST";
DROP POLICY IF EXISTS "Allow public to view PriceMST" ON public."PriceMST";

-- Step 2: Create policy for public to view PriceMST (keep existing functionality)
CREATE POLICY "Allow public to view PriceMST" 
  ON public."PriceMST" 
  FOR SELECT 
  USING (true);

-- Step 3: Create policy for admin and superadmin to insert into PriceMST
CREATE POLICY "Only admin and superadmin can insert into PriceMST" 
  ON public."PriceMST" 
  FOR INSERT 
  WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Step 4: Create policy for admin and superadmin to update PriceMST
CREATE POLICY "Only admin and superadmin can update PriceMST" 
  ON public."PriceMST" 
  FOR UPDATE 
  USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Step 5: Create policy for admin and superadmin to delete from PriceMST
CREATE POLICY "Only admin and superadmin can delete from PriceMST" 
  ON public."PriceMST" 
  FOR DELETE 
  USING (get_current_user_role() IN ('admin', 'superadmin'));