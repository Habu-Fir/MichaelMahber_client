import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoan, useSignLoan, useApproveLoan, useDisburseLoan } from '../../hooks/useLoans';
import {
    ArrowLeft,
    HandCoins,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    DollarSign,
    Download,
    ThumbsUp,
    Send,
    AlertCircle,
    BarChart,
    TrendingUp as TrendingIcon,
    RefreshCw,
    Shield,
    UserCheck,
    Calculator
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { LoanStatusColors } from '../../types/loan.types';
import toast from 'react-hot-toast';

const LoanDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: loan, isLoading, error, refetch, isFetching } = useLoan(id!);

    const signLoan = useSignLoan();
    const approveLoan = useApproveLoan();
    const disburseLoan = useDisburseLoan();

    const [showDisburseModal, setShowDisburseModal] = useState(false);
    const [disburseReceipt, setDisburseReceipt] = useState('');
    const [disburseNotes, setDisburseNotes] = useState('');
    const [showSignConfirmModal, setShowSignConfirmModal] = useState(false);

    // State for real-time interest calculation
    const [currentInterest, setCurrentInterest] = useState(0);
    const [daysSinceDisbursement, setDaysSinceDisbursement] = useState(0);
    const [dailyRate, setDailyRate] = useState(0);

    // Force re-render when loan data changes
    useEffect(() => {
        console.log('🔄 Loan data updated:', loan);
    }, [loan]);

    // Calculate current interest whenever loan data changes - UPDATED for 1.5%
    useEffect(() => {
        if (loan && loan.status === 'active') {
            // Calculate daily rate (1.5% monthly = 0.05% daily)
            const daily = (loan.interestRate / 100) / 30;
            setDailyRate(daily);

            // Calculate days since last interest calculation
            const lastCalc = loan.lastInterestCalculation
                ? new Date(loan.lastInterestCalculation)
                : loan.disbursementDate
                    ? new Date(loan.disbursementDate)
                    : new Date(loan.requestDate);

            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24));
            setDaysSinceDisbursement(daysDiff);

            // Calculate interest accrued since last calculation
            if (daysDiff > 0) {
                const newInterest = loan.remainingPrincipal * daily * daysDiff;
                setCurrentInterest(Math.round(newInterest * 100) / 100);
            } else {
                setCurrentInterest(0);
            }
        }
    }, [loan]);

    // Debug logging
    useEffect(() => {
        console.log('🔍 LoanDetailsPage Debug:');
        console.log('Loan ID from params:', id);
        console.log('Current user:', user);
        console.log('Loan data:', loan);
    }, [id, user, loan]);

    const handleRefresh = async () => {
        console.log('🔄 Manually refreshing loan data...');
        toast.loading('Refreshing data...', { id: 'refresh' });
        try {
            await refetch();
            toast.success('Data refreshed!', { id: 'refresh' });
        } catch (err) {
            toast.error('Failed to refresh data', { id: 'refresh' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading loan details...</p>
                </div>
            </div>
        );
    }

    if (error || !loan) {
        const errorMessage = error
            ? (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to load loan'
            : 'Loan not found';

        const statusCode = (error as any)?.response?.status;
        const errorDetails = (error as any)?.response?.data;

        console.error('❌ Loan fetch error:', {
            error,
            statusCode,
            message: errorMessage,
            details: errorDetails
        });

        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Loan</h2>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>

                    {statusCode && (
                        <div className="bg-gray-50 p-3 rounded-xl mb-4">
                            <p className="text-xs text-gray-500">Status Code: {statusCode}</p>
                            {errorDetails && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Details: {JSON.stringify(errorDetails)}
                                </p>
                            )}
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4">Loan ID: {id}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/loans')}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                        >
                            Back to Loans
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ALL USERS CAN VIEW ALL LOANS - NO RESTRICTIONS

    // Check if current user is the owner
    const isOwner = user?._id && loan.memberId?._id &&
        loan.memberId._id.toString() === user._id.toString();

    // Check if current user has already signed
    const hasUserSigned = loan.signatures?.some(s => {
        const sigMemberId = s.memberId?._id || s.memberId;
        return sigMemberId?.toString() === user?._id?.toString();
    });

    // ALL USERS can sign EXCEPT:
    // 1. The loan owner
    // 2. People who already signed
    // 3. Only when status is 'pending'
    const canSign = !isOwner &&
        !hasUserSigned &&
        loan.status === 'pending';

    // Approver/Super Admin/Admin can approve when 50%+ signatures reached
    const canApprove = ['approver', 'super_admin', 'admin'].includes(user?.role || '') &&
        loan.status === 'ready_for_approval';

    // Super Admin can disburse when approved
    const canDisburse = user?.role === 'super_admin' && loan.status === 'approved';

    // Owner can make payments when:
    // 1. They are the owner
    // 2. Loan status is 'active' (including after payments are approved)
    // 3. Loan is NOT fully paid (remainingPrincipal > 0)
    const canMakePayment = isOwner &&
        loan.status === 'active' &&
        loan.remainingPrincipal > 0;

    // Check if there are pending payments
    const hasPendingPayments = loan.pendingPayments?.some(p => p.status === 'pending') || false;

    console.log('🔑 Payment Permission:', {
        isOwner,
        status: loan.status,
        remainingPrincipal: loan.remainingPrincipal,
        canMakePayment,
        hasPendingPayments,
        interestRate: loan.interestRate
    });

    const handleSign = async () => {
        try {
            await signLoan.mutateAsync(id!);
            setShowSignConfirmModal(false);
            toast.success('Loan signed successfully!');
            // Wait a bit then refresh
            setTimeout(async () => {
                await refetch();
                toast.success('Data updated!');
            }, 1000);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleApprove = async () => {
        try {
            await approveLoan.mutateAsync(id!);
            toast.success('Loan approved successfully!');
            // Wait a bit then refresh
            setTimeout(async () => {
                await refetch();
                toast.success('Data updated!');
            }, 1000);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDisburse = async () => {
        try {
            await disburseLoan.mutateAsync({
                id: id!,
                receiptUrl: disburseReceipt,
                notes: disburseNotes
            });
            setShowDisburseModal(false);
            toast.success('Loan disbursed successfully!');
            // Wait a bit then refresh
            setTimeout(async () => {
                await refetch();
                toast.success('Data updated!');
            }, 1000);
        } catch (error) {
            // Error handled in hook
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5" />;
            case 'ready_for_approval':
                return <CheckCircle className="w-5 h-5" />;
            case 'approved':
                return <CheckCircle className="w-5 h-5" />;
            case 'active':
                return <TrendingUp className="w-5 h-5" />;
            case 'payment_pending':
                return <Clock className="w-5 h-5" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5" />;
            case 'rejected':
                return <XCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    // Calculate total current value (principal + unpaid interest + current interest)
    const totalCurrentValue = loan.remainingPrincipal + (loan.unpaidInterest || 0) + currentInterest;

    // Calculate estimated monthly payment for display
    const calculateMonthlyPayment = (principal: number, interestRate: number, months: number = 12) => {
        const monthlyRate = interestRate / 100;
        if (principal <= 0 || monthlyRate === 0) return 0;

        const totalInterest = principal * monthlyRate * months;
        const totalPayable = principal + totalInterest;
        return totalPayable / months;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Header with back button and refresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/loans')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <HandCoins className="w-6 h-6 text-primary-600" />
                                Loan Details
                            </h1>
                            <span className={cn(
                                "px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
                                LoanStatusColors[loan.status]?.bg || 'bg-gray-100',
                                LoanStatusColors[loan.status]?.text || 'text-gray-700'
                            )}>
                                {getStatusIcon(loan.status)}
                                {LoanStatusColors[loan.status]?.label || loan.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Loan #{loan.loanNumber} • Requested by {loan.memberName} on {formatDate(loan.requestDate)}
                        </p>
                    </div>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                    title="Refresh data"
                >
                    <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Sign to Approve Modal with Warranty Description */}
            {showSignConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowSignConfirmModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-amber-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sign to Approve Loan</h3>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                            <div className="flex items-start gap-3">
                                <UserCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 mb-2">Warranty Statement</p>
                                    <p className="text-sm text-amber-700 italic">
                                        "I, <span className="font-bold text-amber-900">{user?.name || 'I'}</span>, hereby confirm that I have reviewed this loan request and take full responsibility for approving it as a member of the Mahber. I understand that this approval represents my commitment to the collective responsibility of the group."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-6 text-center">
                            By signing, you agree to the terms and conditions of the Mahber and acknowledge your responsibility in this collective decision.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSignConfirmModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={signLoan.isPending}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                            >
                                {signLoan.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing...
                                    </>
                                ) : (
                                    <>
                                        <ThumbsUp className="w-5 h-5" />
                                        Yes, Sign & Approve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6 mb-8">
                {canSign && (
                    <button
                        onClick={() => setShowSignConfirmModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
                    >
                        <Shield className="w-6 h-6" />
                        {signLoan.isPending ? 'Signing...' : 'Sign to Approve'}
                    </button>
                )}

                {canApprove && (
                    <button
                        onClick={handleApprove}
                        disabled={approveLoan.isPending}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
                    >
                        <CheckCircle className="w-6 h-6" />
                        {approveLoan.isPending ? 'Approving...' : 'Approve Loan'}
                    </button>
                )}

                {canDisburse && (
                    <button
                        onClick={() => setShowDisburseModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
                    >
                        <Send className="w-6 h-6" />
                        Disburse Funds
                    </button>
                )}

                {/* Make Payment button - shows for active loans with remaining principal */}
                {canMakePayment && (
                    <button
                        onClick={() => navigate(`/loans/${id}/pay`)}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
                    >
                        <DollarSign className="w-6 h-6" />
                        Make Payment
                    </button>
                )}

                {/* Show pending payment indicator */}
                {hasPendingPayments && isOwner && (
                    <div className="px-8 py-4 bg-amber-100 text-amber-800 font-bold text-lg rounded-xl flex items-center gap-3 border-2 border-amber-300">
                        <Clock className="w-6 h-6" />
                        Payment Pending Approval
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Loan Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Loan Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Loan Statistics</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Principal</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatCurrency(loan.principal || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="text-xl font-bold text-amber-600">
                                    {loan.interestRate || 1.5}%
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Remaining Principal</p>
                                <p className="text-xl font-bold text-primary-600">
                                    {formatCurrency(loan.remainingPrincipal || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Unpaid Interest</p>
                                <p className="text-xl font-bold text-amber-600">
                                    {formatCurrency(loan.unpaidInterest || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Daily Interest Accrual - Updated with 1.5% explanation */}
                        {loan.status === 'active' && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingIcon className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-semibold text-amber-800">Daily Interest Accrual (1.5% Monthly)</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-amber-600">Monthly Rate</p>
                                        <p className="text-lg font-bold text-amber-800">
                                            {loan.interestRate || 1.5}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600">Daily Rate</p>
                                        <p className="text-lg font-bold text-amber-800">
                                            {(dailyRate * 100).toFixed(3)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600">Days Since Last Calc</p>
                                        <p className="text-lg font-bold text-amber-800">
                                            {daysSinceDisbursement} days
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600">Interest Added Today</p>
                                        <p className="text-lg font-bold text-green-600">
                                            +{formatCurrency(currentInterest)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600">Total Current Value</p>
                                        <p className="text-lg font-bold text-primary-600">
                                            {formatCurrency(totalCurrentValue)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600">Est. Monthly Payment (12 mo)</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(calculateMonthlyPayment(loan.remainingPrincipal, loan.interestRate || 1.5, 12))}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-amber-600 mt-2">
                                    Interest accrues daily at {(dailyRate * 100).toFixed(3)}% of remaining principal.
                                    Pay early to save on interest!
                                </p>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Payable (Original)</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(loan.totalPayable || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(loan.amountPaid || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-500">Interest Paid</span>
                                <span className="font-medium text-amber-600">
                                    {formatCurrency(loan.interestPaid || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Purpose and Notes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purpose & Details</h2>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Purpose</p>
                            <p className="text-gray-900 capitalize">{loan.purpose || 'Not specified'}</p>
                        </div>

                        {loan.notes && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{loan.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment History */}
                    {loan.paymentHistory && loan.paymentHistory.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>

                            <div className="space-y-3">
                                {loan.paymentHistory.map((payment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount || 0)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(payment.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-green-600">+{formatCurrency(payment.principalPortion || 0)} principal</p>
                                            <p className="text-xs text-amber-600">{formatCurrency(payment.interestPortion || 0)} interest</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Member Info & Signatures */}
                <div className="space-y-6">
                    {/* Member Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Information</h2>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {loan.memberName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{loan.memberName || 'Unknown Member'}</p>
                                <p className="text-sm text-gray-500">
                                    {loan.memberId?.email || 'Email not available'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Member ID</span>
                                <span className="font-mono text-gray-700">
                                    {loan.memberId?._id?.slice(-6) || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Request Date</span>
                                <span className="text-gray-700">{formatDate(loan.requestDate)}</span>
                            </div>
                            {loan.approvalDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Approved</span>
                                    <span className="text-gray-700">{formatDate(loan.approvalDate)}</span>
                                </div>
                            )}
                            {loan.disbursementDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Disbursed</span>
                                    <span className="text-gray-700">{formatDate(loan.disbursementDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signature Progress */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h2>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">
                                    {loan.signatures?.length || 0}/{loan.requiredSignatures || 0}
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 rounded-full transition-all"
                                    style={{
                                        width: `${loan.requiredSignatures ? ((loan.signatures?.length || 0) / loan.requiredSignatures) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {loan.signatures?.map((signature, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {signature.memberName || 'Unknown'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(signature.signedAt)}</span>
                                </div>
                            ))}
                            {(!loan.signatures || loan.signatures.length === 0) && (
                                <p className="text-sm text-gray-400 text-center py-4">No signatures yet</p>
                            )}
                        </div>

                        {/* Show if current user has signed */}
                        {hasUserSigned && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    You have signed this loan
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Disbursement Receipt (if available) */}
                    {loan.disbursementReceiptUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Disbursement Receipt</h2>
                            <a
                                href={loan.disbursementReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <Download className="w-5 h-5 text-primary-600" />
                                <span className="text-sm text-gray-700">View Receipt</span>
                            </a>
                        </div>
                    )}

                    {/* Interest Rate Info Card */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                        <Calculator className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-800">Low Interest Rate: 1.5% Monthly</p>
                            <p className="text-xs text-green-700 mt-1">
                                This loan has a competitive 1.5% monthly interest rate (0.05% daily).
                                Interest only accrues on the remaining principal balance, so paying early saves money!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disburse Modal */}
            {showDisburseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDisburseModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Disburse Loan Funds</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receipt URL (optional)
                                </label>
                                <input
                                    type="text"
                                    value={disburseReceipt}
                                    onChange={(e) => setDisburseReceipt(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={disburseNotes}
                                    onChange={(e) => setDisburseNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Any additional notes..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-xs text-amber-800">
                                    <span className="font-medium">Amount to disburse:</span>{' '}
                                    {formatCurrency(loan.remainingPrincipal || 0)}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowDisburseModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDisburse}
                                    disabled={disburseLoan.isPending}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    {disburseLoan.isPending ? 'Dispursing...' : 'Confirm Disburse'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanDetailsPage;
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useLoan, useSignLoan, useApproveLoan, useDisburseLoan } from '../../hooks/useLoans';
// import {
//     ArrowLeft,
//     HandCoins,
//     Clock,
//     CheckCircle,
//     XCircle,
//     TrendingUp,
//     DollarSign,
//     Download,
//     ThumbsUp,
//     Send,
//     AlertCircle,
//     BarChart,
//     TrendingUp as TrendingIcon,
//     RefreshCw,
//     Shield,
//     UserCheck
// } from 'lucide-react';
// import { cn } from '../../lib/utils';
// import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
// import { LoanStatusColors } from '../../types/loan.types';
// import toast from 'react-hot-toast';

// const LoanDetailsPage = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const { data: loan, isLoading, error, refetch, isFetching } = useLoan(id!);

//     const signLoan = useSignLoan();
//     const approveLoan = useApproveLoan();
//     const disburseLoan = useDisburseLoan();

//     const [showDisburseModal, setShowDisburseModal] = useState(false);
//     const [disburseReceipt, setDisburseReceipt] = useState('');
//     const [disburseNotes, setDisburseNotes] = useState('');
//     const [showSignConfirmModal, setShowSignConfirmModal] = useState(false);

//     // State for real-time interest calculation
//     const [currentInterest, setCurrentInterest] = useState(0);
//     const [daysSinceDisbursement, setDaysSinceDisbursement] = useState(0);
//     const [dailyRate, setDailyRate] = useState(0);

//     // Force re-render when loan data changes
//     useEffect(() => {
//         console.log('🔄 Loan data updated:', loan);
//     }, [loan]);

//     // Calculate current interest whenever loan data changes
//     useEffect(() => {
//         if (loan && loan.status === 'active') {
//             // Calculate daily rate (3% monthly = 0.1% daily)
//             const daily = (loan.interestRate / 100) / 30;
//             setDailyRate(daily);

//             // Calculate days since last interest calculation
//             const lastCalc = loan.lastInterestCalculation
//                 ? new Date(loan.lastInterestCalculation)
//                 : loan.disbursementDate
//                     ? new Date(loan.disbursementDate)
//                     : new Date(loan.requestDate);

//             const now = new Date();
//             const daysDiff = Math.floor((now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24));
//             setDaysSinceDisbursement(daysDiff);

//             // Calculate interest accrued since last calculation
//             if (daysDiff > 0) {
//                 const newInterest = loan.remainingPrincipal * daily * daysDiff;
//                 setCurrentInterest(Math.round(newInterest * 100) / 100);
//             } else {
//                 setCurrentInterest(0);
//             }
//         }
//     }, [loan]);

//     // Debug logging
//     useEffect(() => {
//         console.log('🔍 LoanDetailsPage Debug:');
//         console.log('Loan ID from params:', id);
//         console.log('Current user:', user);
//         console.log('Loan data:', loan);
//     }, [id, user, loan]);

//     const handleRefresh = async () => {
//         console.log('🔄 Manually refreshing loan data...');
//         toast.loading('Refreshing data...', { id: 'refresh' });
//         try {
//             await refetch();
//             toast.success('Data refreshed!', { id: 'refresh' });
//         } catch (err) {
//             toast.error('Failed to refresh data', { id: 'refresh' });
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center">
//                 <div className="relative">
//                     <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
//                     <p className="mt-4 text-sm text-gray-500">Loading loan details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !loan) {
//         const errorMessage = error
//             ? (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to load loan'
//             : 'Loan not found';

//         const statusCode = (error as any)?.response?.status;
//         const errorDetails = (error as any)?.response?.data;

//         console.error('❌ Loan fetch error:', {
//             error,
//             statusCode,
//             message: errorMessage,
//             details: errorDetails
//         });

//         return (
//             <div className="min-h-[60vh] flex items-center justify-center p-4">
//                 <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//                     <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                         <AlertCircle className="w-8 h-8 text-red-600" />
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Loan</h2>
//                     <p className="text-gray-600 mb-4">{errorMessage}</p>

//                     {statusCode && (
//                         <div className="bg-gray-50 p-3 rounded-xl mb-4">
//                             <p className="text-xs text-gray-500">Status Code: {statusCode}</p>
//                             {errorDetails && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Details: {JSON.stringify(errorDetails)}
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     <p className="text-sm text-gray-500 mb-4">Loan ID: {id}</p>

//                     <div className="flex gap-3">
//                         <button
//                             onClick={handleRefresh}
//                             className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
//                         >
//                             Try Again
//                         </button>
//                         <button
//                             onClick={() => navigate('/loans')}
//                             className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
//                         >
//                             Back to Loans
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // ALL USERS CAN VIEW ALL LOANS - NO RESTRICTIONS

//     // Check if current user is the owner
//     const isOwner = user?._id && loan.memberId?._id &&
//         loan.memberId._id.toString() === user._id.toString();

//     // Check if current user has already signed
//     const hasUserSigned = loan.signatures?.some(s => {
//         const sigMemberId = s.memberId?._id || s.memberId;
//         return sigMemberId?.toString() === user?._id?.toString();
//     });

//     // ALL USERS can sign EXCEPT:
//     // 1. The loan owner
//     // 2. People who already signed
//     // 3. Only when status is 'pending'
//     const canSign = !isOwner &&
//         !hasUserSigned &&
//         loan.status === 'pending';

//     // Approver/Super Admin/Admin can approve when 50%+ signatures reached
//     const canApprove = ['approver', 'super_admin', 'admin'].includes(user?.role || '') &&
//         loan.status === 'ready_for_approval';

//     // Super Admin can disburse when approved
//     const canDisburse = user?.role === 'super_admin' && loan.status === 'approved';

//     // ✅ FIXED: Owner can make payments when:
//     // 1. They are the owner
//     // 2. Loan status is 'active' (including after payments are approved)
//     // 3. Loan is NOT fully paid (remainingPrincipal > 0)
//     const canMakePayment = isOwner &&
//         loan.status === 'active' &&
//         loan.remainingPrincipal > 0;

//     // Check if there are pending payments
//     const hasPendingPayments = loan.pendingPayments?.some(p => p.status === 'pending') || false;

//     console.log('🔑 Payment Permission:', {
//         isOwner,
//         status: loan.status,
//         remainingPrincipal: loan.remainingPrincipal,
//         canMakePayment,
//         hasPendingPayments
//     });

//     const handleSign = async () => {
//         try {
//             await signLoan.mutateAsync(id!);
//             setShowSignConfirmModal(false);
//             toast.success('Loan signed successfully!');
//             // Wait a bit then refresh
//             setTimeout(async () => {
//                 await refetch();
//                 toast.success('Data updated!');
//             }, 1000);
//         } catch (error) {
//             // Error handled in hook
//         }
//     };

//     const handleApprove = async () => {
//         try {
//             await approveLoan.mutateAsync(id!);
//             toast.success('Loan approved successfully!');
//             // Wait a bit then refresh
//             setTimeout(async () => {
//                 await refetch();
//                 toast.success('Data updated!');
//             }, 1000);
//         } catch (error) {
//             // Error handled in hook
//         }
//     };

//     const handleDisburse = async () => {
//         try {
//             await disburseLoan.mutateAsync({
//                 id: id!,
//                 receiptUrl: disburseReceipt,
//                 notes: disburseNotes
//             });
//             setShowDisburseModal(false);
//             toast.success('Loan disbursed successfully!');
//             // Wait a bit then refresh
//             setTimeout(async () => {
//                 await refetch();
//                 toast.success('Data updated!');
//             }, 1000);
//         } catch (error) {
//             // Error handled in hook
//         }
//     };

//     const getStatusIcon = (status: string) => {
//         switch (status) {
//             case 'pending':
//                 return <Clock className="w-5 h-5" />;
//             case 'ready_for_approval':
//                 return <CheckCircle className="w-5 h-5" />;
//             case 'approved':
//                 return <CheckCircle className="w-5 h-5" />;
//             case 'active':
//                 return <TrendingUp className="w-5 h-5" />;
//             case 'payment_pending':
//                 return <Clock className="w-5 h-5" />;
//             case 'completed':
//                 return <CheckCircle className="w-5 h-5" />;
//             case 'rejected':
//                 return <XCircle className="w-5 h-5" />;
//             default:
//                 return <AlertCircle className="w-5 h-5" />;
//         }
//     };

//     // Calculate total current value (principal + unpaid interest + current interest)
//     const totalCurrentValue = loan.remainingPrincipal + (loan.unpaidInterest || 0) + currentInterest;

//     return (
//         <div className="max-w-6xl mx-auto space-y-6 pb-8">
//             {/* Header with back button and refresh */}
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <button
//                         onClick={() => navigate('/loans')}
//                         className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                     >
//                         <ArrowLeft className="w-5 h-5 text-gray-600" />
//                     </button>
//                     <div>
//                         <div className="flex items-center gap-3">
//                             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                                 <HandCoins className="w-6 h-6 text-primary-600" />
//                                 Loan Details
//                             </h1>
//                             <span className={cn(
//                                 "px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
//                                 LoanStatusColors[loan.status]?.bg || 'bg-gray-100',
//                                 LoanStatusColors[loan.status]?.text || 'text-gray-700'
//                             )}>
//                                 {getStatusIcon(loan.status)}
//                                 {LoanStatusColors[loan.status]?.label || loan.status.replace(/_/g, ' ')}
//                             </span>
//                         </div>
//                         <p className="text-sm text-gray-500 mt-1">
//                             Loan #{loan.loanNumber} • Requested by {loan.memberName} on {formatDate(loan.requestDate)}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Refresh Button */}
//                 <button
//                     onClick={handleRefresh}
//                     disabled={isFetching}
//                     className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
//                     title="Refresh data"
//                 >
//                     <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
//                     <span className="text-sm font-medium hidden sm:inline">Refresh</span>
//                 </button>
//             </div>

//             {/* Sign to Approve Modal with Warranty Description */}
//             {showSignConfirmModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                     <div className="fixed inset-0 bg-black/50" onClick={() => setShowSignConfirmModal(false)} />
//                     <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
//                         <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                             <Shield className="w-8 h-8 text-amber-600" />
//                         </div>

//                         <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sign to Approve Loan</h3>

//                         <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
//                             <div className="flex items-start gap-3">
//                                 <UserCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-amber-800 mb-2">Warranty Statement</p>
//                                     <p className="text-sm text-amber-700 italic">
//                                         "I, <span className="font-bold text-amber-900">{user?.name || 'I'}</span>, hereby confirm that I have reviewed this loan request and take full responsibility for approving it as a member of the Mahber. I understand that this approval represents my commitment to the collective responsibility of the group."
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <p className="text-xs text-gray-500 mb-6 text-center">
//                             By signing, you agree to the terms and conditions of the Mahber and acknowledge your responsibility in this collective decision.
//                         </p>

//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowSignConfirmModal(false)}
//                                 className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleSign}
//                                 disabled={signLoan.isPending}
//                                 className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
//                             >
//                                 {signLoan.isPending ? (
//                                     <>
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                         Signing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <ThumbsUp className="w-5 h-5" />
//                                         Yes, Sign & Approve
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-4 mt-6 mb-8">
//                 {canSign && (
//                     <button
//                         onClick={() => setShowSignConfirmModal(true)}
//                         className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
//                     >
//                         <Shield className="w-6 h-6" />
//                         {signLoan.isPending ? 'Signing...' : 'Sign to Approve'}
//                     </button>
//                 )}

//                 {canApprove && (
//                     <button
//                         onClick={handleApprove}
//                         disabled={approveLoan.isPending}
//                         className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
//                     >
//                         <CheckCircle className="w-6 h-6" />
//                         {approveLoan.isPending ? 'Approving...' : 'Approve Loan'}
//                     </button>
//                 )}

//                 {canDisburse && (
//                     <button
//                         onClick={() => setShowDisburseModal(true)}
//                         className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
//                     >
//                         <Send className="w-6 h-6" />
//                         Disburse Funds
//                     </button>
//                 )}

//                 {/* Make Payment button - shows for active loans with remaining principal */}
//                 {canMakePayment && (
//                     <button
//                         onClick={() => navigate(`/loans/${id}/pay`)}
//                         className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl shadow-amber-500/40 border border-amber-400"
//                     >
//                         <DollarSign className="w-6 h-6" />
//                         Make Payment
//                     </button>
//                 )}

//                 {/* Show pending payment indicator - unchanged */}
//                 {hasPendingPayments && isOwner && (
//                     <div className="px-8 py-4 bg-amber-100 text-amber-800 font-bold text-lg rounded-xl flex items-center gap-3 border-2 border-amber-300">
//                         <Clock className="w-6 h-6" />
//                         Payment Pending Approval
//                     </div>
//                 )}
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left Column - Loan Info */}
//                 <div className="lg:col-span-2 space-y-6">
//                     {/* Loan Summary Card */}
//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                         <div className="flex items-center gap-2 mb-4">
//                             <BarChart className="w-5 h-5 text-primary-600" />
//                             <h2 className="text-lg font-semibold text-gray-900">Loan Statistics</h2>
//                         </div>

//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                             <div>
//                                 <p className="text-xs text-gray-500">Principal</p>
//                                 <p className="text-xl font-bold text-gray-900">
//                                     {formatCurrency(loan.principal || 0)}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-xs text-gray-500">Interest Rate</p>
//                                 <p className="text-xl font-bold text-amber-600">
//                                     {loan.interestRate || 3}%
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-xs text-gray-500">Remaining Principal</p>
//                                 <p className="text-xl font-bold text-primary-600">
//                                     {formatCurrency(loan.remainingPrincipal || 0)}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-xs text-gray-500">Unpaid Interest</p>
//                                 <p className="text-xl font-bold text-amber-600">
//                                     {formatCurrency(loan.unpaidInterest || 0)}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Daily Interest Accrual */}
//                         {loan.status === 'active' && (
//                             <div className="mt-4 p-4 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
//                                 <div className="flex items-center gap-2 mb-3">
//                                     <TrendingIcon className="w-5 h-5 text-amber-600" />
//                                     <h3 className="font-semibold text-amber-800">Daily Interest Accrual</h3>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <p className="text-xs text-amber-600">Daily Rate</p>
//                                         <p className="text-lg font-bold text-amber-800">
//                                             {(dailyRate * 100).toFixed(2)}%
//                                         </p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-amber-600">Days Since Last Calc</p>
//                                         <p className="text-lg font-bold text-amber-800">
//                                             {daysSinceDisbursement} days
//                                         </p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-amber-600">Interest Added Today</p>
//                                         <p className="text-lg font-bold text-green-600">
//                                             +{formatCurrency(currentInterest)}
//                                         </p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-amber-600">Total Current Value</p>
//                                         <p className="text-lg font-bold text-primary-600">
//                                             {formatCurrency(totalCurrentValue)}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <p className="text-xs text-amber-600 mt-2">
//                                     Interest accrues daily at {(dailyRate * 100).toFixed(2)}% of remaining principal
//                                 </p>
//                             </div>
//                         )}

//                         <div className="mt-4 pt-4 border-t border-gray-100">
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Total Payable (Original)</span>
//                                 <span className="font-medium text-gray-900">
//                                     {formatCurrency(loan.totalPayable || 0)}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between text-sm mt-2">
//                                 <span className="text-gray-500">Amount Paid</span>
//                                 <span className="font-medium text-green-600">
//                                     {formatCurrency(loan.amountPaid || 0)}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Purpose and Notes */}
//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Purpose & Details</h2>

//                         <div className="mb-4">
//                             <p className="text-xs text-gray-500 mb-1">Purpose</p>
//                             <p className="text-gray-900 capitalize">{loan.purpose || 'Not specified'}</p>
//                         </div>

//                         {loan.notes && (
//                             <div>
//                                 <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
//                                 <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{loan.notes}</p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Payment History */}
//                     {loan.paymentHistory && loan.paymentHistory.length > 0 && (
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>

//                             <div className="space-y-3">
//                                 {loan.paymentHistory.map((payment, index) => (
//                                     <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                                         <div>
//                                             <p className="font-medium text-gray-900">{formatCurrency(payment.amount || 0)}</p>
//                                             <p className="text-xs text-gray-500 mt-1">{formatDateTime(payment.date)}</p>
//                                         </div>
//                                         <div className="text-right">
//                                             <p className="text-sm text-green-600">+{formatCurrency(payment.principalPortion || 0)} principal</p>
//                                             <p className="text-xs text-amber-600">{formatCurrency(payment.interestPortion || 0)} interest</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Right Column - Member Info & Signatures */}
//                 <div className="space-y-6">
//                     {/* Member Info */}
//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Information</h2>

//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
//                                 {loan.memberName?.charAt(0).toUpperCase() || 'U'}
//                             </div>
//                             <div>
//                                 <p className="font-medium text-gray-900">{loan.memberName || 'Unknown Member'}</p>
//                                 <p className="text-sm text-gray-500">
//                                     {loan.memberId?.email || 'Email not available'}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="space-y-2 text-sm">
//                             <div className="flex justify-between">
//                                 <span className="text-gray-500">Member ID</span>
//                                 <span className="font-mono text-gray-700">
//                                     {loan.memberId?._id?.slice(-6) || 'N/A'}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between">
//                                 <span className="text-gray-500">Request Date</span>
//                                 <span className="text-gray-700">{formatDate(loan.requestDate)}</span>
//                             </div>
//                             {loan.approvalDate && (
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-500">Approved</span>
//                                     <span className="text-gray-700">{formatDate(loan.approvalDate)}</span>
//                                 </div>
//                             )}
//                             {loan.disbursementDate && (
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-500">Disbursed</span>
//                                     <span className="text-gray-700">{formatDate(loan.disbursementDate)}</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Signature Progress */}
//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h2>

//                         <div className="mb-4">
//                             <div className="flex justify-between text-sm mb-2">
//                                 <span className="text-gray-600">Progress</span>
//                                 <span className="font-medium text-gray-900">
//                                     {loan.signatures?.length || 0}/{loan.requiredSignatures || 0}
//                                 </span>
//                             </div>
//                             <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
//                                 <div
//                                     className="h-full bg-primary-600 rounded-full transition-all"
//                                     style={{
//                                         width: `${loan.requiredSignatures ? ((loan.signatures?.length || 0) / loan.requiredSignatures) * 100 : 0}%`
//                                     }}
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {loan.signatures?.map((signature, index) => (
//                                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
//                                     <div className="flex items-center gap-2">
//                                         <CheckCircle className="w-4 h-4 text-green-600" />
//                                         <span className="text-sm font-medium text-gray-700">
//                                             {signature.memberName || 'Unknown'}
//                                         </span>
//                                     </div>
//                                     <span className="text-xs text-gray-400">{formatDate(signature.signedAt)}</span>
//                                 </div>
//                             ))}
//                             {(!loan.signatures || loan.signatures.length === 0) && (
//                                 <p className="text-sm text-gray-400 text-center py-4">No signatures yet</p>
//                             )}
//                         </div>

//                         {/* Show if current user has signed */}
//                         {hasUserSigned && (
//                             <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//                                 <p className="text-sm text-green-700 flex items-center gap-2">
//                                     <CheckCircle className="w-4 h-4" />
//                                     You have signed this loan
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Disbursement Receipt (if available) */}
//                     {loan.disbursementReceiptUrl && (
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Disbursement Receipt</h2>
//                             <a
//                                 href={loan.disbursementReceiptUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
//                             >
//                                 <Download className="w-5 h-5 text-primary-600" />
//                                 <span className="text-sm text-gray-700">View Receipt</span>
//                             </a>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Disburse Modal */}
//             {showDisburseModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                     <div className="fixed inset-0 bg-black/50" onClick={() => setShowDisburseModal(false)} />
//                     <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
//                         <h3 className="text-xl font-bold text-gray-900 mb-4">Disburse Loan Funds</h3>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Receipt URL (optional)
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={disburseReceipt}
//                                     onChange={(e) => setDisburseReceipt(e.target.value)}
//                                     placeholder="https://..."
//                                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Notes (optional)
//                                 </label>
//                                 <textarea
//                                     value={disburseNotes}
//                                     onChange={(e) => setDisburseNotes(e.target.value)}
//                                     rows={3}
//                                     placeholder="Any additional notes..."
//                                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
//                                 />
//                             </div>

//                             <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
//                                 <p className="text-xs text-amber-800">
//                                     <span className="font-medium">Amount to disburse:</span>{' '}
//                                     {formatCurrency(loan.remainingPrincipal || 0)}
//                                 </p>
//                             </div>

//                             <div className="flex gap-3 pt-4">
//                                 <button
//                                     onClick={() => setShowDisburseModal(false)}
//                                     className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleDisburse}
//                                     disabled={disburseLoan.isPending}
//                                     className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl disabled:opacity-50"
//                                 >
//                                     {disburseLoan.isPending ? 'Dispursing...' : 'Confirm Disburse'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default LoanDetailsPage;