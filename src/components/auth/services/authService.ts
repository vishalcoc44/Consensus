
import { supabase } from '@/integrations/supabase/client';

export const loginUser = async (email: string, password: string) => {
  // Trim whitespace from credentials to prevent common issues
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });
  
  if (error) throw error;
  
  return data;
};

export const registerUser = async (email: string, password: string, name: string) => {
  // Trim whitespace from credentials
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedName = name.trim();
  
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: trimmedPassword,
    options: {
      data: {
        full_name: trimmedName,
      },
    }
  });
  
  if (error) throw error;
  
  if (data.user) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: trimmedName,
          created_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    } catch (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }
  
  return data;
};
