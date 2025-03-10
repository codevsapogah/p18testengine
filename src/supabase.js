import { createClient } from '@supabase/supabase-js';

// Hardcode the values for now (for development - don't do this in production)
const supabaseUrl = 'https://pjarqhshmfrjwelezdbj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);