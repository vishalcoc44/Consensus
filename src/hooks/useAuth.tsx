
import { useState, useEffect } from 'react';
import { typedSupabase } from '@/utils/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first to catch any immediate auth events
    const { data: { subscription } } = typedSupabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setError(null);
      }
    );

    // Then check for current session
    typedSupabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        console.log("Initial session check:", currentSession ? "Logged in" : "Not logged in");
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error checking session:", err);
        setError("Failed to authenticate. Please try again.");
        setLoading(false);
      });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await typedSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
      toast({
        title: "Authentication failed",
        description: err.message || "Failed to sign in",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await typedSupabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      return { success: true };
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out");
      toast({
        title: "Sign out failed",
        description: err.message || "There was a problem signing out",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut
  };
}
