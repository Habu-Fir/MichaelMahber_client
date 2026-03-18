export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'approver' | 'member';
    phone: string;
    address?: string;
    profilePicture?: string;
    isActive: boolean;
    joinedDate: string;
    lastLogin?: string;
    createdBy?: {
        _id: string;
        name: string;
    };
}

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'member' | 'approver' | 'admin';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: string;
    isActive?: boolean;
}

export interface UserFilters {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    count: number;
    total: number;
    page: number;
    pages: number;
}

export const RoleColors: Record<string, { bg: string; text: string; label: string }> = {
    super_admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Super Admin' },
    admin: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Admin' },
    approver: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Approver' },
    member: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Member' }
};