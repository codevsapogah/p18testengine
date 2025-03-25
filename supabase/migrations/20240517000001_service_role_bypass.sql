-- Function to check if a request is coming from a service role
CREATE OR REPLACE FUNCTION auth.is_service_role()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  -- Check if the role is 'service_role'
  SELECT current_setting('role', true) = 'service_role';
$$;

-- Modify existing policies to allow service role bypass
-- This is critical for server-side operations that need to access data across roles

-- Add service role bypass to approved_coaches policies
DROP POLICY IF EXISTS "Admins can read all coaches" ON "approved_coaches";
CREATE POLICY "Admins or service can read all coaches" ON "approved_coaches"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can create coaches" ON "approved_coaches";
CREATE POLICY "Admins or service can create coaches" ON "approved_coaches"
FOR INSERT WITH CHECK (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can update any coach" ON "approved_coaches";
CREATE POLICY "Admins or service can update any coach" ON "approved_coaches"
FOR UPDATE USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can delete coaches" ON "approved_coaches";
CREATE POLICY "Admins or service can delete coaches" ON "approved_coaches"
FOR DELETE USING (auth.is_admin() OR auth.is_service_role());

-- Add service role bypass to quiz_results policies
DROP POLICY IF EXISTS "Admins can read all quiz results" ON "quiz_results";
CREATE POLICY "Admins or service can read all quiz results" ON "quiz_results"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can update any quiz result" ON "quiz_results";
CREATE POLICY "Admins or service can update any quiz result" ON "quiz_results"
FOR UPDATE USING (auth.is_admin() OR auth.is_service_role());

-- Add service role bypass for insert/delete on quiz_results
CREATE POLICY "Service role can insert quiz results" ON "quiz_results"
FOR INSERT WITH CHECK (auth.is_service_role());

CREATE POLICY "Service role can delete quiz results" ON "quiz_results"
FOR DELETE USING (auth.is_service_role());

-- Add service role bypass to users table
DROP POLICY IF EXISTS "Admins can read all users" ON "users";
CREATE POLICY "Admins or service can read all users" ON "users"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

CREATE POLICY "Service role can insert users" ON "users"
FOR INSERT WITH CHECK (auth.is_service_role());

CREATE POLICY "Service role can update users" ON "users"
FOR UPDATE USING (auth.is_service_role());

CREATE POLICY "Service role can delete users" ON "users"
FOR DELETE USING (auth.is_service_role());

-- Add service role bypass to user_details_history
DROP POLICY IF EXISTS "Admins can read all user history" ON "user_details_history";
CREATE POLICY "Admins or service can read all user history" ON "user_details_history"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

CREATE POLICY "Service role can insert user history" ON "user_details_history"
FOR INSERT WITH CHECK (auth.is_service_role());

-- Add service role bypass to clients table
DROP POLICY IF EXISTS "Admins can read all clients" ON "clients";
CREATE POLICY "Admins or service can read all clients" ON "clients"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can create client assignments" ON "clients";
CREATE POLICY "Admins or service can create client assignments" ON "clients"
FOR INSERT WITH CHECK (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can update client assignments" ON "clients";
CREATE POLICY "Admins or service can update client assignments" ON "clients"
FOR UPDATE USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can delete client assignments" ON "clients";
CREATE POLICY "Admins or service can delete client assignments" ON "clients"
FOR DELETE USING (auth.is_admin() OR auth.is_service_role());

-- Add service role bypass to results table
DROP POLICY IF EXISTS "Admins can read all results" ON "results";
CREATE POLICY "Admins or service can read all results" ON "results"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

CREATE POLICY "Service role can insert results" ON "results"
FOR INSERT WITH CHECK (auth.is_service_role());

CREATE POLICY "Service role can update results" ON "results"
FOR UPDATE USING (auth.is_service_role());

CREATE POLICY "Service role can delete results" ON "results"
FOR DELETE USING (auth.is_service_role());

-- Add service role bypass to transactions table
DROP POLICY IF EXISTS "Admins can read all transactions" ON "transactions";
CREATE POLICY "Admins or service can read all transactions" ON "transactions"
FOR SELECT USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can create transactions" ON "transactions";
CREATE POLICY "Admins or service can create transactions" ON "transactions"
FOR INSERT WITH CHECK (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can update transactions" ON "transactions";
CREATE POLICY "Admins or service can update transactions" ON "transactions"
FOR UPDATE USING (auth.is_admin() OR auth.is_service_role());

DROP POLICY IF EXISTS "Admins can delete transactions" ON "transactions";
CREATE POLICY "Admins or service can delete transactions" ON "transactions"
FOR DELETE USING (auth.is_admin() OR auth.is_service_role()); 