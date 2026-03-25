import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Filter, Eye, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import { useAuth } from '../../context/AuthContext';
import GenerateContributionsModal from '../../components/contributions/GenerateContributionsModal';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../lib/utils';
import type { ContributionStatus } from '../../types/contribution.types';

const AllContributions = () => {
    const navigate = useNavigate();
    const { user, isSuperAdmin, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [filters, setFilters] = useState({
        month: searchParams.get('month') || '',
        year: searchParams.get('year') || '',
        status: searchParams.get('status') || ''
    });
    
    const isInitialMount = useRef(true);

    const {
        contributions,
        loading,
        error,
        total,
        page,
        pages,
        fetchContributions,
        verify,
        getMonthName
    } = useAdminContributions();

    // Check if user has permission to view this page
    useEffect(() => {
        if (!isSuperAdmin && !isAdmin) {
            // Redirect members to their own contributions page
            navigate('/my-contributions', { replace: true });
        }
    }, [isSuperAdmin, isAdmin, navigate]);

    // If not authorized, show nothing while redirecting
    if (!isSuperAdmin && !isAdmin) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    const fetchWithFilters = useCallback(() => {
        fetchContributions({
            month: filters.month ? parseInt(filters.month) : undefined,
            year: filters.year ? parseInt(filters.year) : undefined,
            status: filters.status ? (filters.status as ContributionStatus) : undefined,
            page: 1,
            limit: 20
        });
    }, [filters.month, filters.year, filters.status, fetchContributions]);

    const updateUrlParams = useCallback(() => {
        const params: any = {};
        if (filters.month) params.month = filters.month;
        if (filters.year) params.year = filters.year;
        if (filters.status) params.status = filters.status;
        setSearchParams(params, { replace: true });
    }, [filters.month, filters.year, filters.status, setSearchParams]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchWithFilters();
            updateUrlParams();
            return;
        }
        
        fetchWithFilters();
        updateUrlParams();
    }, [fetchWithFilters, updateUrlParams]);

    const handleVerify = async (contributionId: string) => {
        if (window.confirm('Are you sure you want to verify this contribution?')) {
            try {
                await verify(contributionId);
                // Refresh after verification
                fetchWithFilters();
            } catch (error) {
                console.error('Verification failed:', error);
            }
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ month: '', year: '', status: '' });
    };

    const handleRefresh = () => {
        fetchWithFilters();
    };

    if (loading && contributions.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-semibold mb-2">Error Loading Contributions</p>
                    <p>{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Calculate pending verifications count
    const pendingVerificationsCount = contributions.filter(
        c => c.status === 'pending' && c.receipt
    ).length;

    // Calculate total amount
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contributions Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and verify member contributions
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        Generate Monthly
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Filters:</span>
                    </div>
                    
                    {/* Month Filter */}
                    <select
                        value={filters.month}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                                {getMonthName(month)}
                            </option>
                        ))}
                    </select>

                    {/* Year Filter */}
                    <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Years</option>
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>

                    {/* Clear Filters */}
                    {(filters.month || filters.year || filters.status) && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Total Contributions</p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Pending Verifications</p>
                    <p className="text-2xl font-bold text-amber-600">
                        {pendingVerificationsCount}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalAmount)}
                    </p>
                </div>
            </div>

            {/* Contributions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Month/Year
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Receipt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contributions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No contributions found
                                    </td>
                                </tr>
                            ) : (
                                contributions.map((contribution) => (
                                    <tr key={contribution._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {contribution.memberId.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {contribution.memberId.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getMonthName(contribution.month)} {contribution.year}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {formatCurrency(contribution.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                contribution.status === 'paid' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {contribution.status === 'paid' ? 'Paid ✓' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contribution.receipt ? (
                                                <a
                                                    href={contribution.receipt}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm">View</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No receipt</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {contribution.status === 'pending' && contribution.receipt && (
                                                <button
                                                    onClick={() => handleVerify(contribution._id)}
                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verify
                                                </button>
                                            )}
                                            {contribution.status === 'pending' && !contribution.receipt && (
                                                <span className="text-gray-400 text-sm">Awaiting receipt</span>
                                            )}
                                            {contribution.status === 'paid' && (
                                                <span className="text-green-600 text-sm flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {contributions.length} of {total} contributions
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchContributions({ page: page - 1 })}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Page {page} of {pages}
                            </span>
                            <button
                                onClick={() => fetchContributions({ page: page + 1 })}
                                disabled={page === pages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            {showGenerateModal && (
                <GenerateContributionsModal
                    isOpen={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    onSuccess={() => {
                        fetchWithFilters();
                    }}
                />
            )}
        </div>
    );
};

export default AllContributions;