-- Enable RLS on all tables
ALTER TABLE IF EXISTS "approved_coaches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quiz_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "user_details_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "transactions" ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current authenticated user
CREATE OR REPLACE FUNCTION auth.get_auth_user_id() 
RETURNS uuid 
LANGUAGE sql STABLE 
AS $$
  SELECT coalesce(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$$;

-- Create roles for policy checks
CREATE TYPE user_role AS ENUM ('admin', 'coach', 'client');

-- Create function to check if current user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM approved_coaches
    WHERE id = auth.get_auth_user_id() AND is_admin = true
  );
$$;

-- Create function to check if current user is a coach
CREATE OR REPLACE FUNCTION auth.is_coach()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM approved_coaches
    WHERE id = auth.get_auth_user_id() AND is_admin = false
  );
$$;

-- approved_coaches table policies
-- Only admins can read all coach records
CREATE POLICY "Admins can read all coaches" ON "approved_coaches"
FOR SELECT USING (auth.is_admin());

-- Coaches can only read their own record
CREATE POLICY "Coaches can read own record" ON "approved_coaches"
FOR SELECT USING (id = auth.get_auth_user_id());

-- Only admins can insert new coaches
CREATE POLICY "Admins can create coaches" ON "approved_coaches"
FOR INSERT WITH CHECK (auth.is_admin());

-- Only admins can update any coach
CREATE POLICY "Admins can update any coach" ON "approved_coaches"
FOR UPDATE USING (auth.is_admin());

-- Coaches can update their own record
CREATE POLICY "Coaches can update own record" ON "approved_coaches"
FOR UPDATE USING (id = auth.get_auth_user_id());

-- Only admins can delete coaches
CREATE POLICY "Admins can delete coaches" ON "approved_coaches"
FOR DELETE USING (auth.is_admin());

-- quiz_results table policies
-- Admins can see all quiz results
CREATE POLICY "Admins can read all quiz results" ON "quiz_results"
FOR SELECT USING (auth.is_admin());

-- Coaches can only see quiz results assigned to them
CREATE POLICY "Coaches can read assigned quiz results" ON "quiz_results"
FOR SELECT USING (
  auth.is_coach() AND coach_id = auth.get_auth_user_id()
);

-- Clients can only see their own quiz results
CREATE POLICY "Clients can read own quiz results" ON "quiz_results"
FOR SELECT USING (user_id = auth.get_auth_user_id());

-- Users can insert their own quiz results (when taking a test)
CREATE POLICY "Users can insert own quiz results" ON "quiz_results"
FOR INSERT WITH CHECK (user_id = auth.get_auth_user_id());

-- Admins can update any quiz result
CREATE POLICY "Admins can update any quiz result" ON "quiz_results"
FOR UPDATE USING (auth.is_admin());

-- Coaches can update quiz results assigned to them
CREATE POLICY "Coaches can update assigned quiz results" ON "quiz_results"
FOR UPDATE USING (
  auth.is_coach() AND coach_id = auth.get_auth_user_id()
);

-- users table policies
-- Admins can see all users
CREATE POLICY "Admins can read all users" ON "users"
FOR SELECT USING (auth.is_admin());

-- Coaches can only see their assigned users/clients
CREATE POLICY "Coaches can read assigned users" ON "users"
FOR SELECT USING (
  auth.is_coach() AND EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.user_id = users.id AND clients.coach_id = auth.get_auth_user_id()
  )
);

-- Users can see their own record
CREATE POLICY "Users can read own record" ON "users"
FOR SELECT USING (id = auth.get_auth_user_id());

-- Only users can update their own record
CREATE POLICY "Users can update own record" ON "users"
FOR UPDATE USING (id = auth.get_auth_user_id());

-- user_details_history table policies
-- Admins can see all user history
CREATE POLICY "Admins can read all user history" ON "user_details_history"
FOR SELECT USING (auth.is_admin());

-- Users can see their own history
CREATE POLICY "Users can read own history" ON "user_details_history"
FOR SELECT USING (user_id = auth.get_auth_user_id());

-- clients table policies
-- Admins can see all clients
CREATE POLICY "Admins can read all clients" ON "clients"
FOR SELECT USING (auth.is_admin());

-- Coaches can only see their assigned clients
CREATE POLICY "Coaches can read own clients" ON "clients"
FOR SELECT USING (
  auth.is_coach() AND coach_id = auth.get_auth_user_id()
);

-- Clients can see their own client record
CREATE POLICY "Clients can read own record" ON "clients"
FOR SELECT USING (user_id = auth.get_auth_user_id());

-- Only admins can create client assignments
CREATE POLICY "Admins can create client assignments" ON "clients"
FOR INSERT WITH CHECK (auth.is_admin());

-- Only admins can update client assignments
CREATE POLICY "Admins can update client assignments" ON "clients"
FOR UPDATE USING (auth.is_admin());

-- Only admins can delete client assignments
CREATE POLICY "Admins can delete client assignments" ON "clients"
FOR DELETE USING (auth.is_admin());

-- results table policies
-- Admins can see all results
CREATE POLICY "Admins can read all results" ON "results"
FOR SELECT USING (auth.is_admin());

-- Coaches can only see results for their clients
CREATE POLICY "Coaches can read client results" ON "results"
FOR SELECT USING (
  auth.is_coach() AND EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = results.user_id AND clients.coach_id = auth.get_auth_user_id()
  )
);

-- Clients can only see their own results
CREATE POLICY "Clients can read own results" ON "results"
FOR SELECT USING (user_id = auth.get_auth_user_id());

-- transactions table policies
-- Only admins can see all transactions
CREATE POLICY "Admins can read all transactions" ON "transactions"
FOR SELECT USING (auth.is_admin());

-- Coaches can only see their own transactions
CREATE POLICY "Coaches can read own transactions" ON "transactions"
FOR SELECT USING (
  auth.is_coach() AND coach_id = auth.get_auth_user_id()
);

-- Only admins can create transactions
CREATE POLICY "Admins can create transactions" ON "transactions"
FOR INSERT WITH CHECK (auth.is_admin());

-- Only admins can update transactions
CREATE POLICY "Admins can update transactions" ON "transactions"
FOR UPDATE USING (auth.is_admin());

-- Only admins can delete transactions
CREATE POLICY "Admins can delete transactions" ON "transactions"
FOR DELETE USING (auth.is_admin()); 