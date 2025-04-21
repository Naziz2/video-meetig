import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');

// Create supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add a function to check if supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://example.supabase.co' && 
         supabaseAnonKey !== 'public-anon-key';
};