import api from './api';

export const testConnection = async () => {
    try {
        const response = await api.get('/health');
        console.log('✅ Backend connection successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        throw error;
    }
};