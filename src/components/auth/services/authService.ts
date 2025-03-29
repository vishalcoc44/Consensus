
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
  
  // Add console logs to track profile creation
  console.log("User registered with ID:", data.user?.id);
  
  if (data.user) {
    try {
      // Create profile entry in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: trimmedName,
          created_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      } else {
        console.log("Profile successfully created for user:", data.user.id);
      }
    } catch (profileError) {
      console.error("Profile creation error:", profileError);
      throw profileError;
    }
  }
  
  return data;
};

export const requestPasswordReset = async (email: string) => {
  // Trim whitespace from email
  const trimmedEmail = email.trim();
  
  const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
  
  return true;
};

export const resetPassword = async (newPassword: string) => {
  // The token is automatically handled by Supabase in the URL
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Add a function to get the current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting current session:", error);
    throw error;
  }
  
  return data.session;
};

// Add a function to get user profile
export const getUserProfile = async (userId: string) => {
  console.log("Fetching profile for user:", userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  console.log("Fetched profile:", data);
  return data;
};
