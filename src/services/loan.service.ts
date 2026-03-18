import api from './api';
import type {
    Loan,
    LoanRequestData,
    PaymentRequestData,
    ApprovePaymentData
} from '../types/loan.types';

class LoanService {
    private baseUrl = '/loans';

    // ==================== REQUEST A NEW LOAN ====================
    async requestLoan(data: LoanRequestData): Promise<Loan> {
        const response = await api.post(`${this.baseUrl}/request`, data);
        return response.data.data;
    }

    // ==================== GET CURRENT USER'S LOANS ====================
    async getMyLoans(): Promise<Loan[]> {
        const response = await api.get(`${this.baseUrl}/my`);
        return response.data.data;
    }

    // ==================== GET LOAN BY ID ====================
    async getLoanById(id: string): Promise<Loan> {
        const response = await api.get(`${this.baseUrl}/${id}`);
        return response.data.data;
    }

    // ==================== SIGN A LOAN ====================
    async signLoan(id: string): Promise<{ signatures: number; required: number; status: string; progress: number }> {
        const response = await api.post(`${this.baseUrl}/${id}/sign`);
        return response.data.data;
    }

    // ==================== REQUEST PAYMENT (UPLOAD RECEIPT) ====================
    async requestPayment(id: string, data: PaymentRequestData): Promise<any> {
        const response = await api.post(`${this.baseUrl}/${id}/request-payment`, data);
        return response.data.data;
    }

    // ==================== APPROVE/REJECT PAYMENT (Super Admin) ====================
    async approvePayment(id: string, data: ApprovePaymentData): Promise<any> {
        console.log('📤 Sending approve payment request:', { id, data });

        // Ensure paymentIndex is a number
        const payload = {
            paymentIndex: Number(data.paymentIndex),
            approve: data.approve,
            notes: data.notes || ''
        };

        console.log('📦 Payload being sent:', payload);

        const response = await api.post(`${this.baseUrl}/${id}/approve-payment`, payload);
        return response.data.data;
    }

    // ==================== GET ALL LOANS (ADMIN/APPROVER) ====================
    async getAllLoans(params?: {
        status?: string;
        memberId?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ data: Loan[]; total: number; pages: number; page: number }> {
        const response = await api.get(this.baseUrl, { params });
        return response.data;
    }

    // ==================== GET PENDING PAYMENTS (SUPER ADMIN) ====================
    async getPendingPayments(): Promise<any[]> {
        const response = await api.get(`${this.baseUrl}/admin/pending-payments`);
        return response.data.data;
    }

    // ==================== APPROVE LOAN (APPROVER) ====================
    async approveLoan(id: string): Promise<Loan> {
        const response = await api.put(`${this.baseUrl}/${id}/approve`);
        return response.data.data;
    }

    // ==================== DISBURSE LOAN (SUPER ADMIN) ====================
    async disburseLoan(id: string, receiptUrl?: string, notes?: string): Promise<Loan> {
        const response = await api.post(`${this.baseUrl}/${id}/disburse`, { receiptUrl, notes });
        return response.data.data;
    }
}

export default new LoanService();