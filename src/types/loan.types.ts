export interface Loan {
    _id: string;
    loanNumber: string;
    memberId: {
        _id: string;
        name: string;
        email: string;
    };
    memberName: string;
    principal: number;
    interestRate: number;
    totalPayable: number;
    amountPaid: number;
    remainingPrincipal: number;
    interestAccrued: number;
    interestPaid: number;
    lastInterestCalculation: string;
    status: 'pending' | 'ready_for_approval' | 'approved' | 'active' | 'payment_pending' | 'completed' | 'rejected';
    requestDate: string;
    approvalDate?: string;
    disbursementDate?: string;
    completedDate?: string;
    requiredSignatures: number;
    signatures: Array<{
        memberId: {
            _id: string;
            name: string;
        };
        signedAt: string;
        memberName: string;
    }>;
    purpose: string;
    notes?: string;
    disbursementReceiptUrl?: string;
    paymentHistory: Payment[];
    pendingPayments?: PendingPayment[];
    signatureProgress: number;
    unpaidInterest: number;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    amount: number;
    principalPortion: number;
    interestPortion: number;
    date: string;
    paymentMethod: 'cash' | 'bank' | 'mobile';
    receiptUrl?: string;
    approvedBy?: {
        _id: string;
        name: string;
    };
    approvedAt?: string;
}

export interface PendingPayment {
    [x: string]: any;
    _id: Key | null | undefined;
    paymentDate(paymentDate: any): import("react").ReactNode;
    principalPortion(principalPortion: any): import("react").ReactNode;
    interestPortion(interestPortion: any): import("react").ReactNode;
    amount: number;
    paymentMethod: string;
    receiptUrl?: string;
    notes?: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface LoanRequestData {
    principal: number;
    purpose: string;
    notes?: string;
}

export interface PaymentRequestData {
    amount: number;
    paymentMethod: 'cash' | 'bank' | 'mobile';
    receiptUrl?: string;
    notes?: string;
}

export interface ApprovePaymentData {
    paymentIndex: number;
    approve: boolean;
    notes?: string;
}

export type LoanStatus = Loan['status'];

export const LoanStatusColors: Record<LoanStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    ready_for_approval: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ready for Approval' },
    approved: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Approved' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    payment_pending: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Payment Pending' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
};