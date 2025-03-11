const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('Testing Supabase connection with anon key...');
  
  // Try with the anon key instead
  const supabase = createClient(
    'https://pjarqhshmfrjwelezdbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
  );
  
  try {
    // Test a simple query
    console.log('Testing query...');
    const { data, error } = await supabase
      .from('approved_coaches')
      .select('id, email, name, is_admin')
      .limit(1);
    
    if (error) {
      console.error('Error with anon key:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Run the test
testSupabaseConnection(); 