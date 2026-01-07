
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  HelpCircle,
  Menu
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/components/auth/services/authService';
import { AppSidebar } from "./AppSidebar"
import { useToast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("No session in DashboardLayout, redirecting to login");
          navigate('/login');
          return;
        }

        const profileData = await getUserProfile(session.user.id);

        if (profileData) {
          setUser({
            ...profileData,
            email: session.user.email
          });
        } else {
          setUser({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: null,
            email: session.user.email
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-4 shadow-sm">
          <div className="flex-1 flex items-center justify-end md:justify-between ml-0 md:ml-4">
            <div className="hidden md:flex items-center bg-muted/50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-200 border border-transparent focus-within:border-primary/20 w-64">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted relative transition-colors duration-200">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              </button>
              <button className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-200">
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
