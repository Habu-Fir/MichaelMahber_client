import api from './api';

export interface FinancialSummary {
    existingPool: number;
    totalContributions: number;
    totalInterest: number;
    totalAvailable: number;
}

class SystemService {
    private baseUrl = '/system';

    /**
     * Get financial summary
     */
    async getFinancialSummary(): Promise<FinancialSummary> {
        const response = await api.get(`${this.baseUrl}/financial-summary`);
        return response.data.data;
    }

    /**
     * Get total available funds
     */
    async getTotalAvailable(): Promise<number> {
        const response = await api.get(`${this.baseUrl}/available-funds`);
        return response.data.data.totalAvailable;
    }
}

export default new SystemService();