import { createClient } from '@supabase/supabase-js';

// Create the Supabase client with the provided credentials
const supabaseUrl = 'https://pjarqhshmfrjwelezdbj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg';

// Helper function to get JWT from cookies
function getJwtFromCookies() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('token=')) {
      return cookie.substring('token='.length, cookie.length);
    }
  }
  return null;
}

// PostgreSQL connection options
const options = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      // Add JWT auth header if available in cookies
      Authorization: getJwtFromCookies() ? `Bearer ${getJwtFromCookies()}` : undefined
    }
  }
};

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Function to update auth token - call this after login/logout
export const updateSupabaseAuth = () => {
  const jwt = getJwtFromCookies();
  if (jwt) {
    // Update the Authorization header
    supabase.rest.headers.Authorization = `Bearer ${jwt}`;
  } else {
    // Clear the Authorization header if no JWT is present
    delete supabase.rest.headers.Authorization;
  }
};

// Initialize auth on page load
if (typeof window !== 'undefined') {
  // Update auth when page becomes visible (user might have logged in in another tab)
  document.addEventListener('visibilitychange', updateSupabaseAuth);
  
  // Initial update
  updateSupabaseAuth();
}