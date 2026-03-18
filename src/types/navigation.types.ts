import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    name: string;
    path: string;
    icon: LucideIcon;
    roles?: string[]; // If undefined, visible to all
}

export interface UserDropdownItem {
    name: string;
    path: string;
    icon: LucideIcon;
}