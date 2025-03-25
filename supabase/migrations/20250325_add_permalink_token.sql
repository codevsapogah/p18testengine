-- Add permalink_token column to quiz_results table
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS permalink_token TEXT;

-- Create an index for faster lookups by permalink_token
CREATE INDEX IF NOT EXISTS idx_quiz_results_permalink_token 
ON quiz_results (permalink_token);

-- Create a RLS policy to allow public access to results via permalink
CREATE POLICY "Allow viewing results by permalink token" 
ON quiz_results
FOR SELECT
TO anon
USING (permalink_token IS NOT NULL AND permalink_token = current_setting('request.jwt.claims', true)::json->>'permalink_token'); 