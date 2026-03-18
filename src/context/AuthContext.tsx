import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    isFirstLogin?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (roles: string[]) => boolean;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isApprover: boolean;
    isMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            if (authService.isAuthenticated()) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authService.login({ email, password });
            setUser(response.user);

            if (response.user.isFirstLogin) {
                toast.success('Welcome! Please change your password.');
            } else {
                toast.success('Login successful!');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        toast.success('Logged out successfully');
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            setIsLoading(true);
            await authService.changePassword({ currentPassword, newPassword });

            // Reload user to update first login status
            const updatedUser = await authService.getCurrentUser();
            setUser(updatedUser);

            toast.success('Password changed successfully');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to change password';
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const hasRole = (roles: string[]) => authService.hasRole(roles);

    const value = {
        user,
        isLoading,
        login,
        logout,
        changePassword,
        isAuthenticated: !!user,
        hasRole,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isApprover: user?.role === 'approver',
        isMember: user?.role === 'member',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};