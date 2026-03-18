import api from './api';
import type { User, CreateUserData, UpdateUserData, UserFilters, UsersResponse } from '../types/user.types';

class UserService {
    private baseUrl = '/users';

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

    async getUserById(id: string): Promise<User> {
        const response = await api.get(`${this.baseUrl}/${id}`);
        return response.data.data;
    }

    async createUser(data: CreateUserData): Promise<{ user: User; temporaryPassword: string }> {
        const response = await api.post(this.baseUrl, data);
        return response.data.data;
    }

    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        const response = await api.put(`${this.baseUrl}/${id}`, data);
        return response.data.data;
    }

    async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
        const response = await api.patch(`${this.baseUrl}/${id}/status`, { isActive });
        return response.data.data;
    }

    async deleteUser(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }

    async resetPassword(id: string): Promise<{ email: string; temporaryPassword: string }> {
        const response = await api.post(`${this.baseUrl}/${id}/reset-password`);
        return response.data.data;
    }

    async getUserStats(): Promise<any> {
        const response = await api.get(`${this.baseUrl}/stats`);
        return response.data.data;
    }
}

export default new UserService();