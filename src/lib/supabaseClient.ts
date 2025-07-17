import { createClient, SupabaseClient } from '@supabase/supabase-js'

// --- TEMPORARY FIX ---
// Replace these placeholders with your actual Supabase credentials.
// This is not a secure long-term solution, but it will get the app working.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// ---------------------

let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error: any) {
    console.error(
      'An error occurred while creating the Supabase client:',
      error.message
    );
  }
}

export { supabase }; 