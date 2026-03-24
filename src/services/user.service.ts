import api from './api';
import type { User, CreateUserData, UpdateUserData, UserFilters, UsersResponse } from '../types/user.types';

export interface UserStats {
    total: number;
    byRole: Array<{
        _id: string;
        count: number;
        active: number;
        inactive: number;
    }>;
}

class UserService {
    private baseUrl = '/users';

    // ==================== GET ALL USERS ====================
    async getUsers(filters?: UserFilters): Promise<UsersResponse> {
        const params = new URLSearchParams();

        if (filters?.role) params.append('role', filters.role);
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));

        const response = await api.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    // ==================== GET SINGLE USER ====================
    async getUserById(id: string): Promise<User> {
        const response = await api.get(`${this.baseUrl}/${id}`);
        return response.data.data;
    }

    // ==================== CREATE USER ====================
    async createUser(data: CreateUserData): Promise<{ user: User; temporaryPassword: string }> {
        const response = await api.post(this.baseUrl, data);
        return response.data.data;
    }

    // ==================== UPDATE USER ====================
    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        const response = await api.put(`${this.baseUrl}/${id}`, data);
        return response.data.data;
    }

    // ==================== TOGGLE USER STATUS ====================
    async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
        const response = await api.patch(`${this.baseUrl}/${id}/status`, { isActive });
        return response.data.data;
    }

    // ==================== DELETE USER ====================
    async deleteUser(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }

    // ==================== RESET PASSWORD ====================
    async resetPassword(id: string): Promise<{ email: string; temporaryPassword: string }> {
        const response = await api.post(`${this.baseUrl}/${id}/reset-password`);
        return response.data.data;
    }

    // ==================== GET USER STATISTICS ====================
    /**
     * Get user statistics for dashboard
     * Returns total users and breakdown by role
     */
    async getUserStats(): Promise<UserStats> {
        const response = await api.get(`${this.baseUrl}/stats`);
        return response.data.data;
    }

    // ==================== GET ACTIVE MEMBERS (NEW) ====================
    /**
     * Get all active members (for contribution generation)
     */
    async getActiveMembers(): Promise<User[]> {
        const response = await api.get(`${this.baseUrl}`, {
            params: {
                isActive: true,
                limit: 1000 // Get all active members
            }
        });
        return response.data.data;
    }

    // ==================== GET USERS BY ROLE (NEW) ====================
    /**
     * Get users filtered by role
     */
    async getUsersByRole(role: string): Promise<User[]> {
        const response = await api.get(`${this.baseUrl}`, {
            params: {
                role,
                limit: 1000
            }
        });
        return response.data.data;
    }
}

export default new UserService();