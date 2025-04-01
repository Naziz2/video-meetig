import { createClient } from '@supabase/supabase-js';

// Default Supabase URL and anon key for testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yiggtfduwqrfydwrjwje.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZ2d0ZmR1d3FyZnlkd3Jqd2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU0NzgwMDIsImV4cCI6MjAwMTA1NDAwMn0.dSvHiZmjmRzLvdL7nO6-WCx-y0ucLNwXCzcOgvTXMMw';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);