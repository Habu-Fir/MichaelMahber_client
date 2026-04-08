import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    HandCoins,
    PiggyBank,
    Clock,
    Shield,
    DollarSign,

    CheckCircle,
    Calendar,
    History,
    Eye,
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import { useAllLoans } from '../../hooks/useLoans';
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
    const [isRefreshing, setIsRefreshing] = useState(false);

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
        error: loansError
    } = useAllLoans();

    // User stats
    const {
        data: userStats,
        isLoading: usersLoading,
        error: usersError,
        refetch: refetchUsers
    } = useUserStats();

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            fetchSummary(new Date().getFullYear()),
            fetchFinancialSummary(),
            refetchUsers()
        ]);
        setIsRefreshing(false);
    };

    const getErrorMessage = (error: unknown, defaultMessage: string): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
        return defaultMessage;
    };

    // Calculate loan statistics
    const calculateLoanStats = () => {
        if (!loansData?.data || loansData.data.length === 0) {
            return {
                totalLoans: 0,
                activeLoans: 0,
                pendingLoans: 0,
                approvedLoans: 0,
                completedLoans: 0,
                rejectedLoans: 0,
                totalLoanAmount: 0,
                totalActiveLoanAmount: 0,
                totalInterestEarned: 0,
                totalInterestPaid: 0,
                pendingPaymentsCount: 0,
                activeLoanDetails: []
            };
        }

        const loans = loansData.data;

        const totalLoans = loans.length;
        const activeLoans = loans.filter(l => l.status === 'active').length;
        const pendingLoans = loans.filter(l => l.status === 'pending').length;
        const approvedLoans = loans.filter(l => l.status === 'approved').length;
        const completedLoans = loans.filter(l => l.status === 'completed').length;
        const rejectedLoans = loans.filter(l => l.status === 'rejected').length;

        const activeLoansList = loans.filter(l => l.status === 'active');

        const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.principal || 0), 0);
        const totalActiveLoanAmount = activeLoansList.reduce((sum, loan) => sum + (loan.remainingPrincipal || loan.principal || 0), 0);
        const totalInterestEarned = loans.reduce((sum, loan) => sum + (loan.interestAccrued || 0), 0);
        const totalInterestPaid = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0);

        const pendingPaymentsCount = loans
            .filter(loan => loan.pendingPayments?.some(p => p.status === 'pending'))
            .length;

        return {
            totalLoans,
            activeLoans,
            pendingLoans,
            approvedLoans,
            completedLoans,
            rejectedLoans,
            totalLoanAmount,
            totalActiveLoanAmount,
            totalInterestEarned,
            totalInterestPaid,
            pendingPaymentsCount,
            activeLoanDetails: activeLoansList
        };
    };

    const loanStats = calculateLoanStats();
    const contributionStats = getDashboardStats();

    const totalPool = financialSummary?.totalAvailable || 188021;
    const remainingBalance = totalPool - loanStats.totalActiveLoanAmount;
    const unpaidInterest = loanStats.totalInterestEarned - loanStats.totalInterestPaid;

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
                    fetchFinancialSummary(),
                    refetchUsers()
                ]);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [fetchSummary, fetchFinancialSummary, refetchUsers]);

    // Show loading state
    if (loading || contributionsLoading || loansLoading || usersLoading || systemLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    // Show error state
    if (error || loansError || usersError) {
        let errorMessage = 'Unknown error occurred';
        if (error) errorMessage = error;
        else if (loansError) errorMessage = getErrorMessage(loansError, 'Failed to load loans');
        else if (usersError) errorMessage = getErrorMessage(usersError, 'Failed to load users');
        return <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header with Refresh Button */}
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
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        <Calendar className="w-4 h-4" />
                        Generate Monthly
                    </button>
                </div>
            </div>

            {/* Total Pool & Remaining Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
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

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
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
                <StatsCard title="Total Members" value={totalMembers} icon={Users} color="primary" onClick={() => navigate('/members')} />
                <StatsCard title="Active Members" value={activeMembersCount} icon={Users} color="green" onClick={() => navigate('/members?status=active')} />
                <StatsCard title="Active Loans" value={loanStats.activeLoans} icon={HandCoins} color="amber" onClick={() => navigate('/loans?status=active')} />
                <StatsCard title="Pending Payments" value={loanStats.pendingPaymentsCount} icon={Clock} color="purple" onClick={() => navigate('/pending-payments')} />
            </div>

            {/* Second Row - More detailed stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Interest Earned Card - UPDATED with unpaid interest */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Interest Earned</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(loanStats.totalInterestEarned)}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Interest paid:</span>
                        <span className="font-medium text-green-600">{formatCurrency(loanStats.totalInterestPaid)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">Unpaid interest:</span>
                        <span className="font-medium text-amber-600">{formatCurrency(unpaidInterest)}</span>
                    </div>
                </div>

                {/* Contributions Collected Card */}
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

                {/* Pending Verifications Card */}
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

            {/* Loan Status Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="w-full bg-blue-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-blue-600">{loanStats.totalLoans}</p>
                            <p className="text-xs text-gray-600">Total Loans</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-green-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-green-600">{loanStats.activeLoans}</p>
                            <p className="text-xs text-gray-600">Active</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-yellow-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-yellow-600">{loanStats.pendingLoans}</p>
                            <p className="text-xs text-gray-600">Pending</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-purple-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-purple-600">{loanStats.approvedLoans}</p>
                            <p className="text-xs text-gray-600">Approved</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-gray-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-gray-600">{loanStats.completedLoans}</p>
                            <p className="text-xs text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Loans List */}
            {loanStats.activeLoans > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Active Loans ({loanStats.activeLoans})</h3>
                        <button onClick={() => navigate('/loans?status=active')} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View All →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Loan Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Member</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Principal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Remaining</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Interest Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loansData?.data?.filter(l => l.status === 'active').map((loan) => (
                                    <tr key={loan._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/loans/${loan._id}`)}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{loan.memberName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(loan.principal)}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-amber-600">{formatCurrency(loan.remainingPrincipal)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{loan.interestRate}%</td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{loan.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Financial Health Indicator */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Health</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Fund Utilization</span>
                            <span className="text-gray-600">{((loanStats.totalActiveLoanAmount / totalPool) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full h-2" style={{ width: `${(loanStats.totalActiveLoanAmount / totalPool) * 100}%` }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Available for New Loans</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(remainingBalance)}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Total Interest Generated</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(loanStats.totalInterestEarned)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 font-medium shadow-md flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Generate Monthly
                    </button>
                    <button onClick={() => navigate('/contributions')} className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 font-medium">
                        Manage Contributions
                    </button>
                    <button onClick={() => navigate('/members')} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
                        Manage Members
                    </button>
                    <button onClick={() => navigate('/loans')} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
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
                    }}
                />
            )}
        </div>
    );
};

export default SuperAdminDashboard;





// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Users,
//     HandCoins,
//     PiggyBank,
//     Clock,
//     Shield,
//     DollarSign,
//     Wallet,
//     CheckCircle,
//     Calendar,
//     History,
//     Eye
// } from 'lucide-react';
// import StatsCard from '../../components/dashboard/StatsCard';
// import { useAdminContributions } from '../../hooks/useAdminContributions';
// import { useAllLoans } from '../../hooks/useLoans';  // CHANGE: Use useAllLoans instead
// import { useUserStats } from '../../hooks/useUsers';
// import { useSystem } from '../../hooks/useSystem';
// import Loader from '../../components/common/Loader';
// import GenerateContributionsModal from '../../components/contributions/GenerateContributionsModal';
// import { formatCurrency } from '../../lib/utils';

// // Error Message Component
// const ErrorMessage = ({ message }: { message: string }) => (
//     <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//             <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
//             <p className="text-red-600">{message}</p>
//         </div>
//     </div>
// );

// const SuperAdminDashboard = () => {
//     const navigate = useNavigate();
//     const [showGenerateModal, setShowGenerateModal] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // System data
//     const {
//         financialSummary,
//         loading: systemLoading,
//         fetchFinancialSummary
//     } = useSystem();

//     // Contributions data
//     const {
//         loading: contributionsLoading,
//         fetchSummary,
//         getDashboardStats
//     } = useAdminContributions();

//     // CHANGE: Use useAllLoans instead of useLoans
//     const {
//         data: loansData,
//         isLoading: loansLoading,
//         error: loansError
//     } = useAllLoans();

//     //  const { data: loansData, isLoading: loansLoading, error: loansError } = useAllLoans();

//     // Add this debug code:
//     useEffect(() => {
//         console.log('===== LOANS DEBUG =====');
//         console.log('loansData:', loansData);
//         console.log('loansData?.data:', loansData?.data);
//         console.log('Number of loans:', loansData?.data?.length);
//         console.log('All loans:', loansData?.data?.map(l => ({ number: l.loanNumber, status: l.status, member: l.memberName })));
//         console.log('Active loans:', loansData?.data?.filter(l => l.status === 'active'));
//         console.log('=======================');
//     }, [loansData]);

//     // User stats
//     const {
//         data: userStats,
//         isLoading: usersLoading,
//         error: usersError,
//         refetch: refetchUsers
//     } = useUserStats();

//     const getErrorMessage = (error: unknown, defaultMessage: string): string => {
//         if (error instanceof Error) return error.message;
//         if (typeof error === 'string') return error;
//         return defaultMessage;
//     };

//     // Calculate loan statistics
//     const calculateLoanStats = () => {
//         console.log('Loans data received:', loansData?.data);

//         if (!loansData?.data || loansData.data.length === 0) {
//             console.log('No loans data found');
//             return {
//                 totalLoans: 0,
//                 activeLoans: 0,
//                 pendingLoans: 0,
//                 approvedLoans: 0,
//                 completedLoans: 0,
//                 rejectedLoans: 0,
//                 totalLoanAmount: 0,
//                 totalActiveLoanAmount: 0,
//                 totalInterestEarned: 0,
//                 pendingPaymentsCount: 0,
//                 activeLoanDetails: []
//             };
//         }

//         const loans = loansData.data;

//         console.log('All loan statuses:', loans.map(l => ({ id: l._id, status: l.status, amount: l.principal })));

//         const totalLoans = loans.length;
//         const activeLoans = loans.filter(l => l.status === 'active').length;
//         const pendingLoans = loans.filter(l => l.status === 'pending').length;
//         const approvedLoans = loans.filter(l => l.status === 'approved').length;
//         const completedLoans = loans.filter(l => l.status === 'completed').length;
//         const rejectedLoans = loans.filter(l => l.status === 'rejected').length;

//         const activeLoansList = loans.filter(l => l.status === 'active');
//         console.log('Active loans count:', activeLoansList.length);
//         console.log('Active loans details:', activeLoansList.map(l => ({
//             loanNumber: l.loanNumber,
//             member: l.memberName,
//             principal: l.principal,
//             remainingPrincipal: l.remainingPrincipal
//         })));

//         const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.principal || 0), 0);
//         const totalActiveLoanAmount = activeLoansList.reduce((sum, loan) => sum + (loan.remainingPrincipal || loan.principal || 0), 0);
//         const totalInterestEarned = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0);

//         const pendingPaymentsCount = loans
//             .filter(loan => loan.pendingPayments?.some(p => p.status === 'pending'))
//             .length;

//         return {
//             totalLoans,
//             activeLoans,
//             pendingLoans,
//             approvedLoans,
//             completedLoans,
//             rejectedLoans,
//             totalLoanAmount,
//             totalActiveLoanAmount,
//             totalInterestEarned,
//             pendingPaymentsCount,
//             activeLoanDetails: activeLoansList
//         };
//     };

//     const loanStats = calculateLoanStats();
//     const contributionStats = getDashboardStats();

//     const totalPool = financialSummary?.totalAvailable || 188021;
//     const remainingBalance = totalPool - loanStats.totalActiveLoanAmount;

//     const activeMembersCount = userStats?.byRole?.reduce((sum, role) => sum + role.active, 0) || 0;
//     const totalMembers = userStats?.total || 0;

//     // Fetch data
//     useEffect(() => {
//         const fetchAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 await Promise.all([
//                     fetchSummary(new Date().getFullYear()),
//                     fetchFinancialSummary(),
//                     refetchUsers()
//                 ]);
//             } catch (err: any) {
//                 setError(err.message || 'Failed to load dashboard data');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAllData();
//     }, [fetchSummary, fetchFinancialSummary, refetchUsers]);

//     // Show loading state
//     if (loading || contributionsLoading || loansLoading || usersLoading || systemLoading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <Loader />
//             </div>
//         );
//     }

//     // Show error state
//     if (error || loansError || usersError) {
//         let errorMessage = 'Unknown error occurred';
//         if (error) errorMessage = error;
//         else if (loansError) errorMessage = getErrorMessage(loansError, 'Failed to load loans');
//         else if (usersError) errorMessage = getErrorMessage(usersError, 'Failed to load users');
//         return <ErrorMessage message={errorMessage} />;
//     }

//     return (
//         <div className="space-y-6 p-6">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                         <Shield className="w-6 h-6 text-primary-600" />
//                         Super Admin Dashboard
//                     </h1>
//                     <p className="text-sm text-gray-500 mt-1">
//                         Welcome back! Here's your financial summary
//                     </p>
//                 </div>
//                 <button
//                     onClick={() => setShowGenerateModal(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
//                 >
//                     <Calendar className="w-4 h-4" />
//                     Generate Monthly
//                 </button>
//             </div>

//             {/* Total Pool & Remaining Balance */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-amber-100">Total Pool</p>
//                             <p className="text-3xl font-bold mt-1 text-white">{formatCurrency(totalPool)}</p>
//                             <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-100">
//                                 <span>Total Contributions: {formatCurrency(financialSummary?.totalContributions || 188021)}</span>
//                                 <span>+</span>
//                                 <span>Interest: {formatCurrency(financialSummary?.totalInterest || 0)}</span>
//                             </div>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <PiggyBank className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium opacity-90">Remaining Balance</p>
//                             <p className="text-3xl font-bold mt-1 text-white">{formatCurrency(remainingBalance)}</p>
//                             <p className="text-xs opacity-80 mt-2">Total Pool - Active Loans Outstanding</p>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <DollarSign className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <StatsCard title="Total Members" value={totalMembers} icon={Users} color="primary" onClick={() => navigate('/members')} />
//                 <StatsCard title="Active Members" value={activeMembersCount} icon={Users} color="green" onClick={() => navigate('/members?status=active')} />
//                 <StatsCard title="Active Loans" value={loanStats.activeLoans} icon={HandCoins} color="amber" onClick={() => navigate('/loans?status=active')} />
//                 <StatsCard title="Pending Payments" value={loanStats.pendingPaymentsCount} icon={Clock} color="purple" onClick={() => navigate('/pending-payments')} />
//             </div>

//             {/* Second Row */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-amber-100 rounded-lg"><History className="w-5 h-5 text-amber-600" /></div>
//                         <div><p className="text-sm text-gray-600">Contributions Collected</p><p className="text-xl font-bold text-gray-900">{formatCurrency(contributionStats?.totalCollected || 0)}</p></div>
//                     </div>
//                     <p className="text-xs text-gray-500">Pending: {formatCurrency(contributionStats?.pendingVerifications ? contributionStats.pendingVerifications * 1000 : 0)}</p>
//                 </div>

//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-blue-100 rounded-lg"><Wallet className="w-5 h-5 text-blue-600" /></div>
//                         <div><p className="text-sm text-gray-600">Active Loan Amount</p><p className="text-xl font-bold text-gray-900">{formatCurrency(loanStats.totalActiveLoanAmount)}</p></div>
//                     </div>
//                     <p className="text-xs text-gray-500">Outstanding principal balance</p>
//                 </div>

//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
//                         <div><p className="text-sm text-gray-600">Pending Verifications</p><p className="text-xl font-bold text-gray-900">{contributionStats?.pendingVerifications || 0}</p></div>
//                     </div>
//                     <p className="text-xs text-gray-500">Receipts waiting for review</p>
//                 </div>
//             </div>

//             {/* Active Loans List */}
//             {loanStats.activeLoans > 0 && (
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-900">Active Loans ({loanStats.activeLoans})</h3>
//                         <button onClick={() => navigate('/loans?status=active')} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
//                             <Eye className="w-4 h-4" /> View All →
//                         </button>
//                     </div>
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b border-gray-200">
//                                 <tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Loan Number</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Member</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Principal</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Remaining</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Interest Rate</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th></tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {loansData?.data?.filter(l => l.status === 'active').map((loan) => (
//                                     <tr key={loan._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/loans/${loan._id}`)}>
//                                         <td className="px-4 py-3 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-600">{loan.memberName}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(loan.principal)}</td>
//                                         <td className="px-4 py-3 text-sm font-semibold text-amber-600">{formatCurrency(loan.remainingPrincipal)}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-600">{loan.interestRate}%</td>
//                                         <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{loan.status}</span></td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             )}

//             {/* Financial Health */}
//             <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Health</h3>
//                 <div className="space-y-3">
//                     <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Fund Utilization</span><span className="text-gray-600">{((loanStats.totalActiveLoanAmount / totalPool) * 100).toFixed(1)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full h-2" style={{ width: `${(loanStats.totalActiveLoanAmount / totalPool) * 100}%` }} /></div></div>
//                     <div className="grid grid-cols-2 gap-4 pt-2"><div className="text-center p-2 bg-green-50 rounded-lg"><p className="text-xs text-gray-500">Available for New Loans</p><p className="text-lg font-bold text-green-600">{formatCurrency(remainingBalance)}</p></div><div className="text-center p-2 bg-blue-50 rounded-lg"><p className="text-xs text-gray-500">Total Interest Earned</p><p className="text-lg font-bold text-blue-600">{formatCurrency(loanStats.totalInterestEarned)}</p></div></div>
//                 </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
//                 <div className="flex flex-wrap gap-3">
//                     <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 font-medium shadow-md flex items-center gap-2"><Calendar className="w-4 h-4" /> Generate Monthly</button>
//                     <button onClick={() => navigate('/contributions')} className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 font-medium">Manage Contributions</button>
//                     <button onClick={() => navigate('/members')} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Manage Members</button>
//                     <button onClick={() => navigate('/loans')} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">View All Loans</button>
//                 </div>
//             </div>

//             {/* Generate Modal */}
//             {showGenerateModal && (
//                 <GenerateContributionsModal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} onSuccess={() => { fetchSummary(new Date().getFullYear()); fetchFinancialSummary(); }} />
//             )}
//         </div>
//     );
// };

// export default SuperAdminDashboard;