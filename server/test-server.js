require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('-------------------------------------');
  console.log('Testing Supabase connection...');
  console.log('Environment variables loaded:');
  console.log({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...' : undefined,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : undefined
  });
  
  // Create clients with direct keys
  const directSupabase = createClient(
    'https://pjarqhshmfrjwelezdbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
  );
  
  const directSupabaseAdmin = createClient(
    'https://pjarqhshmfrjwelezdbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc3MDEyMCwiZXhwIjoyMDU2MzQ2MTIwfQ.eaqH9iXVlszMDy6-J8UTcXqJcPwmZodZpI00qCdOjmE'
  );
  
  // Create clients with env vars
  const envSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  const envSupabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Test direct anonymous connection
    console.log('\n1. Testing direct anonymous connection...');
    const { data: directAnonData, error: directAnonError } = await directSupabase
      .from('approved_coaches')
      .select('*')
      .limit(1);
      
    if (directAnonError) {
      console.error('Direct anonymous connection error:', directAnonError);
    } else {
      console.log('Direct anonymous connection successful:', directAnonData);
    }
    
    // Test direct admin connection
    console.log('\n2. Testing direct admin connection...');
    const { data: directAdminData, error: directAdminError } = await directSupabaseAdmin
      .from('approved_coaches')
      .select('*')
      .limit(1);
      
    if (directAdminError) {
      console.error('Direct admin connection error:', directAdminError);
    } else {
      console.log('Direct admin connection successful:', directAdminData.length > 0);
    }
    
    // Test env anonymous connection
    console.log('\n3. Testing ENV anonymous connection...');
    const { data: envAnonData, error: envAnonError } = await envSupabase
      .from('approved_coaches')
      .select('*')
      .limit(1);
      
    if (envAnonError) {
      console.error('ENV anonymous connection error:', envAnonError);
    } else {
      console.log('ENV anonymous connection successful:', envAnonData);
    }
    
    // Test env admin connection
    console.log('\n4. Testing ENV admin connection...');
    const { data: envAdminData, error: envAdminError } = await envSupabaseAdmin
      .from('approved_coaches')
      .select('*')
      .limit(1);
      
    if (envAdminError) {
      console.error('ENV admin connection error:', envAdminError);
    } else {
      console.log('ENV admin connection successful:', envAdminData.length > 0);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  console.log('-------------------------------------');
}

testConnection(); 