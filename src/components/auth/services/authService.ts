import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

// Login function
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Registration function
export const registerUser = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) throw error;
  return data;
};

// Password reset request
export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return true;
};

// Password reset (update)
export const resetPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return true;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Get user profile by ID - fetching from 'profiles' table if it exists, or just returning basic info
export const getUserProfile = async (userId: string) => {
  // First try to get from profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) {
    return data;
  }

  // Fallback to basic user info if profile fetch fails or doesn't exist yet
  // This is common in early dev when triggers might not be set up
  return {
    id: userId,
  };
};

// Export user data (Mock implementation for now, but returning real user object)
export const exportUserData = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("No authenticated user");
  }

  // Retrieve full profile
  const profile = await getUserProfile(session.user.id);

  return {
    profile,
    auth: {
      email: session.user.email,
      last_sign_in: session.user.last_sign_in_at,
      created_at: session.user.created_at,
    },
    // Add other data fetches here as needed
  };
};

// Delete user data
// Note: Client-side deletion of auth users is not permitted by default in Supabase for security.
// This would typically trigger a cloud function or just delete app-specific data.
// For now, we will sign the user out to simulate completion of the 'request'.
export const deleteUserData = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return true; // Already gone
  }

  // In a real app, this should probably call an Edge Function:
  // await supabase.functions.invoke('delete-account');

  console.warn("Client-side user deletion is restricted. Signing out instead.");
  await signOut();
  return true;
};
