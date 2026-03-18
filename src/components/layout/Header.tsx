import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Menu,
    Bell,
    ChevronDown,
    LogOut,
    Settings,
    UserCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
    onMenuClick: () => void;
    title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className={cn(
            "fixed top-0 right-0 left-0 lg:left-72 z-30",
            "bg-white/80 backdrop-blur-md border-b border-gray-200",
            "transition-all duration-300"
        )}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">

                    {/* Left section - Menu button and title */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Menu button - visible on mobile only */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Page title */}
                        <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
                            {title}
                        </h1>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            </button>

                            {/* Notifications dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="p-4 hover:bg-gray-50 border-b border-gray-50">
                                            <p className="text-sm font-medium text-gray-800">New loan request</p>
                                            <p className="text-xs text-gray-500 mt-1">Abebe requested 20,000 ETB</p>
                                            <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                                        </div>
                                        <div className="p-4 hover:bg-gray-50 border-b border-gray-50">
                                            <p className="text-sm font-medium text-gray-800">Payment approved</p>
                                            <p className="text-xs text-gray-500 mt-1">Your payment of 2,000 ETB was approved</p>
                                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-100">
                                        <button className="text-sm text-primary-600 font-medium w-full text-center">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </div>

                                {/* User info - hidden on mobile */}
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Member'}</p>
                                </div>

                                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500" />
                            </button>

                            {/* User dropdown menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    {/* User info - visible on mobile */}
                                    <div className="lg:hidden p-4 border-b border-gray-100">
                                        <p className="font-medium text-gray-800">{user?.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                                        <p className="text-xs text-primary-600 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/profile');
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            <UserCircle className="w-5 h-5 text-gray-400" />
                                            <span>Profile</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/settings');
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            <Settings className="w-5 h-5 text-gray-400" />
                                            <span>Settings</span>
                                        </button>

                                        <div className="border-t border-gray-100 my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;