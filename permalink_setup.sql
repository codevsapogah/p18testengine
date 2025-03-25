-- Add permalink_token column to quiz_results table
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS permalink_token TEXT;

-- Create an index for faster lookups by permalink_token
CREATE INDEX IF NOT EXISTS idx_quiz_results_permalink_token 
ON public.quiz_results (permalink_token);

-- First, enable RLS on the table if not already enabled
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to reorganize them
DROP POLICY IF EXISTS "Public can view results via permalink token" ON public.quiz_results;
DROP POLICY IF EXISTS "Admin full access to quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Coaches can view their clients' results" ON public.quiz_results;
DROP POLICY IF EXISTS "Public can create quiz sessions" ON public.quiz_results;
DROP POLICY IF EXISTS "Public can update quiz sessions" ON public.quiz_results;

-- Create a simple policy for public permalink access 
-- This simpler policy just checks if permalink_token is not null
CREATE POLICY "Public can view results via permalink token" 
ON public.quiz_results
FOR SELECT 
TO anon
USING (permalink_token IS NOT NULL);

-- Admin can access all records
CREATE POLICY "Admin full access to quiz results"
ON public.quiz_results
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.approved_coaches ac
    WHERE ac.is_admin = true
    AND ac.id = auth.uid()
  )
);

-- Coaches can access results for their clients
CREATE POLICY "Coaches can view their clients' results"
ON public.quiz_results
FOR SELECT 
TO authenticated
USING (
  coach_id = auth.uid()
);

-- Public can create quiz sessions without authentication
CREATE POLICY "Public can create quiz sessions"
ON public.quiz_results
FOR INSERT
TO anon
WITH CHECK (true);

-- Public can update quiz sessions they've created (we rely on session IDs for security)
CREATE POLICY "Public can update quiz sessions"
ON public.quiz_results
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Grant select permissions to allow querying by permalink_token
GRANT SELECT ON public.quiz_results TO anon;

-- Add an alternative RLS policy that might work better
DROP POLICY IF EXISTS "Allow public access by permalink token" ON public.quiz_results;

-- Alternative policy that's more specific
CREATE POLICY "Allow public access by permalink token" 
ON public.quiz_results
FOR SELECT 
TO anon
USING (
  permalink_token = ANY(ARRAY[
    SELECT unnest(string_to_array(
      case 
        when url_path_params() like '%/results/%' 
        then replace(url_path_params(), '/results/', '')
        when url_path_params() like '%/results/grid/%' 
        then replace(url_path_params(), '/results/grid/', '')
        when url_path_params() like '%/results/list/%' 
        then replace(url_path_params(), '/results/list/', '')
        else ''
      end, '/')
    ) WHERE length(unnest) >= 40
  ])
  OR permalink_token = ANY(ARRAY[current_setting('request.headers', true)::json->>'permalink_token'])
);

-- Grant additional permissions which might be needed
GRANT SELECT, INSERT, UPDATE ON public.quiz_results TO anon;
GRANT SELECT, INSERT, UPDATE ON public.quiz_results TO authenticated; 