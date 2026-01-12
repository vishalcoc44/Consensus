
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  HelpCircle,
  Menu
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { AppSidebar } from "./AppSidebar"
import { useToast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
              <NotificationBell />
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
