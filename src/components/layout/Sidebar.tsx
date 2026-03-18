import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { navItems } from '../../constants/navigation';
import { X, Shield, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true; // No role restriction
        return user && item.roles.includes(user.role);
    });

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    return (
        <>
            {/* Mobile overlay - only shows when sidebar is open on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out",
                    "lg:shadow-none lg:z-40",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0" // Always visible on desktop
                )}
            >
                <div className="flex flex-col h-full">

                    {/* Header with logo and close button */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
                        <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-lg text-gray-800 block">Mahber Hub</span>
                                <span className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Member'}</span>
                            </div>
                        </Link>

                        {/* Close button - visible on mobile only */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation items */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-1">
                            {filteredNavItems.map((item) => {
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                            "hover:bg-gray-100",
                                            isActive
                                                ? "bg-primary-50 text-primary-700"
                                                : "text-gray-700"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-5 h-5",
                                            isActive ? "text-primary-600" : "text-gray-400"
                                        )} />
                                        <span className="flex-1">{item.name}</span>

                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="w-1.5 h-5 bg-primary-600 rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* User info and logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;