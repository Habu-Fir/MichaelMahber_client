import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        address?: string;
        isFirstLogin?: boolean;
    };
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

class AuthService {
    private tokenKey = 'token';
    private userKey = 'user';
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            console.log('🔐 Attempting login for:', credentials.email);
            console.log('📡 API URL:', api.defaults.baseURL);

            const response = await api.post<AuthResponse>('/auth/login', credentials);

            console.log('✅ Login response:', response.data);

            if (response.data.success && response.data.token) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
            }

            return response.data;
        } catch (error: any) {
            // Log the full error details
            console.error('❌ Login error details:');

            if (error.response) {
                // The server responded with an error status
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
            }

            throw error;
        }
    }

    // Change password (for first login)
    async changePassword(data: ChangePasswordData): Promise<{ success: boolean; token?: string }> {
        try {
            const response = await api.post('/auth/change-password', data);

            if (response.data.token) {
                this.setToken(response.data.token);
            }

            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    // Logout
    async logout(): Promise<void> {
        try {
            await api.get('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
            this.clearUser();
        }
    }

    // Get current user from backend
    async getCurrentUser(): Promise<any> {
        try {
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            this.clearToken();
            this.clearUser();
            throw error;
        }
    }

    // Token management
    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    clearToken(): void {
        localStorage.removeItem(this.tokenKey);
    }

    setUser(user: any): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getUser(): any | null {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    clearUser(): void {
        localStorage.removeItem(this.userKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    hasRole(roles: string[]): boolean {
        const user = this.getUser();
        if (!user) return false;
        return roles.includes(user.role);
    }
}

export default new AuthService();