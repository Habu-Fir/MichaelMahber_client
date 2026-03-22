import { useState, useEffect } from 'react';
import { usePendingPayments, useApprovePayment } from '../../hooks/useLoans';
import {
    Clock,
    CheckCircle,
    Download,
    User,
    Calendar,
    FileText,
    AlertCircle,
    Check,
    X,
    RefreshCw,
    Eye
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import toast from 'react-hot-toast';

interface PendingPayment {
    loanId: string;
    loanNumber: string;
    memberName: string;
    remainingPrincipal: number;
    payment: {
        amount: number;
        paymentMethod: string;
        receiptUrl?: string;
        notes?: string;
        requestedAt: string;
        status: string;
        index: number;
        displayIndex?: number;
    };
}

const PendingPaymentsPage = () => {
    //const navigate = useNavigate();
    const { data: payments, isLoading, error, refetch, isFetching } = usePendingPayments();
    const approvePayment = useApprovePayment();

    const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionNotes, setActionNotes] = useState('');

    // Debug log payments data
    useEffect(() => {
        console.log('📊 Pending payments:', payments);
    }, [payments]);

    const handleApprove = async (loanId: string, paymentIndex: number) => {
        console.log('✅ Attempting to approve payment:', {
            loanId,
            paymentIndex,
            notes: actionNotes
        });

        try {
            await approvePayment.mutateAsync({
                id: loanId,
                data: {
                    paymentIndex: Number(paymentIndex),
                    approve: true,
                    notes: actionNotes
                }
            });

            toast.success('Payment approved successfully!');
            setShowModal(false);
            setSelectedPayment(null);
            setActionNotes('');

            // Refresh the list
            setTimeout(() => {
                refetch();
            }, 500);
        } catch (error: any) {
            console.error('❌ Approve error:', error);

            if (error.response?.data?.message?.includes('already been processed')) {
                toast.error('This payment has already been processed. Refreshing list...');
                refetch();
                setShowModal(false);
                setSelectedPayment(null);
            } else {
                toast.error(error.response?.data?.message || 'Failed to approve payment');
            }
        }
    };

    const handleReject = async (loanId: string, paymentIndex: number) => {
        console.log('❌ Rejecting payment:', { loanId, paymentIndex, notes: actionNotes });
        try {
            await approvePayment.mutateAsync({
                id: loanId,
                data: {
                    paymentIndex: Number(paymentIndex),
                    approve: false,
                    notes: actionNotes || 'Payment rejected'
                }
            });

            toast.success('Payment rejected successfully');
            setShowModal(false);
            setSelectedPayment(null);
            setActionNotes('');
            refetch();
        } catch (error: any) {
            console.error('❌ Reject error:', error);
            toast.error(error.response?.data?.message || 'Failed to reject payment');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading pending payments...</p>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Payments</h2>
                    <p className="text-gray-600 mb-6">Failed to load pending payments.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        Pending Payments
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review and approve payment requests from members
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="font-semibold">{payments?.length || 0}</span>
                        <span className="text-sm">Pending</span>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            {!payments?.length ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No pending payments to review at this time.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {payments.map((payment: PendingPayment) => (
                        <div
                            key={`${payment.loanId}-${payment.payment.requestedAt}-${payment.payment.index}`}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Left - Member Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{payment.memberName}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">Loan #{payment.loanNumber}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Requested {formatDateTime(payment.payment.requestedAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Center - Payment Details */}
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Amount</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(payment.payment.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Method</p>
                                        <p className="text-sm font-medium text-gray-700 capitalize">
                                            {payment.payment.paymentMethod}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Remaining</p>
                                        <p className="text-sm font-medium text-amber-600">
                                            {formatCurrency(payment.remainingPrincipal)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Payment #</p>
                                        <p className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-lg inline-block">
                                            Index: {payment.payment.index}
                                            {payment.payment.displayIndex !== undefined &&
                                                ` (Display: ${payment.payment.displayIndex + 1})`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Right - Actions */}
                                <div className="flex gap-2">
                                    {payment.payment.receiptUrl && (
                                        <a
                                            href={payment.payment.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 flex items-center gap-2"
                                            title="View Receipt"
                                        >
                                            <Eye className="w-5 h-5" />
                                            <span className="text-sm font-medium hidden sm:inline">Receipt</span>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            console.log('Selected payment:', payment);
                                            setSelectedPayment(payment);
                                            setShowModal(true);
                                        }}
                                        className="px-6 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-slide-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Review Payment</h2>

                        <div className="space-y-4">
                            {/* Payment Details */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Member</p>
                                        <p className="font-medium">{selectedPayment.memberName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Loan Number</p>
                                        <p className="font-medium">{selectedPayment.loanNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Amount</p>
                                        <p className="text-lg font-bold text-primary-600">
                                            {formatCurrency(selectedPayment.payment.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Payment Method</p>
                                        <p className="font-medium capitalize">{selectedPayment.payment.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Remaining Principal</p>
                                        <p className="font-medium">{formatCurrency(selectedPayment.remainingPrincipal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Requested</p>
                                        <p className="font-medium">{formatDateTime(selectedPayment.payment.requestedAt)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Payment Index</p>
                                        <p className="font-medium bg-blue-100 text-blue-700 px-3 py-2 rounded-lg inline-block">
                                            Index: {selectedPayment.payment.index}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={actionNotes}
                                    onChange={(e) => setActionNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                                    placeholder="Add any notes about this payment..."
                                />
                            </div>

                            {/* Receipt Preview */}
                            {selectedPayment.payment.receiptUrl && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Receipt</p>
                                    <a
                                        href={selectedPayment.payment.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-4 py-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Receipt
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedPayment.loanId, selectedPayment.payment.index)}
                                    disabled={approvePayment.isPending}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedPayment.loanId, selectedPayment.payment.index)}
                                    disabled={approvePayment.isPending}
                                    className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                                >
                                    {approvePayment.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingPaymentsPage;