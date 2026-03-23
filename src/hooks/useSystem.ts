import { useState, useEffect, useCallback } from 'react';
import  systemService, { type FinancialSummary } from '../services/system.service';

export const useSystem = () => {
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalAvailable, setTotalAvailable] = useState(0);

    const fetchFinancialSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await systemService.getFinancialSummary();
            setFinancialSummary(data);
            setTotalAvailable(data.totalAvailable);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch financial summary');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTotalAvailable = useCallback(async () => {
        try {
            const amount = await systemService.getTotalAvailable();
            setTotalAvailable(amount);
        } catch (err: any) {
            console.error('Failed to fetch total available:', err);
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