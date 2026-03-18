import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import loanService from '../services/loan.service';
import type { Loan, LoanRequestData, PaymentRequestData, ApprovePaymentData } from '../types/loan.types';
import toast from 'react-hot-toast';

// Define return types for queries
type AllLoansResponse = {
  data: Loan[];
  total: number;
  pages: number;
  page: number;
};

// ==================== GET ALL LOANS - EVERYONE USES THIS ====================
export const useLoans = (params?: { status?: string; page?: number }) => {
  return useQuery<AllLoansResponse, Error>({
    queryKey: ['loans', params],
    queryFn: () => loanService.getAllLoans(params),
  });
};

// ==================== GET SINGLE LOAN BY ID ====================
export const useLoan = (id: string) => {
  return useQuery<Loan, Error>({
    queryKey: ['loan', id],
    queryFn: () => loanService.getLoanById(id),
    enabled: !!id,
  });
};

// ==================== REQUEST NEW LOAN ====================
export const useRequestLoan = () => {
  const queryClient = useQueryClient();

  return useMutation<Loan, Error, LoanRequestData>({
    mutationFn: (data: LoanRequestData) => loanService.requestLoan(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });

      toast.success(
        `✅ Loan Request Submitted!\nLoan Number: ${data.loanNumber}\nStatus: ${data.status}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to request loan');
    },
  });
};

// ==================== SIGN LOAN ====================
export const useSignLoan = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => loanService.signLoan(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });

      if (data.status === 'ready_for_approval') {
        toast.success('🎉 Loan reached 50% signatures! Ready for approval.');
      } else {
        toast.success(`Loan signed! ${data.signatures}/${data.required} signatures`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sign loan');
    },
  });
};

// ==================== APPROVE LOAN (Approver only) ====================
export const useApproveLoan = () => {
  const queryClient = useQueryClient();

  return useMutation<Loan, Error, string>({
    mutationFn: (id: string) => loanService.approveLoan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      toast.success('✅ Loan approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve loan');
    },
  });
};

// ==================== DISBURSE LOAN (Super Admin only) ====================
export const useDisburseLoan = () => {
  const queryClient = useQueryClient();

  return useMutation<Loan, Error, { id: string; receiptUrl?: string; notes?: string }>({
    mutationFn: ({ id, receiptUrl, notes }) =>
      loanService.disburseLoan(id, receiptUrl, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      toast.success('💰 Loan disbursed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disburse loan');
    },
  });
};

// ==================== REQUEST PAYMENT (Member) ====================
export const useRequestPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: PaymentRequestData }>({
    mutationFn: ({ id, data }) =>
      loanService.requestPayment(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both the specific loan and the loans list
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('📤 Payment request submitted. Awaiting Super Admin approval.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to request payment');
    },
  });
};
// ==================== APPROVE/REJECT PAYMENT (Super Admin) ====================
export const useApprovePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: ApprovePaymentData }>({
    mutationFn: ({ id, data }) =>
      loanService.approvePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      toast.success('✅ Payment processed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    },
  });
};

// ==================== GET PENDING PAYMENTS (Super Admin) ====================
export const usePendingPayments = () => {
  return useQuery<any[], Error>({
    queryKey: ['pendingPayments'],
    queryFn: () => loanService.getPendingPayments(),
  });
};

// Keep for backward compatibility
export const useMyLoans = () => {
  return useQuery<Loan[], Error>({
    queryKey: ['myLoans'],
    queryFn: () => loanService.getMyLoans(),
  });
};