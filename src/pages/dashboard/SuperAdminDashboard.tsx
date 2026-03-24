import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    HandCoins,
    PiggyBank,
    Clock,
    Shield,
    DollarSign,
    Wallet,
    CheckCircle,
    Calendar,
    History
} from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import { useLoans } from '../../hooks/useLoans';
import { useUserStats } from '../../hooks/useUsers';
import { useSystem } from '../../hooks/useSystem';
import Loader from '../../components/common/Loader';
import GenerateContributionsModal from '../../components/contributions/GenerateContributionsModal';
import { formatCurrency } from '../../lib/utils';

// Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{message}</p>
        </div>
    </div>
);

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // System data
    const {
        financialSummary,
        loading: systemLoading,
        fetchFinancialSummary
    } = useSystem();

    // Contributions data
    const {
        loading: contributionsLoading,
        fetchSummary,
        getDashboardStats
    } = useAdminContributions();

    // Loans data
    const {
        data: loansData,
        isLoading: loansLoading,
        error: loansError,
        refetch: refetchLoans
    } = useLoans({ status: 'all' });

    // User stats
    const {
        data: userStats,
        isLoading: usersLoading,
        error: usersError,
        refetch: refetchUsers
    } = useUserStats();

    const getErrorMessage = (error: unknown, defaultMessage: string): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
        return defaultMessage;
    };

    // Calculate loan statistics
    const calculateLoanStats = () => {
        if (!loansData?.data) {
            return {
                activeLoans: 0,
                totalActiveLoanAmount: 0,
                totalInterestEarned: 0,
                pendingPaymentsCount: 0
            };
        }

        const loans = loansData.data;
        const activeLoans = loans.filter(l => l.status === 'active').length;
        const totalActiveLoanAmount = loans
            .filter(l => l.status === 'active')
            .reduce((sum, loan) => sum + (loan.remainingPrincipal || 0), 0);
        const totalInterestEarned = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0);
        const pendingPaymentsCount = loans
            .filter(loan => loan.pendingPayments?.some(p => p.status === 'pending'))
            .length;

        return { activeLoans, totalActiveLoanAmount, totalInterestEarned, pendingPaymentsCount };
    };

    const loanStats = calculateLoanStats();
    const contributionStats = getDashboardStats();

    // Calculate totals
    const totalPool = financialSummary?.totalAvailable || 188021;
    const remainingBalance = totalPool - loanStats.totalActiveLoanAmount;

    // Get active members count from userStats
    const activeMembersCount = userStats?.byRole?.reduce((sum, role) => sum + role.active, 0) || 0;
    const totalMembers = userStats?.total || 0;

    // Fetch data
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([
                    fetchSummary(new Date().getFullYear()),
                    refetchLoans(),
                    refetchUsers(),
                    fetchFinancialSummary()
                ]);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [fetchSummary, refetchLoans, refetchUsers, fetchFinancialSummary]);

    // Show loading state
    if (loading || contributionsLoading || loansLoading || usersLoading || systemLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    // Show error state - only if critical errors exist
    if (error || loansError || usersError) {
        let errorMessage = 'Unknown error occurred';

        if (error) {
            errorMessage = error;
        } else if (loansError) {
            errorMessage = getErrorMessage(loansError, 'Failed to load loans');
        } else if (usersError) {
            errorMessage = getErrorMessage(usersError, 'Failed to load users');
        }

        return <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header with Goldish Generate Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary-600" />
                        Super Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back! Here's your financial summary
                    </p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                    <Calendar className="w-4 h-4" />
                    Generate Monthly
                </button>
            </div>

            {/* Total Pool & Remaining Balance - Gold and Green */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Pool Card */}
                <div className="bg-linear-to-r from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-100">Total Pool</p>
                            <p className="text-3xl font-bold mt-1 text-white">{formatCurrency(totalPool)}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-100">
                                <span>Total Contributions: {formatCurrency(financialSummary?.totalContributions || 188021)}</span>
                                <span>+</span>
                                <span>Interest: {formatCurrency(financialSummary?.totalInterest || 0)}</span>
                            </div>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <PiggyBank className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Remaining Balance Card */}
                <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Remaining Balance</p>
                            <p className="text-3xl font-bold mt-1 text-white">{formatCurrency(remainingBalance)}</p>
                            <p className="text-xs opacity-80 mt-2">Total Pool - Active Loans Outstanding</p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Members"
                    value={totalMembers}
                    icon={Users}
                    color="primary"
                    onClick={() => navigate('/members')}
                />
                <StatsCard
                    title="Active Members"
                    value={activeMembersCount}
                    icon={Users}
                    color="green"
                    onClick={() => navigate('/members?status=active')}
                />
                <StatsCard
                    title="Active Loans"
                    value={loanStats.activeLoans}
                    icon={HandCoins}
                    color="amber"
                    onClick={() => navigate('/loans?status=active')}
                />
                <StatsCard
                    title="Pending Payments"
                    value={loanStats.pendingPaymentsCount}
                    icon={Clock}
                    color="purple"
                    onClick={() => navigate('/pending-payments')}
                />
            </div>

            {/* Second Row - Contributions and Loan Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <History className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Contributions Collected</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(contributionStats?.totalCollected || 0)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Pending: {formatCurrency(contributionStats?.pendingVerifications ? contributionStats.pendingVerifications * 1000 : 0)}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Loan Amount</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(loanStats.totalActiveLoanAmount)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Outstanding principal balance</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Verifications</p>
                            <p className="text-xl font-bold text-gray-900">
                                {contributionStats?.pendingVerifications || 0}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Receipts waiting for review</p>
                </div>
            </div>

            {/* Financial Health */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Health</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Fund Utilization</span>
                            <span className="text-gray-600">{((loanStats.totalActiveLoanAmount / totalPool) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-linear-to-r from-amber-500 to-yellow-500 rounded-full h-2 transition-all duration-500"
                                style={{ width: `${(loanStats.totalActiveLoanAmount / totalPool) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Available for New Loans</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(remainingBalance)}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Total Interest Earned</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(loanStats.totalInterestEarned)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions with Goldish Buttons */}
            <div className="bg-linear-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Generate Monthly
                    </button>
                    <button
                        onClick={() => navigate('/contributions')}
                        className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-300 font-medium"
                    >
                        Manage Contributions
                    </button>
                    <button
                        onClick={() => navigate('/members')}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                    >
                        Manage Members
                    </button>
                    <button
                        onClick={() => navigate('/loans')}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                    >
                        View All Loans
                    </button>
                </div>
            </div>

            {/* Generate Modal */}
            {showGenerateModal && (
                <GenerateContributionsModal
                    isOpen={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    onSuccess={() => {
                        fetchSummary(new Date().getFullYear());
                        fetchFinancialSummary();
                        refetchLoans();
                    }}
                />
            )}
        </div>
    );
};

export default SuperAdminDashboard;