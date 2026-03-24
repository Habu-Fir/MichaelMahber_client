/**
 * =========================
 * 👑 Admin Contribution Hook
 * =========================
 * Handles all admin/super admin contribution operations
 * - View all contributions
 * - Generate monthly contributions
 * - Verify receipts
 * - Get contribution summary
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import contributionService from '../services/contribution.service';
import type {
    Contribution,
    ContributionSummary,
    ContributionFilters,
} from '../types/contribution.types';

export const useAdminContributions = () => {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [summary, setSummary] = useState<ContributionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const { isSuperAdmin, isAdmin } = useAuth();
    const hasPermission = isSuperAdmin || isAdmin;

    /**
     * Fetch all contributions with filters
     */
    const fetchContributions = useCallback(async (filters?: ContributionFilters) => {
        if (!hasPermission) {
            setError('Not authorized');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await contributionService.getAllContributions(filters);
            setContributions(response.data);
            setTotal(response.total);
            setPage(response.page);
            setPages(response.pages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch contributions');
            console.error('Fetch contributions error:', err);
        } finally {
            setLoading(false);
        }
    }, [hasPermission]);

    /**
     * Fetch contribution summary (total collected, monthly breakdown, pending verifications)
     */
    const fetchSummary = useCallback(async (year?: number) => {
        if (!hasPermission) {
            setError('Not authorized');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await contributionService.getContributionSummary(year);
            setSummary(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch summary');
            console.error('Fetch summary error:', err);
        } finally {
            setLoading(false);
        }
    }, [hasPermission]);

    /**
     * Generate monthly contributions for all active members
     * Only Super Admin can do this
     */
    const generateMonthly = useCallback(async (month: number, year: number) => {
        if (!isSuperAdmin) {
            setError('Only Super Admin can generate contributions');
            throw new Error('Not authorized');
        }

        setLoading(true);
        setError(null);

        try {
            const result = await contributionService.generateMonthlyContributions({ month, year });
            // Refresh data after generation
            await fetchContributions({ month, year });
            await fetchSummary(year);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to generate contributions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin, fetchContributions, fetchSummary]);

    /**
     * Verify a contribution (mark as paid)
     * Only Super Admin can do this
     */
    const verify = useCallback(async (contributionId: string, notes?: string) => {
        if (!isSuperAdmin) {
            setError('Only Super Admin can verify contributions');
            throw new Error('Not authorized');
        }

        setLoading(true);
        setError(null);

        try {
            const verified = await contributionService.verifyContribution(contributionId, { notes });
            // Update contribution in list
            setContributions(prev =>
                prev.map(c => c._id === contributionId ? verified : c)
            );
            // Refresh summary
            if (summary) {
                await fetchSummary(summary.year);
            }
            return verified;
        } catch (err: any) {
            setError(err.message || 'Failed to verify contribution');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin, summary, fetchSummary]);

    /**
     * Get contribution statistics for dashboard
     */
    const getDashboardStats = useCallback(() => {
        if (!summary) return null;

        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = summary.monthlyBreakdown.find(m => m.month === currentMonth);

        return {
            totalCollected: summary.totalCollected,
            totalPayments: summary.totalPayments,
            pendingVerifications: summary.pendingVerifications,
            currentMonthCollected: currentMonthData?.total || 0,
            currentMonthCount: currentMonthData?.count || 0,
            monthlyAverage: summary.totalCollected / (summary.monthlyBreakdown.length || 1)
        };
    }, [summary]);

    /**
     * Format month number to month name
     */
    const getMonthName = useCallback((month: number): string => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
    }, []);

    /**
     * Go to specific page for pagination
     */
    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pages) {
            fetchContributions({ page: newPage, limit: 20 });
        }
    }, [pages, fetchContributions]);

    return {
        contributions,
        summary,
        loading,
        error,
        total,
        page,
        pages,
        hasPermission,
        fetchContributions,
        fetchSummary,
        generateMonthly,
        verify,
        getDashboardStats,
        getMonthName,
        goToPage
    };
};