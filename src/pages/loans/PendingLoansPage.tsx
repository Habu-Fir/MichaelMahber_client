import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoans, useApproveLoan } from '../../hooks/useLoans';
import {
    Clock,
    CheckCircle,
    Eye,
    User,
    Calendar,
    AlertCircle,
    Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

const PendingLoansPage = () => {
    const navigate = useNavigate();
    const { isApprover, isSuperAdmin } = useAuth();
    const approveLoan = useApproveLoan();

    // Fetch loans that are ready for approval
    const { data, isLoading, error, refetch } = useLoans({
        status: 'ready_for_approval'
    });

    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Check if user has permission
    if (!isApprover && !isSuperAdmin) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        Only Approvers and Super Admins can access this page.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleApprove = async (loanId: string) => {
        try {
            await approveLoan.mutateAsync(loanId);
            setShowConfirmModal(false);
            setSelectedLoan(null);
            refetch();
        } catch (error) {
            // Error handled in hook
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading pending loans...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Loans</h2>
                    <p className="text-gray-600 mb-6">Failed to load pending loans. Please try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const pendingLoans = data?.data || [];

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        Pending Loans for Approval
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Loans that have reached 50% signatures and need your final approval
                    </p>
                </div>
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="font-semibold">{pendingLoans.length}</span>
                    <span className="text-sm">Pending</span>
                </div>
            </div>

            {/* Pending Loans List */}
            {pendingLoans.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No loans waiting for approval at this time.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingLoans.map((loan) => (
                        <div
                            key={loan._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Left - Loan Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{loan.loanNumber}</h3>
                                        <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {loan.memberName}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Requested {formatDate(loan.requestDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Center - Loan Details */}
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Principal</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(loan.principal)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Interest</p>
                                        <p className="text-sm font-medium text-amber-600">
                                            {loan.interestRate}% monthly
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Signatures</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-600 rounded-full"
                                                    style={{ width: `${(loan.signatures?.length / loan.requiredSignatures) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                {loan.signatures?.length}/{loan.requiredSignatures}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right - Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/loans/${loan._id}`)}
                                        className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedLoan(loan);
                                            setShowConfirmModal(true);
                                        }}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Confirmation Modal */}
            {showConfirmModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Loan</h3>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-2">Loan Details:</p>
                                <p className="font-medium">{selectedLoan.loanNumber}</p>
                                <p className="text-sm text-gray-600 mt-1">Member: {selectedLoan.memberName}</p>
                                <p className="text-sm text-gray-600">Principal: {formatCurrency(selectedLoan.principal)}</p>
                                <p className="text-sm text-gray-600">
                                    Signatures: {selectedLoan.signatures?.length}/{selectedLoan.requiredSignatures}
                                </p>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to approve this loan? This will mark it as approved and ready for disbursement.
                            </p>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedLoan._id)}
                                    disabled={approveLoan.isPending}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {approveLoan.isPending ? 'Approving...' : 'Confirm Approval'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingLoansPage;