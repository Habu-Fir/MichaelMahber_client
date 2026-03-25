import {
    LayoutDashboard,
    HandCoins,
    History,
    Users,
    UserCircle,
    Settings,
    Receipt,
    Clock,
    Wallet,  // Add this import for My Contributions
} from 'lucide-react';
import type { NavItem, UserDropdownItem } from '../types/navigation.types';

// Main navigation items - role-based visibility
export const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'admin', 'approver', 'member']  // Add roles
    },
    {
        name: 'My Contributions',  // NEW - For all users to see their own contributions
        path: '/my-contributions',
        icon: Wallet,
        roles: ['super_admin', 'admin', 'approver', 'member']
    },
    {
        name: 'Loans',
        path: '/loans',
        icon: HandCoins,
        roles: ['super_admin', 'admin', 'approver', 'member']
    },
    {
        name: 'Contributions Management',  // Changed name and path for admins only
        path: '/contributions',
        icon: History,
        roles: ['super_admin', 'admin']  // Only admins can manage all contributions
    },
    {
        name: 'Members',
        path: '/members',
        icon: Users,
        roles: ['super_admin', 'admin']
    },
    {
        name: 'Pending Payments',
        path: '/pending-payments',
        icon: Clock,
        roles: ['super_admin']
    },
    {
        name: 'Pending Loans',
        path: '/pending-loans',
        icon: Clock,
        roles: ['approver', 'super_admin']  // Removed 'member' - members don't need this
    },
    {
        name: 'Reports',
        path: '/reports',
        icon: Receipt,
        roles: ['super_admin', 'admin']
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: ['super_admin']
    },
];

// User dropdown items
export const userDropdownItems: UserDropdownItem[] = [
    {
        name: 'Profile',
        path: '/profile',
        icon: UserCircle,
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
    },
];