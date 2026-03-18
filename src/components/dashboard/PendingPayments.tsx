import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

interface PendingPayment {
    id: string;
    memberName: string;
    loanNumber: string;
    amount: number;
    requestedAt: string;
    paymentMethod: string;
}

interface PendingPaymentsProps {
    payments: PendingPayment[];
}

const PendingPayments: React.FC<PendingPaymentsProps> = ({ payments }) => {
    const navigate = useNavigate();

    if (payments.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Pending Payments
                    </h3>
                    <p className="text-sm text-gray-500">
                        All payments have been processed
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {payments.length} payment{payments.length > 1 ? 's' : ''} waiting for approval
                    </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                    {payments.length}
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{payment.memberName}</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Loan #{payment.loanNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {payment.paymentMethod}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(payment.requestedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    {payment.amount.toLocaleString()} ETB
                                </p>
                                <button
                                    onClick={() => navigate(`/pending-payments`)}
                                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Review
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {payments.length > 5 && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => navigate('/pending-payments')}
                        className="flex items-center justify-center gap-2 text-sm text-primary-600 font-medium w-full hover:text-primary-700 transition-colors"
                    >
                        View All {payments.length} Payments
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PendingPayments;