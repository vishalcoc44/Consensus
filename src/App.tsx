
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { typedSupabase } from "@/utils/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { logAuthEvent } from "@/utils/auditLogger";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Teams from "./pages/Teams";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Decisions from "./pages/Decisions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App.tsx: Setting up auth state listener");
    
    // First set up auth state listener to catch any auth changes
    const { data: { subscription } } = typedSupabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        
        if (newSession) {
          console.log("User authenticated:", newSession.user.email);
          logAuthEvent('auth_state_change', { event, user: newSession.user.id });
          
          // Refresh the query cache when auth state changes
          queryClient.invalidateQueries();
        } else {
          console.log("User signed out");
          logAuthEvent('auth_state_change', { event, user: null });
        }
      }
    );

    // Then check for current session
    typedSupabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Logged in" : "Not logged in");
      setSession(currentSession);
      setLoading(false);
    }).catch(error => {
      console.error("Error checking session:", error);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-consensus-dark-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-green"></div>
        </div>
      );
    }
    
    if (!session) {
      console.log("Access denied: No session found");
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive"
      });
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Log the session state for debugging
  console.log("Current auth state:", loading ? "Loading..." : (session ? "Authenticated" : "Not authenticated"));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/teams" element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/decisions" element={
              <ProtectedRoute>
                <Decisions />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/proposals/create" element={
              <ProtectedRoute>
                <CreateProposal />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/proposals/:proposalId" element={
              <ProtectedRoute>
                <ProposalDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics/:proposalId" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
