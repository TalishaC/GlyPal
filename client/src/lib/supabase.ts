import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qrbaqmoiucvceszvezps.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYmFxbW9pdWN2Y2VzenZlenBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzE0MDksImV4cCI6MjA3NjIwNzQwOX0.MsV_f8SFKkvJ19bH4oU8vXn241mjhWW1kC66srLwjzk";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
