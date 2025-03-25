const { createClient } = require('@supabase/supabase-js');

// Log environment details when initializing
console.log('Initializing Supabase client:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Supabase URL:', process.env.SUPABASE_URL);

// Create Supabase client with service role key for server-side operations
// This will bypass RLS and should ONLY be used server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://pjarqhshmfrjwelezdbj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc3MDEyMCwiZXhwIjoyMDU2MzQ2MTIwfQ.eaqH9iXVlszMDy6-J8UTcXqJcPwmZodZpI00qCdOjmE'
);

// Create Supabase client with anon key for operations that should respect RLS
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pjarqhshmfrjwelezdbj.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
);

console.log('Supabase clients initialized successfully');

module.exports = { 
  supabase,      // Standard client (respects RLS)
  supabaseAdmin  // Admin client (bypasses RLS)
}; 