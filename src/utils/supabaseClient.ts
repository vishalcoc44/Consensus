
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://qovsvwzqfqpxnfdourqm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdnN2d3pxZnFweG5mZG91cnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwOTk3MjgsImV4cCI6MjA1NzY3NTcyOH0.DyilrixZ4-GWe4CUs1pKeowXjU5_r9aJmLNu2AWeGOg";

export const typedSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
