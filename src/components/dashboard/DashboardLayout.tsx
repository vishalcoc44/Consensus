
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
import { signOut } from '@/components/auth/services/authService';
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
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
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

        console.log("Dashboard - Current session:", {
          userId: session.user.id,
          expiresAt: new Date(session.expires_at * 1000).toLocaleString()
        });

        const userEmail = session.user.email;

        try {
          // Fetch pending invites count
          if (userEmail) {
            const { count, error: invitesError } = await supabase
              .from('team_invites')
              .select('*', { count: 'exact', head: true })
              .eq('email', userEmail)
              .eq('status', 'pending');

            if (!invitesError) {
              setPendingInvitesCount(count || 0);
            }
          }

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
      await signOut();
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
    if (path === '/dashboard') {
      return location.pathname === path;
    }
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
    <div className="flex h-screen bg-consensus-dark-500">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-consensus-dark-400 border-r border-consensus-dark-300 transition-all duration-300 ease-in-out shadow-lg z-20 ${isSidebarHovered ? 'w-64' : 'w-20'
          }`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="p-5 border-b border-consensus-dark-300 h-20 flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 group w-full overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-consensus-green to-consensus-teal flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all duration-300">
              <span className="text-consensus-dark-800 font-bold text-xl">C</span>
            </div>
            <span className={`font-sf font-bold text-lg text-white whitespace-nowrap transition-opacity duration-300 ${isSidebarHovered ? 'opacity-100 delay-100' : 'opacity-0 w-0'
              }`}>
              ConsensusAI
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-consensus-grey-300 hover:bg-consensus-dark-300 hover:text-consensus-green transition-all duration-200 group ${isPathActive(item.path) ? 'bg-consensus-dark-300 text-consensus-green font-medium' : ''
                    }`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-6 relative">
                    <item.icon size={22} className={isPathActive(item.path) ? 'text-consensus-green' : 'group-hover:text-consensus-green'} />
                    {item.label === 'Teams' && pendingInvitesCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-consensus-dark-400"></span>
                    )}
                  </div>
                  <span className={`whitespace-nowrap transition-opacity duration-300 flex items-center justify-between flex-1 ${isSidebarHovered ? 'opacity-100 delay-75' : 'opacity-0 w-0 hidden'
                    }`}>
                    {item.label}
                    {item.label === 'Teams' && pendingInvitesCount > 0 && (
                      <span className="ml-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingInvitesCount}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-consensus-dark-300">
          <div className={`flex items-center ${isSidebarHovered ? 'justify-start' : 'justify-center'} py-1 transition-all duration-300`}>
            <div
              className="flex items-center flex-1 min-w-0 cursor-pointer group/profile"
              onClick={() => navigate('/dashboard/settings')}
            >
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-consensus-dark-300 flex items-center justify-center text-consensus-grey-300 animate-pulse flex-shrink-0">
                  <User size={16} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-consensus-dark-300 flex items-center justify-center text-consensus-grey-300 border border-consensus-green/30 flex-shrink-0 group-hover/profile:border-consensus-green transition-colors">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="font-medium text-consensus-green">{getUserInitials()}</span>
                  )}
                </div>
              )}

              <div className={`flex-1 ml-3 overflow-hidden transition-all duration-300 ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}>
                <h4 className="text-sm font-medium text-white truncate group-hover/profile:text-consensus-green transition-colors">{loading ? 'Loading...' : (user?.full_name || 'User')}</h4>
                <p className="text-xs text-consensus-grey-400 truncate w-32">{loading ? '' : (user?.email || '')}</p>
              </div>
            </div>

            {isSidebarHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                className="p-2 ml-1 text-consensus-grey-400 hover:text-red-400 rounded-full hover:bg-consensus-dark-300 transition-colors duration-200 flex-shrink-0 animate-fade-in"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-consensus-dark-900/70 backdrop-blur-sm" onClick={toggleSidebar}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-consensus-dark-400 shadow-xl animate-slide-in-left border-r border-consensus-dark-300">
            <div className="flex items-center justify-between p-5 border-b border-consensus-dark-300">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-consensus-green to-consensus-teal flex items-center justify-center">
                  <span className="text-consensus-dark-800 font-bold text-base">C</span>
                </div>
                <span className="font-sf font-bold text-lg text-white">ConsensusAI</span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full text-consensus-grey-400 hover:text-consensus-green hover:bg-consensus-dark-300"
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-consensus-grey-300 hover:bg-consensus-dark-300 hover:text-consensus-green transition-all duration-200 ${isPathActive(item.path) ? 'bg-consensus-dark-300 text-consensus-green font-medium' : ''
                        }`}
                      onClick={toggleSidebar}
                    >
                      <item.icon size={20} className={isPathActive(item.path) ? 'text-consensus-green' : ''} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 mt-auto border-t border-consensus-dark-300">
              <div
                className="flex items-center px-3 py-2 cursor-pointer group/profile"
                onClick={() => {
                  toggleSidebar();
                  navigate('/dashboard/settings');
                }}
              >
                {loading ? (
                  <div className="w-10 h-10 rounded-full bg-consensus-dark-300 flex items-center justify-center text-consensus-grey-300 mr-3 animate-pulse">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-consensus-dark-300 flex items-center justify-center text-consensus-grey-300 mr-3 border border-consensus-green/30 group-hover/profile:border-consensus-green transition-colors">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-consensus-green">{getUserInitials()}</span>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white group-hover/profile:text-consensus-green transition-colors">{loading ? 'Loading...' : (user?.full_name || 'User')}</h4>
                  <p className="text-xs text-consensus-grey-400">{loading ? '' : (user?.email || '')}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOut();
                  }}
                  className="p-2 text-consensus-grey-400 hover:text-red-400 rounded-full hover:bg-consensus-dark-300 transition-colors duration-200"
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
        <header className="h-16 bg-consensus-dark-400 border-b border-consensus-dark-300 flex items-center px-4 lg:px-6 shadow-md">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-consensus-grey-400 hover:text-consensus-green hover:bg-consensus-dark-300 md:hidden transition-colors duration-200"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 flex items-center ml-4 md:ml-0">
            <div className="relative">
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 rounded-full text-consensus-grey-400 hover:text-consensus-green hover:bg-consensus-dark-300 transition-colors duration-200"
              >
                <Search size={20} />
              </button>

              <div className="hidden md:flex items-center bg-consensus-dark-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-consensus-green/40 transition-all duration-200">
                <Search size={18} className="text-consensus-grey-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none focus:outline-none text-sm ml-2 w-44 lg:w-64 text-white placeholder:text-consensus-grey-500"
                />
              </div>

              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-consensus-dark-300 rounded-lg shadow-lg animate-fade-in md:hidden border border-consensus-dark-200">
                  <div className="flex items-center bg-consensus-dark-200 rounded-xl px-3 py-2">
                    <Search size={18} className="text-consensus-grey-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-white placeholder:text-consensus-grey-500"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full text-consensus-grey-400 hover:text-consensus-green hover:bg-consensus-dark-300 relative transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-consensus-green rounded-full animate-pulse"></span>
            </button>
            <button className="p-2 rounded-full text-consensus-grey-400 hover:text-consensus-green hover:bg-consensus-dark-300 transition-colors duration-200">
              <HelpCircle size={20} />
            </button>
            {!loading && user && (
              <div className="w-8 h-8 rounded-full bg-consensus-dark-300 md:hidden flex items-center justify-center text-consensus-grey-300 overflow-hidden border border-consensus-green/30">
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
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-consensus-dark-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
