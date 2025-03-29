
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabase } from "@/integrations/supabase/client";

// Export the standard client for backwards compatibility
export const typedSupabase = supabase as ReturnType<typeof createClient<Database>>;
