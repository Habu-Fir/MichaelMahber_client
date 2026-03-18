import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Get page title based on current route
  const getPageTitle = (pathname: string): string => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/loans')) return 'Loans';
    if (pathname.includes('/contributions')) return 'Contributions';
    if (pathname.includes('/members')) return 'Members';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/pending-payments')) return 'Pending Payments';
    if (pathname.includes('/reports')) return 'Reports';
    return 'Mahber Hub';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "lg:ml-72" // Leave space for sidebar on desktop
      )}>
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle(location.pathname)}
        />
        
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;