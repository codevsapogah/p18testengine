const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testLogin(email, password) {
  console.log(`Testing login for: ${email}`);
  
  // Create client with anon key
  const supabase = createClient(
    'https://pjarqhshmfrjwelezdbj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg'
  );
  
  try {
    // 1. First check if the email exists
    console.log('Querying for user with email:', email);
    const { data: userData, error: userError } = await supabase
      .from('approved_coaches')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    if (!userData) {
      console.log('No user found with this email');
      return;
    }
    
    console.log('User found:', {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      is_admin: userData.is_admin,
      storedPassword: userData.password,
      providedPassword: password,
      passwordsMatch: userData.password === password
    });
    
    // Test the exact string comparison
    console.log('Password comparison:');
    console.log(`Stored password: "${userData.password}"`);
    console.log(`Provided password: "${password}"`);
    console.log(`Length of stored password: ${userData.password?.length}`);
    console.log(`Length of provided password: ${password?.length}`);
    console.log(`Are they equal? ${userData.password === password}`);
    
    // Compare character by character
    console.log('\nCharacter by character comparison:');
    const storedChars = [...(userData.password || '')];
    const providedChars = [...(password || '')];
    const maxLength = Math.max(storedChars.length, providedChars.length);
    
    for (let i = 0; i < maxLength; i++) {
      const storedChar = storedChars[i] || '';
      const providedChar = providedChars[i] || '';
      const match = storedChar === providedChar;
      console.log(`Position ${i}: '${storedChar}' vs '${providedChar}' - ${match ? 'Match' : 'DIFFERENT'}`);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Test with one of the known credentials
testLogin('nurbolat.khamitov@gmail.com', '#P18y2025'); 