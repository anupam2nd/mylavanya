-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Users can read own record for authentication" ON public."UserMST";

-- Create a new policy that allows unauthenticated access for login
CREATE POLICY "Allow login access to UserMST" 
ON public."UserMST"
FOR SELECT 
TO public
USING (true);

-- Create a policy for authenticated users to read their own record
CREATE POLICY "Authenticated users can read own record" 
ON public."UserMST"
FOR SELECT 
TO authenticated
USING (uuid = auth.uid());