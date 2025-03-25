require('dotenv').config({ path: '../.env.local' });
console.log('Testing environment variables loading from .env.local:');
console.log({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...' : undefined,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : undefined
}); 