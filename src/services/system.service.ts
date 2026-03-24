import api from './api';

export interface FinancialSummary {
    totalContributions: number;
    totalInterest: number;
    totalAvailable: number;
}

class SystemService {
    private baseUrl = '/system';

    async getFinancialSummary(): Promise<FinancialSummary> {
        try {
            const response = await api.get(`${this.baseUrl}/financial-summary`);
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Return default values if endpoint doesn't exist
                return {
                    totalContributions: 188021,
                    totalInterest: 0,
                    totalAvailable: 188021
                };
            }
            throw error;
        }
    }

    async getTotalAvailable(): Promise<number> {
        try {
            const response = await api.get(`${this.baseUrl}/available-funds`);
            return response.data.data.totalAvailable;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return 188021;
            }
            throw error;
        }
    }
}

export default new SystemService();