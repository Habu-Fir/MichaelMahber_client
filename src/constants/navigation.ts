import {
    LayoutDashboard,
    HandCoins,
    History,
    Users,
    UserCircle,
    Settings,
    Receipt,
    Clock,
} from 'lucide-react';
import type { NavItem, UserDropdownItem } from '../types/navigation.types';

// Main navigation items - role-based visibility
export const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Loans',
        path: '/loans',
        icon: HandCoins,
    },
    {
        name: 'Contributions',
        path: '/contributions',
        icon: History,
    },
    {
        name: 'Members',
        path: '/members',
        icon: Users,
        roles: ['super_admin', 'admin'], // Only admins can see members
    },
    {
        name: 'Pending Payments',
        path: '/pending-payments',
        icon: Clock,
        roles: ['super_admin'], // Only super admin can approve payments
    },
    {
        name: 'Pending Loans',
        path: '/pending-loans',
        icon: Clock,
        roles: ['member', 'approver', 'super_admin'],
    },
    {
        name: 'Reports',
        path: '/reports',
        icon: Receipt,
        roles: ['super_admin', 'admin'],
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: ['super_admin'],
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