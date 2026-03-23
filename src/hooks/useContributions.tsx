/**
 * =========================
 * 📊 Member Contribution Hook
 * =========================
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import  contributionService from '../services/contribution.service';
import type { Contribution, ContributionStats } from '../types/contribution.types';

export const useContributions = () => {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [stats, setStats] = useState<ContributionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    /**
     * Fetch current user's contributions
     */
    const fetchMyContributions = useCallback(async () => {
        if (!user?._id) {
            console.log('No user ID found, skipping fetch');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await contributionService.getMyContributions();
            console.log('Fetched contributions:', data.contributions.length);
            setContributions(data.contributions);
            setStats(data.stats);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch contributions';
            setError(errorMessage);
            console.error('Fetch contributions error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    /**
     * Upload receipt for a contribution
     */
    const uploadReceipt = useCallback(async (contributionId: string, file: File) => {
        setLoading(true);
        setError(null);

        try {
            const result = await contributionService.uploadReceipt(contributionId, file);
            console.log('Upload successful:', result);
            // Refresh contributions after upload
            await fetchMyContributions();
            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to upload receipt';
            setError(errorMessage);
            console.error('Upload receipt error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchMyContributions]);

    /**
     * Check if user can upload receipt for a contribution
     */
    const canUpload = useCallback((contribution: Contribution): boolean => {
        // Safety checks
        if (!contribution) {
            console.log('canUpload: No contribution provided');
            return false;
        }

        if (!user?._id) {
            console.log('canUpload: No user logged in');
            return false;
        }

        // Check if memberId exists and matches
        const memberId = contribution.memberId?._id || contribution.memberId;
        const isOwner = memberId === user._id;

        // Check status
        const isPending = contribution.status === 'pending';

        // Check if receipt already exists
        const noReceipt = !contribution.receipt;

        const result = isOwner && isPending && noReceipt;

        console.log('canUpload check:', {
            contributionId: contribution._id,
            memberId: memberId,
            userId: user._id,
            isOwner,
            status: contribution.status,
            isPending,
            hasReceipt: !!contribution.receipt,
            noReceipt,
            result
        });

        return result;
    }, [user?._id]);

    /**
     * Get month name from month number
     */
    const getMonthName = useCallback((month: number): string => {
        return contributionService.getMonthName(month);
    }, []);

    /**
     * Get status display info
     */
    const getStatusDisplay = useCallback((status: string) => {
        return {
            text: contributionService.getStatusText(status),
            color: contributionService.getStatusColor(status)
        };
    }, []);

    /**
     * Get contributions grouped by year
     */
    const getGroupedByYear = useCallback((): Map<number, Contribution[]> => {
        const grouped = new Map<number, Contribution[]>();

        contributions.forEach(contribution => {
            const year = contribution.year;
            if (!grouped.has(year)) {
                grouped.set(year, []);
            }
            grouped.get(year)!.push(contribution);
        });

        return grouped;
    }, [contributions]);

    /**
     * Get recent contributions (last 6 months)
     */
    const getRecentContributions = useCallback((): Contribution[] => {
        return [...contributions]
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            })
            .slice(0, 6);
    }, [contributions]);

    // Auto-fetch on mount
    useEffect(() => {
        if (user?._id) {
            console.log('Auto-fetching contributions for user:', user._id);
            fetchMyContributions();
        } else {
            console.log('No user logged in, skipping auto-fetch');
        }
    }, [user?._id, fetchMyContributions]);

    return {
        contributions,
        stats,
        loading,
        error,
        fetchMyContributions,
        uploadReceipt,
        canUpload,
        getMonthName,
        getStatusDisplay,
        getGroupedByYear,
        getRecentContributions
    };
};