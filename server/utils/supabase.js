const { createClient } = require('@supabase/supabase-js');

// Log environment details when initializing
console.log('Initializing Supabase client:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Supabase URL:', process.env.SUPABASE_URL);

// Create Supabase client with anon key
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pjarqhshmfrjwelezdbj.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
);

console.log('Supabase client initialized successfully');

module.exports = { supabase }; 