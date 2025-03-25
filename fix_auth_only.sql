-- Fix authentication issues by allowing anon access to approved_coaches for login

-- First, reset RLS on the approved_coaches table
ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_coaches ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can read all coaches" ON public.approved_coaches;
DROP POLICY IF EXISTS "Coaches can read own record" ON public.approved_coaches;

-- Allow anonymous access to the approved_coaches table for email/password validation
CREATE POLICY "Allow login checks" 
ON public.approved_coaches 
FOR SELECT 
TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.approved_coaches TO anon; 