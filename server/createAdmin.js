const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createAdminUser() {
  console.log('Creating Supabase client...');
  
  // Create with anon key first
  const supabase = createClient(
    'https://pjarqhshmfrjwelezdbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
  );
  
  // Insert admin user
  console.log('Inserting admin user...');
  const { data, error } = await supabase
    .from('approved_coaches')
    .insert([
      { 
        email: 'admin@p18.test', 
        password: 'admin123',
        name: 'Admin User',
        is_admin: true
      }
    ]);
  
  console.log('Insert result:', data);
  console.log('Insert error:', error);
}

createAdminUser(); 