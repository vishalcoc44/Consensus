import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './../styles/Dashboard.css';
import './../styles/Sidebar.css';
import { FiHome, FiUsers, FiClipboard, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import { Sidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import { motion } from 'framer-motion';
import Logo from './Logo'; // Import the main Logo component
import LogoIcon from './LogoIcon'; // Import the main LogoIcon component

interface User {
  full_name: string;
  email: string | undefined;
}

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
        if (!supabase) return; // Guard clause
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/signin');
            return;
        }
        setUser({
            full_name: session.user.user_metadata.full_name,
            email: session.user.email,
        });
    };

    fetchUser();

    if (supabase) { // Guard clause
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/signin');
        }
      });
  
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [navigate]);

  const handleLogout = async () => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot log out.");
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
    }
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <FiHome className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Teams",
      href: "/teams",
      icon: <FiUsers className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Decisions",
      href: "/decisions",
      icon: <FiClipboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <FiTrendingUp className="h-5 w-5 shrink-0" />,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: <FiSettings className="h-5 w-5 shrink-0" />,
    },
  ];

  if (!user) {
    return <div>Loading...</div>; // Or a proper loader
  }

  return (
    <div className="dashboard-container">
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {links.map((link, idx) => (
                        <SidebarLink 
                            key={idx} 
                            link={link} 
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(link.href);
                            }}
                            className={location.pathname === link.href ? 'active' : ''}
                        />
                        ))}
                    </div>
                </div>
                <div>
                    <SidebarLink
                        link={{
                            label: user.full_name,
                            href: "#",
                            icon: (
                                <div className="user-avatar-small">
                                    {user.full_name?.substring(0, 2).toUpperCase() || '??'}
                                </div>
                            ),
                        }}
                    />
                     <SidebarLink
                        link={{
                            label: "Logout",
                            href: "#",
                            icon: <FiLogOut className="h-5 w-5 shrink-0" />,
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                    />
                </div>
            </SidebarBody>
        </Sidebar>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="main-content"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default Layout; 