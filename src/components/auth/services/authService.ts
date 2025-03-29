
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

// Improved getUserProfile function with better error handling
export const getUserProfile = async (userId: string) => {
  if (!userId) {
    console.error("Cannot fetch profile: userId is undefined or null");
    throw new Error("User ID is required to fetch profile");
  }
  
  console.log("Fetching profile for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Using maybeSingle instead of single to handle cases where profile might not exist
    
    if (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
    
    console.log("Fetched profile:", data);
    
    // If no profile exists and we have a valid userId, create one with basic info
    if (!data && userId) {
      const { data: userData } = await supabase.auth.getUser(userId);
      if (userData && userData.user) {
        const newProfile = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select('*')
          .maybeSingle();
        
        if (createError) {
          console.error("Error creating user profile:", createError);
          throw createError;
        }
        
        console.log("Created new profile for user:", createdProfile);
        return createdProfile;
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};
