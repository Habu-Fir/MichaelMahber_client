// import { HandCoins, History, TrendingUp, Wallet, Clock, CheckCircle, PiggyBank, DollarSign } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useContributions } from '../../hooks/useContributions';
// import { useLoans } from '../../hooks/useLoans';
// import { useSystem } from '../../hooks/useSystem';
// import Loader from '../../components/common/Loader';
// import { formatCurrency } from '../../lib/utils';

// const MemberDashboard = () => {
//     const { user } = useAuth();

//     // Get system data for total pool
//     const { financialSummary, loading: systemLoading, fetchFinancialSummary } = useSystem();

//     // Get contributions data
//     const {
//         stats: contributionStats,
//         loading: contributionsLoading,
//         error: contributionsError,
//         fetchMyContributions
//     } = useContributions();

//     // Get loans data
//     const {
//         data: loansData,
//         isLoading: loansLoading,
//         error: loansError,
//         refetch: refetchLoans
//     } = useLoans();

//     // Calculate loan statistics
//     const calculateLoanStats = () => {
//         if (!loansData?.data) {
//             return {
//                 activeLoans: 0,
//                 totalLoanAmount: 0,
//                 totalPrincipal: 0,
//                 totalOutstanding: 0,
//                 totalInterestEarned: 0,
//                 totalInterestPaid: 0,
//                 totalAmountPaid: 0,
//                 completedLoans: 0,
//                 pendingLoans: 0,
//                 totalActiveLoanAmount: 0  // Total of currently active loans
//             };
//         }

//         const loans = loansData.data;

//         // Count loans by status
//         const activeLoans = loans.filter(l => l.status === 'active').length;
//         const completedLoans = loans.filter(l => l.status === 'completed').length;
//         const pendingLoans = loans.filter(l => l.status === 'pending').length;

//         // Calculate totals
//         const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
//         const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
//         const totalOutstanding = loans.reduce((sum, loan) => sum + loan.remainingPrincipal, 0);
//         const totalInterestEarned = loans.reduce((sum, loan) => sum + (loan.interestAccrued || 0), 0);
//         const totalInterestPaid = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0);
//         const totalAmountPaid = loans.reduce((sum, loan) => sum + (loan.amountPaid || 0), 0);

//         // Calculate total of currently active loans (principal remaining)
//         const totalActiveLoanAmount = loans
//             .filter(l => l.status === 'active')
//             .reduce((sum, loan) => sum + loan.remainingPrincipal, 0);

//         return {
//             activeLoans,
//             completedLoans,
//             pendingLoans,
//             totalLoanAmount,
//             totalPrincipal,
//             totalOutstanding,
//             totalInterestEarned,
//             totalInterestPaid,
//             totalAmountPaid,
//             totalActiveLoanAmount
//         };
//     };

//     const loanStats = calculateLoanStats();

//     // Calculate remaining balance
//     const totalPool = financialSummary?.totalAvailable || 188021;
//     const remainingBalance = totalPool - loanStats.totalActiveLoanAmount;

//     // Check if loading
//     if (contributionsLoading || loansLoading || systemLoading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <Loader />
//             </div>
//         );
//     }

//     // Show error if any
//     if (contributionsError || loansError) {
//         return (
//             <div className="p-6">
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
//                     <p className="font-semibold mb-2">Error Loading Dashboard</p>
//                     <button
//                         onClick={() => {
//                             fetchMyContributions();
//                             refetchLoans();
//                             fetchFinancialSummary();
//                         }}
//                         className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6 p-6">
//             {/* Header */}
//             <div>
//                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                     <Wallet className="w-6 h-6 text-primary-600" />
//                     Member Dashboard
//                 </h1>
//                 <p className="text-sm text-gray-500 mt-1">
//                     Welcome back, {user?.name}! Here's your financial summary
//                 </p>
//             </div>

//             {/* Total Pool & Remaining Balance Cards - 2 columns */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {/* Total Pool Card - Gold Gradient */}
//                 {/* Total Pool Card - Gold Gradient */}
//                 <div className="bg-linear-to-r from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-amber-100">Total Pool</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {formatCurrency(totalPool)}
//                             </p>
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

//                 {/* Remaining Balance Card */}
//                 <div className={`rounded-xl p-5 text-white shadow-lg ${remainingBalance >= 0
//                     ? 'bg-linear-to-r from-green-500 to-emerald-600'
//                     : 'bg-linear-to-r from-red-500 to-rose-600'
//                     }`}>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium opacity-90">Remaining Balance</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {formatCurrency(remainingBalance)}
//                             </p>
//                             <p className="text-xs opacity-80 mt-2">
//                                 Total Pool - Active Loans Outstanding
//                             </p>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <DollarSign className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Stats Grid - 4 columns */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {/* Active Loans Card */}
//                 <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-blue-100">Active Loans</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {loanStats.activeLoans}
//                             </p>
//                             {loanStats.activeLoans > 0 && (
//                                 <p className="text-xs text-blue-200 mt-1">
//                                     Outstanding: {formatCurrency(loanStats.totalActiveLoanAmount)}
//                                 </p>
//                             )}
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <HandCoins className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Total Loan Amount Card */}
//                 <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-purple-100">Total Loan Amount</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {formatCurrency(loanStats.totalLoanAmount)}
//                             </p>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <Wallet className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Outstanding Balance Card */}
//                 <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-amber-100">Outstanding Balance</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {formatCurrency(loanStats.totalOutstanding)}
//                             </p>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <Clock className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Total Paid Card */}
//                 <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-green-100">Total Paid</p>
//                             <p className="text-3xl font-bold mt-1 text-white">
//                                 {formatCurrency(loanStats.totalAmountPaid)}
//                             </p>
//                         </div>
//                         <div className="bg-white/20 rounded-full p-3">
//                             <CheckCircle className="w-6 h-6 text-white" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Second Row - More detailed stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {/* Interest Earned Card */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-teal-100 rounded-lg">
//                             <TrendingUp className="w-5 h-5 text-teal-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-gray-600">Interest Earned</p>
//                             <p className="text-xl font-bold text-gray-900">
//                                 {formatCurrency(loanStats.totalInterestEarned)}
//                             </p>
//                         </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                         Interest paid: {formatCurrency(loanStats.totalInterestPaid)}
//                     </p>
//                 </div>

//                 {/* Contributions Card */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-amber-100 rounded-lg">
//                             <History className="w-5 h-5 text-amber-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-gray-600">Contributions</p>
//                             <p className="text-xl font-bold text-gray-900">
//                                 {contributionStats?.paidCount || 0} months
//                             </p>
//                         </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                         Total paid: {formatCurrency(contributionStats?.totalPaid || 0)}
//                     </p>
//                 </div>

//                 {/* Pending Contributions Card */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 bg-red-100 rounded-lg">
//                             <Clock className="w-5 h-5 text-red-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-gray-600">Pending Contributions</p>
//                             <p className="text-xl font-bold text-gray-900">
//                                 {contributionStats?.pendingCount || 0} months
//                             </p>
//                         </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                         Amount: {formatCurrency(contributionStats?.totalPending || 0)}
//                     </p>
//                 </div>
//             </div>

//             {/* Loan Status Summary */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Summary</h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <div className="w-full bg-blue-100 rounded-lg p-3">
//                             <p className="text-2xl font-bold text-blue-600">{loanStats.activeLoans}</p>
//                             <p className="text-xs text-gray-600">Active Loans</p>
//                         </div>
//                     </div>
//                     <div className="text-center">
//                         <div className="w-full bg-yellow-100 rounded-lg p-3">
//                             <p className="text-2xl font-bold text-yellow-600">{loanStats.pendingLoans}</p>
//                             <p className="text-xs text-gray-600">Pending Loans</p>
//                         </div>
//                     </div>
//                     <div className="text-center">
//                         <div className="w-full bg-green-100 rounded-lg p-3">
//                             <p className="text-2xl font-bold text-green-600">{loanStats.completedLoans}</p>
//                             <p className="text-xs text-gray-600">Completed Loans</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Financial Health Indicator */}
//             <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Health</h3>
//                 <div className="space-y-3">
//                     <div>
//                         <div className="flex justify-between text-sm mb-1">
//                             <span className="text-gray-600">Fund Utilization</span>
//                             <span className="text-gray-600">
//                                 {((loanStats.totalActiveLoanAmount / totalPool) * 100).toFixed(1)}%
//                             </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                             <div
//                                 className="bg-amber-500 rounded-full h-2 transition-all duration-500"
//                                 style={{ width: `${(loanStats.totalActiveLoanAmount / totalPool) * 100}%` }}
//                             />
//                         </div>
//                         <p className="text-xs text-gray-500 mt-1">
//                             {formatCurrency(loanStats.totalActiveLoanAmount)} of {formatCurrency(totalPool)} is currently loaned out
//                         </p>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4 pt-2">
//                         <div className="text-center p-2 bg-green-50 rounded-lg">
//                             <p className="text-xs text-gray-500">Available for New Loans</p>
//                             <p className="text-lg font-bold text-green-600">{formatCurrency(remainingBalance)}</p>
//                         </div>
//                         <div className="text-center p-2 bg-blue-50 rounded-lg">
//                             <p className="text-xs text-gray-500">Total Interest Generated</p>
//                             <p className="text-lg font-bold text-blue-600">{formatCurrency(loanStats.totalInterestEarned)}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-linear-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
//                 <div className="flex flex-wrap gap-3">
//                     <button
//                         onClick={() => window.location.href = '/loans/request'}
//                         className="px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all font-medium"
//                     >
//                         Apply for Loan
//                     </button>
//                     <button
//                         onClick={() => window.location.href = '/my-contributions'}
//                         className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all font-medium"
//                     >
//                         View Contributions
//                     </button>
//                     <button
//                         onClick={() => window.location.href = '/loans'}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
//                     >
//                         My Loans
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MemberDashboard;


import { HandCoins, History, TrendingUp, Wallet, Clock, CheckCircle, PiggyBank, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContributions } from '../../hooks/useContributions';
import { useLoans } from '../../hooks/useLoans';
import { useSystem } from '../../hooks/useSystem';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect } from 'react';

const MemberDashboard = () => {
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get system data for total pool
    const { financialSummary, loading: systemLoading, fetchFinancialSummary } = useSystem();

    // Get contributions data
    const {
        stats: contributionStats,
        loading: contributionsLoading,
        error: contributionsError,
        fetchMyContributions
    } = useContributions();

    // Get loans data
    const {
        data: loansData,
        isLoading: loansLoading,
        error: loansError,
        refetch: refetchLoans
    } = useLoans();

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            fetchMyContributions(),
            refetchLoans(),
            fetchFinancialSummary()
        ]);
        setIsRefreshing(false);
    };

    // Calculate loan statistics
    const calculateLoanStats = () => {
        if (!loansData?.data) {
            return {
                activeLoans: 0,
                totalLoanAmount: 0,
                totalPrincipal: 0,
                totalOutstanding: 0,
                totalInterestEarned: 0,
                totalInterestPaid: 0,
                totalAmountPaid: 0,
                completedLoans: 0,
                pendingLoans: 0,
                totalActiveLoanAmount: 0
            };
        }

        const loans = loansData.data;

        const activeLoans = loans.filter(l => l.status === 'active').length;
        const completedLoans = loans.filter(l => l.status === 'completed').length;
        const pendingLoans = loans.filter(l => l.status === 'pending').length;

        const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
        const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
        const totalOutstanding = loans.reduce((sum, loan) => sum + loan.remainingPrincipal, 0);
        const totalInterestEarned = loans.reduce((sum, loan) => sum + (loan.interestAccrued || 0), 0);
        const totalInterestPaid = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0);
        const totalAmountPaid = loans.reduce((sum, loan) => sum + (loan.amountPaid || 0), 0);

        const totalActiveLoanAmount = loans
            .filter(l => l.status === 'active')
            .reduce((sum, loan) => sum + loan.remainingPrincipal, 0);

        return {
            activeLoans,
            completedLoans,
            pendingLoans,
            totalLoanAmount,
            totalPrincipal,
            totalOutstanding,
            totalInterestEarned,
            totalInterestPaid,
            totalAmountPaid,
            totalActiveLoanAmount
        };
    };

    const loanStats = calculateLoanStats();

    // Calculate remaining balance
    const totalPool = financialSummary?.totalAvailable || 188021;
    const remainingBalance = totalPool - loanStats.totalActiveLoanAmount;
    const unpaidInterest = loanStats.totalInterestEarned - loanStats.totalInterestPaid;

    // Check if loading
    if (contributionsLoading || loansLoading || systemLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    // Show error if any
    if (contributionsError || loansError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-semibold mb-2">Error Loading Dashboard</p>
                    <button
                        onClick={() => {
                            fetchMyContributions();
                            refetchLoans();
                            fetchFinancialSummary();
                        }}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-primary-600" />
                        Member Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back, {user?.name}! Here's your financial summary
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Refresh Data"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Total Pool & Remaining Balance Cards - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Pool Card - Gold Gradient */}
                <div className="bg-linear-to-r from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-100">Total Pool</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(totalPool)}
                            </p>
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
                <div className={`rounded-xl p-5 text-white shadow-lg ${remainingBalance >= 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Remaining Balance</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(remainingBalance)}
                            </p>
                            <p className="text-xs opacity-80 mt-2">
                                Total Pool - Active Loans Outstanding
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Loans Card */}
                <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Active Loans</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {loanStats.activeLoans}
                            </p>
                            {loanStats.activeLoans > 0 && (
                                <p className="text-xs text-blue-200 mt-1">
                                    Outstanding: {formatCurrency(loanStats.totalActiveLoanAmount)}
                                </p>
                            )}
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <HandCoins className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Loan Amount Card */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-100">Total Loan Amount</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(loanStats.totalLoanAmount)}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Outstanding Balance Card */}
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-100">Outstanding Balance</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(loanStats.totalOutstanding)}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Paid Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-100">Total Paid</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(loanStats.totalAmountPaid)}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
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

                {/* Contributions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <History className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Contributions</p>
                            <p className="text-xl font-bold text-gray-900">
                                {contributionStats?.paidCount || 0} months
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Total paid: {formatCurrency(contributionStats?.totalPaid || 0)}
                    </p>
                </div>

                {/* Pending Contributions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Contributions</p>
                            <p className="text-xl font-bold text-gray-900">
                                {contributionStats?.pendingCount || 0} months
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Amount: {formatCurrency(contributionStats?.totalPending || 0)}
                    </p>
                </div>
            </div>

            {/* Loan Status Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-full bg-blue-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-blue-600">{loanStats.activeLoans}</p>
                            <p className="text-xs text-gray-600">Active Loans</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-yellow-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-yellow-600">{loanStats.pendingLoans}</p>
                            <p className="text-xs text-gray-600">Pending Loans</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-full bg-green-100 rounded-lg p-3">
                            <p className="text-2xl font-bold text-green-600">{loanStats.completedLoans}</p>
                            <p className="text-xs text-gray-600">Completed Loans</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Health Indicator */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Health</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Fund Utilization</span>
                            <span className="text-gray-600">
                                {((loanStats.totalActiveLoanAmount / totalPool) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-amber-500 rounded-full h-2 transition-all duration-500"
                                style={{ width: `${(loanStats.totalActiveLoanAmount / totalPool) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(loanStats.totalActiveLoanAmount)} of {formatCurrency(totalPool)} is currently loaned out
                        </p>
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
                    <button
                        onClick={() => window.location.href = '/loans/request'}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all font-medium shadow-md"
                    >
                        Apply for Loan
                    </button>
                    <button
                        onClick={() => window.location.href = '/my-contributions'}
                        className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all font-medium"
                    >
                        View Contributions
                    </button>
                    <button
                        onClick={() => window.location.href = '/loans'}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                        My Loans
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;