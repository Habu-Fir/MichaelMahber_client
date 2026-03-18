export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'approver' | 'member';
    phone?: string;
    address?: string;
    profilePicture?: string;
    isActive: boolean;
    joinedDate: string;
    lastLogin?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    isFirstLogin?: boolean;
}