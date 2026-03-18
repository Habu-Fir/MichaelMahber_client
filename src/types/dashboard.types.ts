export interface DashboardStats {
    totalMembers: number;
    activeMembers: number;
    totalLoans: number;
    activeLoans: number;
    totalPool: number;
    pendingPayments: number;
    totalInterest: number;
}

export interface LoanStatusData {
    name: string;
    value: number;
    color: string;
}

export interface MonthlyData {
    month: string;
    loans: number;
    contributions: number;
}

export interface RecentActivity {
    id: string;
    type: 'loan_request' | 'payment' | 'member_joined' | 'loan_approved';
    description: string;
    amount?: number;
    user: string;
    time: string;
    status?: string;
}

export interface PendingPayment {
    id: string;
    memberName: string;
    loanNumber: string;
    amount: number;
    requestedAt: string;
    paymentMethod: string;
}