
import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  HelpCircle, 
  Bell, 
  Search, 
  Menu, 
  X,
  LogOut,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfile } from '@/components/auth/services/authService';

// Define sidebar items with correct paths
const sidebarItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Teams', path: '/dashboard/teams' },
  { icon: FileText, label: 'Decisions', path: '/dashboard/decisions' },
  { icon: BarChart, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
];

interface DashboardLayoutProps {
  children: ReactNode;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
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
        
        try {
          const profileData = await getUserProfile(session.user.id);
          
          if (profileData) {
            setUser({
              ...profileData,
              email: session.user.email
            });
          } else {
            // If we couldn't get a profile, at least show the email
            setUser({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              avatar_url: null,
              email: session.user.email
            });
          }
        } catch (error) {
          console.error("Error loading user profile in DashboardLayout:", error);
          // Still show user with basic info
          setUser({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: null,
            email: session.user.email
          });
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [navigate]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing out."
      });
    }
  };
  
  // Function to check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Function to get user initials for the avatar
  const getUserInitials = (): string => {
    if (!user || !user.full_name) return 'U';
    
    const nameParts = user.full_name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <div className="flex h-screen bg-consensus-grey-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-consensus-grey-200 transition-all duration-300 ease-in-out">
        <div className="p-5 border-b border-consensus-grey-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-consensus-blue to-consensus-teal flex items-center justify-center">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="font-sf font-bold text-lg">ConsensusAI</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-5 px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-consensus-grey-600 hover:bg-consensus-grey-100 hover:text-consensus-blue transition-colors ${
                    isPathActive(item.path) ? 'bg-consensus-blue/10 text-consensus-blue font-medium' : ''
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t border-consensus-grey-200">
          <div className="flex items-center px-3 py-2">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-consensus-grey-300 flex items-center justify-center text-consensus-grey-600 mr-3 animate-pulse">
                <User size={16} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-consensus-grey-300 flex items-center justify-center text-consensus-grey-600 mr-3">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span>{getUserInitials()}</span>
                )}
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-sm font-medium">{loading ? 'Loading...' : (user?.full_name || 'User')}</h4>
              <p className="text-xs text-consensus-grey-500">{loading ? '' : (user?.email || '')}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-consensus-grey-500 hover:text-consensus-grey-700 rounded-full hover:bg-consensus-grey-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in-left">
            <div className="flex items-center justify-between p-5 border-b border-consensus-grey-200">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-consensus-blue to-consensus-teal flex items-center justify-center">
                  <span className="text-white font-bold text-base">C</span>
                </div>
                <span className="font-sf font-bold text-lg">ConsensusAI</span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full text-consensus-grey-500 hover:bg-consensus-grey-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="py-5 px-3">
              <ul className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-consensus-grey-600 hover:bg-consensus-grey-100 hover:text-consensus-blue transition-colors ${
                        isPathActive(item.path) ? 'bg-consensus-blue/10 text-consensus-blue font-medium' : ''
                      }`}
                      onClick={toggleSidebar}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 mt-auto border-t border-consensus-grey-200">
              <div className="flex items-center px-3 py-2">
                {loading ? (
                  <div className="w-10 h-10 rounded-full bg-consensus-grey-300 flex items-center justify-center text-consensus-grey-600 mr-3 animate-pulse">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-consensus-grey-300 flex items-center justify-center text-consensus-grey-600 mr-3">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span>{getUserInitials()}</span>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{loading ? 'Loading...' : (user?.full_name || 'User')}</h4>
                  <p className="text-xs text-consensus-grey-500">{loading ? '' : (user?.email || '')}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-consensus-grey-500 hover:text-consensus-grey-700 rounded-full hover:bg-consensus-grey-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-consensus-grey-200 flex items-center px-4 lg:px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-consensus-grey-500 hover:bg-consensus-grey-100 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1 flex items-center ml-4 md:ml-0">
            <div className="relative">
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 rounded-full text-consensus-grey-500 hover:bg-consensus-grey-100"
              >
                <Search size={20} />
              </button>
              
              <div className="hidden md:flex items-center bg-consensus-grey-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-consensus-blue/40">
                <Search size={18} className="text-consensus-grey-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none focus:outline-none text-sm ml-2 w-44 lg:w-64"
                />
              </div>
              
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-lg shadow-lg animate-fade-in md:hidden">
                  <div className="flex items-center bg-consensus-grey-100 rounded-xl px-3 py-2">
                    <Search size={18} className="text-consensus-grey-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full text-consensus-grey-500 hover:bg-consensus-grey-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-consensus-blue rounded-full"></span>
            </button>
            <button className="p-2 rounded-full text-consensus-grey-500 hover:bg-consensus-grey-100">
              <HelpCircle size={20} />
            </button>
            {!loading && user && (
              <div className="w-8 h-8 rounded-full bg-consensus-grey-300 md:hidden flex items-center justify-center text-consensus-grey-600 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{getUserInitials()}</span>
                )}
              </div>
            )}
          </div>
        </header>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
