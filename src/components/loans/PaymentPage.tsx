// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useLoan, useRequestPayment } from '../../hooks/useLoans';
// import { useAuth } from '../../context/AuthContext';
// import {
//     ArrowLeft,
//     DollarSign,
//     Upload,
//     FileText,
//     AlertCircle,
//     CheckCircle,
//     Banknote,
//     Smartphone,
//     Landmark
// } from 'lucide-react';
// import { cn } from '../../lib/utils';
// import { formatCurrency } from '../../lib/utils';

// const paymentSchema = z.object({
//     amount: z.number()
//         .min(1, 'Payment amount must be at least 1 ETB')
//         .max(1000000, 'Payment amount cannot exceed 1,000,000 ETB'),
//     paymentMethod: z.enum(['cash', 'bank', 'mobile'], {
//         required_error: 'Please select a payment method',
//     }),
//     receiptUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
//     notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
// });

// type PaymentForm = z.infer<typeof paymentSchema>;

// const PaymentPage = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const { data: loan, isLoading } = useLoan(id!);
//     const requestPayment = useRequestPayment();

//     const [selectedMethod, setSelectedMethod] = useState<string>('');

//     const {
//         register,
//         handleSubmit,
//         watch,
//         setValue,
//         formState: { errors },
//     } = useForm<PaymentForm>({
//         resolver: zodResolver(paymentSchema),
//         defaultValues: {
//             amount: undefined,
//             paymentMethod: undefined,
//             receiptUrl: '',
//             notes: '',
//         },
//     });

//     const watchAmount = watch('amount');
//     const watchMethod = watch('paymentMethod');

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

//     if (!loan) {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center p-4">
//                 <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//                     <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                     <h2 className="text-xl font-bold text-gray-900 mb-2">Loan Not Found</h2>
//                     <p className="text-gray-600 mb-6">The loan you're looking for doesn't exist.</p>
//                     <button
//                         onClick={() => navigate('/loans')}
//                         className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
//                     >
//                         Back to Loans
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // Verify ownership
//     if (loan.memberId._id !== user?._id) {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center p-4">
//                 <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//                     <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                     <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
//                     <p className="text-gray-600 mb-6">You don't have permission to make payments on this loan.</p>
//                     <button
//                         onClick={() => navigate('/loans')}
//                         className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
//                     >
//                         Back to Loans
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // Check if loan is active
//     if (loan.status !== 'active') {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center p-4">
//                 <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//                     <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
//                     <h2 className="text-xl font-bold text-gray-900 mb-2">Loan Not Active</h2>
//                     <p className="text-gray-600 mb-6">
//                         This loan is {loan.status.replace(/_/g, ' ')}. Only active loans can receive payments.
//                     </p>
//                     <button
//                         onClick={() => navigate(`/loans/${id}`)}
//                         className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
//                     >
//                         View Loan Details
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const onSubmit = async (data: PaymentForm) => {
//         try {
//             await requestPayment.mutateAsync({
//                 id: id!,
//                 data: {
//                     amount: data.amount,
//                     paymentMethod: data.paymentMethod,
//                     receiptUrl: data.receiptUrl || undefined,
//                     notes: data.notes,
//                 },
//             });
//             navigate(`/loans/${id}`);
//         } catch (error) {
//             // Error handled in hook
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto space-y-6 pb-8">
//             {/* Header with back button */}
//             <div className="flex items-center gap-4">
//                 <button
//                     onClick={() => navigate(`/loans/${id}`)}
//                     className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                 >
//                     <ArrowLeft className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                         <DollarSign className="w-6 h-6 text-primary-600" />
//                         Make a Payment
//                     </h1>
//                     <p className="text-sm text-gray-500 mt-1">
//                         Loan #{loan.loanNumber} • {formatCurrency(loan.remainingPrincipal)} remaining
//                     </p>
//                 </div>
//             </div>

//             {/* Loan Summary Card */}
//             <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     <div>
//                         <p className="text-xs text-primary-700">Principal</p>
//                         <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.principal)}</p>
//                     </div>
//                     <div>
//                         <p className="text-xs text-primary-700">Remaining</p>
//                         <p className="text-lg font-bold text-amber-600">{formatCurrency(loan.remainingPrincipal)}</p>
//                     </div>
//                     <div>
//                         <p className="text-xs text-primary-700">Unpaid Interest</p>
//                         <p className="text-lg font-bold text-amber-600">{formatCurrency(loan.unpaidInterest)}</p>
//                     </div>
//                     <div>
//                         <p className="text-xs text-primary-700">Total Due</p>
//                         <p className="text-lg font-bold text-gray-900">
//                             {formatCurrency(loan.remainingPrincipal + loan.unpaidInterest)}
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* Payment Form */}
//             <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">

//                 {/* Payment Amount */}
//                 <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         Payment Amount (ETB) <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ETB</span>
//                         <input
//                             type="number"
//                             {...register('amount', { valueAsNumber: true })}
//                             className={cn(
//                                 "w-full pl-16 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
//                                 errors.amount
//                                     ? 'border-red-300 focus:ring-red-200'
//                                     : 'border-gray-200 focus:ring-primary-200'
//                             )}
//                             placeholder="Enter amount"
//                             step="0.01"
//                             min="1"
//                         />
//                     </div>
//                     {errors.amount && (
//                         <p className="text-sm text-red-600">{errors.amount.message}</p>
//                     )}

//                     {/* Payment breakdown preview */}
//                     {watchAmount > 0 && (
//                         <div className="mt-3 p-4 bg-gray-50 rounded-xl">
//                             <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
//                             <div className="space-y-2 text-sm">
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Unpaid Interest:</span>
//                                     <span className="font-medium text-amber-600">
//                                         {formatCurrency(Math.min(watchAmount, loan.unpaidInterest))}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Principal Portion:</span>
//                                     <span className="font-medium text-green-600">
//                                         {formatCurrency(Math.max(0, watchAmount - loan.unpaidInterest))}
//                                     </span>
//                                 </div>
//                                 <div className="border-t border-gray-200 my-2"></div>
//                                 <div className="flex justify-between font-medium">
//                                     <span>Total Payment:</span>
//                                     <span>{formatCurrency(watchAmount)}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Payment Method */}
//                 <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         Payment Method <span className="text-red-500">*</span>
//                     </label>
//                     <div className="grid grid-cols-3 gap-3">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setValue('paymentMethod', 'cash');
//                                 setSelectedMethod('cash');
//                             }}
//                             className={cn(
//                                 "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
//                                 watchMethod === 'cash'
//                                     ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
//                                     : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                             )}
//                         >
//                             <Banknote className={cn(
//                                 "w-5 h-5",
//                                 watchMethod === 'cash' ? 'text-primary-600' : 'text-gray-500'
//                             )} />
//                             <span className={cn(
//                                 "text-xs font-medium",
//                                 watchMethod === 'cash' ? 'text-primary-700' : 'text-gray-600'
//                             )}>
//                                 Cash
//                             </span>
//                         </button>

//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setValue('paymentMethod', 'bank');
//                                 setSelectedMethod('bank');
//                             }}
//                             className={cn(
//                                 "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
//                                 watchMethod === 'bank'
//                                     ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
//                                     : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                             )}
//                         >
//                             <Landmark className={cn(
//                                 "w-5 h-5",
//                                 watchMethod === 'bank' ? 'text-primary-600' : 'text-gray-500'
//                             )} />
//                             <span className={cn(
//                                 "text-xs font-medium",
//                                 watchMethod === 'bank' ? 'text-primary-700' : 'text-gray-600'
//                             )}>
//                                 Bank
//                             </span>
//                         </button>

//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setValue('paymentMethod', 'mobile');
//                                 setSelectedMethod('mobile');
//                             }}
//                             className={cn(
//                                 "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
//                                 watchMethod === 'mobile'
//                                     ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
//                                     : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                             )}
//                         >
//                             <Smartphone className={cn(
//                                 "w-5 h-5",
//                                 watchMethod === 'mobile' ? 'text-primary-600' : 'text-gray-500'
//                             )} />
//                             <span className={cn(
//                                 "text-xs font-medium",
//                                 watchMethod === 'mobile' ? 'text-primary-700' : 'text-gray-600'
//                             )}>
//                                 Mobile
//                             </span>
//                         </button>
//                     </div>
//                     {errors.paymentMethod && (
//                         <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
//                     )}
//                 </div>

//                 {/* Receipt URL */}
//                 <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         Receipt URL (Optional)
//                     </label>
//                     <div className="relative">
//                         <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                         <input
//                             type="url"
//                             {...register('receiptUrl')}
//                             className={cn(
//                                 "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
//                                 errors.receiptUrl
//                                     ? 'border-red-300 focus:ring-red-200'
//                                     : 'border-gray-200 focus:ring-primary-200'
//                             )}
//                             placeholder="https://example.com/receipt.jpg"
//                         />
//                     </div>
//                     {errors.receiptUrl && (
//                         <p className="text-sm text-red-600">{errors.receiptUrl.message}</p>
//                     )}
//                     <p className="text-xs text-gray-500">
//                         Upload your receipt to a cloud service and paste the link here
//                     </p>
//                 </div>

//                 {/* Notes */}
//                 <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         Additional Notes (Optional)
//                     </label>
//                     <textarea
//                         {...register('notes')}
//                         rows={3}
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
//                         placeholder="Any additional information about this payment..."
//                     />
//                 </div>

//                 {/* Info Box */}
//                 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
//                     <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <p className="text-sm font-medium text-amber-800">Important</p>
//                         <p className="text-xs text-amber-700 mt-1">
//                             Your payment will be marked as pending until Super Admin reviews and approves it.
//                             Interest will continue to accrue until approval.
//                         </p>
//                     </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex gap-3 pt-4">
//                     <button
//                         type="button"
//                         onClick={() => navigate(`/loans/${id}`)}
//                         className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={requestPayment.isPending}
//                         className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                         {requestPayment.isPending ? (
//                             <>
//                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                 Submitting...
//                             </>
//                         ) : (
//                             <>
//                                 <Upload className="w-4 h-4" />
//                                 Submit Payment
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PaymentPage;