import { supabase } from '@/integrations/supabase/client';
import { typedSupabase } from '@/utils/supabaseClient';
import { encrypt, decrypt } from '@/utils/encryption';
import { logAuthEvent } from '@/utils/auditLogger';

export const loginUser = async (email: string, password: string) => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  
  try {
    console.log(`Authentication attempt for: ${trimmedEmail}`);
    
    const { data, error } = await typedSupabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });
    
    if (error) {
      console.error(`Login failed for ${trimmedEmail}:`, error.message);
      await logAuthEvent('login_failed', { email: trimmedEmail, error: error.message });
      throw error;
    }
    
    console.log(`User successfully authenticated: ${data.user?.email}`);
    await logAuthEvent('login_success', { userId: data.user?.id });
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedName = name.trim();
  
  try {
    console.log(`Registration attempt for: ${trimmedEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          full_name: trimmedName,
        },
      }
    });
    
    if (error) {
      console.error(`Registration failed for ${trimmedEmail}:`, error.message);
      await logAuthEvent('registration_failed', { email: trimmedEmail, error: error.message });
      throw error;
    }
    
    console.log("User registered with ID:", data.user?.id);
    await logAuthEvent('registration_success', { userId: data.user?.id });
    
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: trimmedName,
            created_at: new Date().toISOString(),
            gdpr_consent_at: new Date().toISOString(),
            data_encrypted: true
          });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          await logAuthEvent('profile_creation_failed', { 
            userId: data.user.id, 
            error: profileError.message 
          });
          throw profileError;
        } else {
          console.log("Profile successfully created for user:", data.user.id);
          await logAuthEvent('profile_created', { userId: data.user.id });
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  const trimmedEmail = email.trim();
  
  try {
    console.log(`Password reset requested for: ${trimmedEmail}`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error(`Password reset failed for ${trimmedEmail}:`, error.message);
      await logAuthEvent('password_reset_failed', { email: trimmedEmail, error: error.message });
      throw error;
    }
    
    console.log(`Password reset email sent to: ${trimmedEmail}`);
    await logAuthEvent('password_reset_requested', { email: trimmedEmail });
    
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const resetPassword = async (newPassword: string) => {
  try {
    console.log('Attempting to reset password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });
    
    if (error) {
      console.error('Reset password error:', error);
      await logAuthEvent('password_reset_failed', { error: error.message });
      throw error;
    }
    
    console.log('Password successfully reset');
    await logAuthEvent('password_reset_success', {});
    
    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const deleteUserData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }
    
    const userId = session.user.id;
    console.log(`Request to delete user data for: ${userId}`);
    await logAuthEvent('data_deletion_requested', { userId });
    
    const { error: contributionsError } = await supabase
      .from('contributions')
      .delete()
      .eq('user_id', userId);
      
    if (contributionsError) {
      console.error("Error deleting user contributions:", contributionsError);
      throw contributionsError;
    }
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Deleted User',
        avatar_url: null,
        data_deleted_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error("Error anonymizing user profile:", profileError);
      throw profileError;
    }
    
    await logAuthEvent('data_deletion_completed', { userId });
    
    return true;
  } catch (error) {
    console.error('User data deletion error:', error);
    await logAuthEvent('data_deletion_failed', { error: JSON.stringify(error) });
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting current session:", error);
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error("Error in getCurrentSession:", error);
    throw error;
  }
};

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
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      await logAuthEvent('profile_fetch_failed', { userId, error: error.message });
      throw error;
    }
    
    console.log("Fetched profile:", data);
    
    if (!data && userId) {
      const { data: userData } = await supabase.auth.getUser(userId);
      if (userData && userData.user) {
        const newProfile = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          data_encrypted: true
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select('*')
          .maybeSingle();
        
        if (createError) {
          console.error("Error creating user profile:", createError);
          await logAuthEvent('profile_creation_failed', { userId, error: createError.message });
          throw createError;
        }
        
        console.log("Created new profile for user:", createdProfile);
        await logAuthEvent('profile_created', { userId });
        return createdProfile;
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};

export const logAuthEvent = async (
  action: string, 
  details: Record<string, any>
) => {
  try {
    const timestamp = new Date().toISOString();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    
    const { error } = await typedSupabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp,
        ip_address: 'client-side',
        user_agent: navigator.userAgent
      });
      
    if (error) {
      console.error('Error creating audit log:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
};

export const exportUserData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }
    
    const userId = session.user.id;
    await logAuthEvent('data_export_requested', { userId });
    
    const userData = {} as any;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    userData.profile = profile;
    
    const { data: contributions } = await supabase
      .from('contributions')
      .select('*')
      .eq('user_id', userId);
      
    userData.contributions = contributions;
    
    await logAuthEvent('data_export_completed', { userId });
    
    return userData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};
