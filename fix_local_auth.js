// Fix local authentication issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixLocalAuth() {
  console.log('Fixing local Supabase authentication issues...');
  
  // Create client with service role key to bypass RLS
  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL || 'https://pjarqhshmfrjwelezdbj.supabase.co',
    process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc3MDEyMCwiZXhwIjoyMDU2MzQ2MTIwfQ.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
  );
  
  try {
    console.log('Applying RLS fixes for authentication...');
    
    // Fix approved_coaches table to allow anon access for login
    const { error: disableError } = await supabaseAdmin
      .rpc('alter_approved_coaches_rls_disable');
    if (disableError) {
      console.log('Could not disable RLS, creating custom function first...');
      
      // Create a function to run DDL commands
      const { error: createFuncError } = await supabaseAdmin
        .from('_sqlj')
        .insert({
          name: 'alter_approved_coaches_rls_disable',
          code: `
            BEGIN
              ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
              RETURN TRUE;
            END;
          `
        });
      
      if (createFuncError) {
        // Direct SQL not working; manual fix needed
        console.log('Could not create function, please run the following SQL in the Supabase SQL Editor:');
        console.log(`
          -- Fix authentication issues by allowing anon access to approved_coaches for login
          ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
          ALTER TABLE public.approved_coaches ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Admins can read all coaches" ON public.approved_coaches;
          DROP POLICY IF EXISTS "Coaches can read own record" ON public.approved_coaches;
          CREATE POLICY "Allow login checks" ON public.approved_coaches FOR SELECT TO anon USING (true);
          GRANT SELECT ON public.approved_coaches TO anon;
        `);
        return;
      }
    }
    
    // Instead of trying complex SQL, just provide instructions
    console.log('To fix authentication, please copy and run this SQL in the Supabase SQL Editor:');
    console.log(`
-- Fix authentication issues by allowing anon access to approved_coaches for login
ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all coaches" ON public.approved_coaches;
DROP POLICY IF EXISTS "Coaches can read own record" ON public.approved_coaches;
CREATE POLICY "Allow login checks" ON public.approved_coaches FOR SELECT TO anon USING (true);
GRANT SELECT ON public.approved_coaches TO anon;
    `);
    
    // Test connection to confirm we're hitting the right database
    const { data, error } = await supabaseAdmin
      .from('approved_coaches')
      .select('id, email')
      .limit(1);
      
    if (error) {
      console.error('Error testing connection:', error);
    } else {
      console.log('Connection test successful. Found coach:', data);
    }
    
  } catch (error) {
    console.error('Error applying RLS fixes:', error);
    console.log('\nTo fix authentication, please copy and run this SQL in the Supabase SQL Editor:');
    console.log(`
-- Fix authentication issues by allowing anon access to approved_coaches for login
ALTER TABLE public.approved_coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all coaches" ON public.approved_coaches;
DROP POLICY IF EXISTS "Coaches can read own record" ON public.approved_coaches;
CREATE POLICY "Allow login checks" ON public.approved_coaches FOR SELECT TO anon USING (true);
GRANT SELECT ON public.approved_coaches TO anon;
    `);
  }
}

// Run the fix
fixLocalAuth(); 