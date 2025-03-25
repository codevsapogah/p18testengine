-- Simplest RLS solution for permalinks
-- First, reset RLS settings
ALTER TABLE public.quiz_results DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view results via permalink token" ON public.quiz_results;
DROP POLICY IF EXISTS "Admin full access to quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Coaches can view their clients' results" ON public.quiz_results;
DROP POLICY IF EXISTS "Public can create quiz sessions" ON public.quiz_results;
DROP POLICY IF EXISTS "Public can update quiz sessions" ON public.quiz_results;
DROP POLICY IF EXISTS "Allow public access by permalink token" ON public.quiz_results;

-- Ensure the permalink column exists
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS permalink_token TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_permalink_token 
ON public.quiz_results (permalink_token);

-- Re-enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create minimalistic policies
-- 1. Admin can do anything
CREATE POLICY "admin_all" 
ON public.quiz_results FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.approved_coaches
  WHERE id = auth.uid() AND is_admin = true
));

-- 2. Coach can view their own clients
CREATE POLICY "coach_select" 
ON public.quiz_results FOR SELECT 
TO authenticated
USING (coach_id = auth.uid());

-- 3. Anonymous can do anything (create/read/update)
CREATE POLICY "anon_all" 
ON public.quiz_results FOR ALL 
TO anon
USING (true) 
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.quiz_results TO authenticated;
GRANT ALL ON public.quiz_results TO anon; 