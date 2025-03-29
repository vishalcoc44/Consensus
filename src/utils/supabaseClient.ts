
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabase } from "@/integrations/supabase/client";

// Export the typed Supabase client
export const typedSupabase = supabase as ReturnType<typeof createClient<Database>>;

// Helper function to safely extract profile data
export const extractProfileData = (profileData: any) => {
  if (!profileData) return null;
  
  // Handle case where profile is returned as an array
  if (Array.isArray(profileData)) {
    return profileData.length > 0 ? profileData[0] : null;
  }
  
  // Handle case where profile is returned as a single object
  return profileData;
};
