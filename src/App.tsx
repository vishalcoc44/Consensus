import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { UserProvider } from "@/contexts/UserContext";
import { TeamProvider } from "@/contexts/TeamContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import NotFound from "./pages/NotFound";
import Teams from "./pages/Teams";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Decisions from "./pages/Decisions";
import ActivityLog from "./pages/ActivityLog";
import Templates from "./pages/Templates";
import Notifications from "./pages/Notifications";
import Resources from "./pages/Resources";
import AIInsights from "./pages/AIInsights";
import DecisionCalendar from "./pages/DecisionCalendar";
import Goals from "./pages/Goals";
import MeetingRooms from "./pages/MeetingRooms";
import MeetingRoom from "./pages/MeetingRoom";

// Error boundary component
// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}


console.log("App.tsx is being loaded");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});



// Layout wrapper component
const DashboardLayoutWrapper = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
      variant: "destructive"
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayoutWrapper />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/teams" element={<Teams />} />
          <Route path="/dashboard/decisions" element={<Decisions />} />
          <Route path="/dashboard/create-proposal" element={<CreateProposal />} />
          <Route path="/dashboard/proposals/:proposalId" element={<ProposalDetails />} />
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/resources" element={<Resources />} />
          <Route path="/dashboard/ai-insights" element={<AIInsights />} />
          <Route path="/dashboard/calendar" element={<DecisionCalendar />} />
          <Route path="/dashboard/goals" element={<Goals />} />
          <Route path="/dashboard/meetings" element={<MeetingRooms />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/analytics/:proposalId" element={<Analytics />} />
          <Route path="/dashboard/activity" element={<ActivityLog />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Protected Route Component specifically moved out to avoid recreation on every render
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserProvider>
            <TeamProvider>
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </TeamProvider>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
