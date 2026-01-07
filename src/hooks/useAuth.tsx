
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Mock user type
interface User {
  id: string;
  email: string;
  name: string;
}

// Mock session type
interface Session {
  token: string;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // For development purposes, we'll auto-authenticate the user
  useEffect(() => {
    // Simulate a logged in user for development
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User'
    };
    
    const mockSession = {
      token: 'mock-session-token',
      user: mockUser
    };
    
    setUser(mockUser);
    setSession(mockSession);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }
      
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        name: 'Mock User'
      };
      
      const mockSession = {
        token: 'mock-session-token',
        user: mockUser
      };
      
      setUser(mockUser);
      setSession(mockSession);
      
      return { success: true, data: { user: mockUser, session: mockSession } };
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
      toast({
        title: "Authentication failed",
        description: err.message || "Failed to sign in",
        variant: "destructive"
      });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUser(null);
      setSession(null);
      
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
    } finally {
      setLoading(false);
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
