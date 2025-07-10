-- Policy: Allow users to read their own record for authentication
CREATE POLICY "Users can read own record for authentication" 
ON public."UserMST"
FOR SELECT 
TO authenticated
USING (uuid = auth.uid() OR true);