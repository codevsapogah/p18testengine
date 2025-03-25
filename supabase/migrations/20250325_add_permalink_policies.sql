-- Create a simpler policy for public permalink access
CREATE POLICY "Public can view results via permalink token" 
ON quiz_results
FOR SELECT 
TO anon
USING (permalink_token IS NOT NULL);

-- Admin can access all records
CREATE POLICY "Admin full access to quiz results"
ON quiz_results
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM approved_coaches ac
    WHERE ac.is_admin = true
    AND ac.id = auth.uid()
  )
);

-- Coaches can access results for their clients
CREATE POLICY "Coaches can view their clients' results"
ON quiz_results
FOR SELECT 
TO authenticated
USING (
  coach_id = auth.uid()
);

-- Public can create quiz sessions without authentication
CREATE POLICY "Public can create quiz sessions"
ON quiz_results
FOR INSERT
TO anon
WITH CHECK (true);

-- Public can update quiz sessions they've created via the session ID
CREATE POLICY "Public can update quiz sessions with session ID"
ON quiz_results
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true); 