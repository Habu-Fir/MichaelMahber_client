import { useState, useEffect, useCallback } from 'react';
import systemService, { type FinancialSummary } from '../services/system.service';

export const useSystem = () => {
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalAvailable, setTotalAvailable] = useState(188021);

    const fetchFinancialSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await systemService.getFinancialSummary();
            setFinancialSummary(data);
            setTotalAvailable(data.totalAvailable);
        } catch (err: any) {
            // If 404, don't show error, just use default values
            if (err?.response?.status === 404) {
                console.warn('System endpoints not available yet, using default values');
                setFinancialSummary({
                    totalContributions: 188021,
                    totalInterest: 0,
                    totalAvailable: 188021
                });
                setError(null);
            } else {
                setError(err.message || 'Failed to fetch financial summary');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTotalAvailable = useCallback(async () => {
        try {
            const amount = await systemService.getTotalAvailable();
            setTotalAvailable(amount);
        } catch (err: any) {
            if (err?.response?.status !== 404) {
                console.error('Failed to fetch total available:', err);
            }
        }
    }, []);

    useEffect(() => {
        fetchFinancialSummary();
    }, [fetchFinancialSummary]);

    return {
        financialSummary,
        totalAvailable,
        loading,
        error,
        fetchFinancialSummary,
        fetchTotalAvailable
    };
};