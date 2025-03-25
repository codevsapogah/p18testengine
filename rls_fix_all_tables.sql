-- Comprehensive fix for RLS issues affecting authentication and permalink access

-- 1. Fix coach authentication by allowing anon access to approved_coaches
ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all coaches" ON public.approved_coaches;
DROP POLICY IF EXISTS "Coaches can read own record" ON public.approved_coaches;

-- Allow anonymous access to approved_coaches for login validation
CREATE POLICY "Allow login checks" 
ON public.approved_coaches 
FOR SELECT 
TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.approved_coaches TO anon;

-- 2. Fix permalink access for quiz_results
ALTER TABLE public.quiz_results DISABLE ROW LEVEL SECURITY;

-- Ensure the permalink column exists
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS permalink_token TEXT;

-- Re-enable RLS with appropriate policies
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create minimalistic policies
-- Allow admins full access
CREATE POLICY "admin_access" 
ON public.quiz_results FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.approved_coaches
  WHERE id = auth.uid() AND is_admin = true
));

-- Allow coaches to view their clients' results
CREATE POLICY "coach_access" 
ON public.quiz_results FOR SELECT 
TO authenticated
USING (coach_id = auth.uid());

-- Allow anonymous full access (this is crucial for both permalinks and test-taking)
CREATE POLICY "anon_access" 
ON public.quiz_results FOR ALL 
TO anon
USING (true) 
WITH CHECK (true);

-- Grant all permissions
GRANT ALL ON public.quiz_results TO authenticated;
GRANT ALL ON public.quiz_results TO anon;

-- 3. Fix RLS for any other tables that might affect public access
-- users table
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop policy first to avoid conflicts
DROP POLICY IF EXISTS "anon_users_access" ON public.users;

CREATE POLICY "anon_users_access" 
ON public.users FOR ALL 
TO anon
USING (true) 
WITH CHECK (true);

GRANT ALL ON public.users TO anon;

-- user_details_history table
ALTER TABLE IF EXISTS public.user_details_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_details_history ENABLE ROW LEVEL SECURITY;

-- Drop policy first to avoid conflicts
DROP POLICY IF EXISTS "anon_history_access" ON public.user_details_history;

CREATE POLICY "anon_history_access" 
ON public.user_details_history FOR ALL 
TO anon
USING (true) 
WITH CHECK (true);

GRANT ALL ON public.user_details_history TO anon; 