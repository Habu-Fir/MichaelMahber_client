// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useAuth } from '../../context/AuthContext';
// import { useLoan, useRequestPayment } from '../../hooks/useLoans';
// import {
//     ArrowLeft,
//     DollarSign,
//     Banknote,
//     Landmark,
//     Smartphone,
//     AlertCircle,
//     Info,
//     Upload
// } from 'lucide-react';
// import { cn } from '../../lib/utils';
// import { formatCurrency } from '../../lib/utils';
// import toast from 'react-hot-toast';


// // Payment schema with proper typing
// const paymentSchema = z.object({
//     amount: z.number()
//         .min(1, 'Payment amount must be at least 1 ETB')
//         .max(1000000, 'Payment amount cannot exceed 1,000,000 ETB'),
//     paymentMethod: z.enum(['cash', 'bank', 'mobile'] as const),
//     receiptUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
//     notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
// });

// type PaymentForm = z.infer<typeof paymentSchema>;

// const PaymentPage = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const { data: loan, isLoading, refetch } = useLoan(id!);
//     const requestPayment = useRequestPayment();

//     const [currentInterest, setCurrentInterest] = useState(0);

//     // Calculate current interest
//     useEffect(() => {
//         if (loan && loan.status === 'active') {
//             const dailyRate = (loan.interestRate / 100) / 30;
//             const lastCalc = loan.lastInterestCalculation
//                 ? new Date(loan.lastInterestCalculation)
//                 : loan.disbursementDate
//                     ? new Date(loan.disbursementDate)
//                     : new Date(loan.requestDate);

//             const now = new Date();
//             const daysDiff = Math.floor((now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24));

//             if (daysDiff > 0) {
//                 const newInterest = loan.remainingPrincipal * dailyRate * daysDiff;
//                 setCurrentInterest(Math.round(newInterest * 100) / 100);
//             } else {
//                 setCurrentInterest(0);
//             }
//         }
//     }, [loan]);

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
//     const isOwner = user?._id && loan.memberId?._id &&
//         loan.memberId._id.toString() === user._id.toString();

//     if (!isOwner) {
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
//                     paymentMethod: data.paymentMethod, // Now correctly typed
//                     receiptUrl: data.receiptUrl || undefined,
//                     notes: data.notes,
//                 },
//             });

//             // Refetch and navigate back to loan details
//             await refetch();
//             navigate(`/loans/${id}`);
//             toast.success('Payment request submitted successfully!');
//         } catch (error) {
//             // Error handled in hook
//         }
//     };

//     // Calculate totals
//     const totalDue = loan.remainingPrincipal + (loan.unpaidInterest || 0) + currentInterest;
//     const dailyRate = (loan.interestRate / 100) / 30;

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
//                         Loan #{loan.loanNumber}
//                     </p>
//                 </div>
//             </div>

//             {/* Current Status Card */}
//             <div className="bg-linear-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
//                         <p className="text-lg font-bold text-amber-600">{formatCurrency(loan.unpaidInterest || 0)}</p>
//                     </div>
//                     <div>
//                         <p className="text-xs text-primary-700">Current Interest</p>
//                         <p className="text-lg font-bold text-amber-600">{formatCurrency(currentInterest)}</p>
//                     </div>
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-primary-200">
//                     <div className="flex justify-between items-center">
//                         <span className="text-sm text-primary-800">Total Due Today:</span>
//                         <span className="text-2xl font-bold text-primary-800">{formatCurrency(totalDue)}</span>
//                     </div>
//                     <p className="text-xs text-primary-600 mt-2">
//                         Interest accrues daily at {(dailyRate * 100).toFixed(2)}% ({loan.interestRate}% monthly)
//                     </p>
//                 </div>
//             </div>

//             {/* Info Card */}
//             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
//                 <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
//                 <p className="text-sm text-amber-800">
//                     Your payment will be marked as pending until Super Admin reviews and approves it.
//                     Interest will continue to accrue until approval.
//                 </p>
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
//                                     <span className="text-gray-600">Current Interest:</span>
//                                     <span className="font-medium text-amber-600">
//                                         {formatCurrency(Math.min(watchAmount, currentInterest))}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Unpaid Interest:</span>
//                                     <span className="font-medium text-amber-600">
//                                         {formatCurrency(Math.min(Math.max(0, watchAmount - currentInterest), loan.unpaidInterest || 0))}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Principal Portion:</span>
//                                     <span className="font-medium text-green-600">
//                                         {formatCurrency(Math.max(0, watchAmount - currentInterest - (loan.unpaidInterest || 0)))}
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
//                             onClick={() => setValue('paymentMethod', 'cash')}
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
//                             onClick={() => setValue('paymentMethod', 'bank')}
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
//                             onClick={() => setValue('paymentMethod', 'mobile')}
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
//                         <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
//                         className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
//                     >
//                         {requestPayment.isPending ? (
//                             <>
//                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                 Processing...
//                             </>
//                         ) : (
//                             <>
//                                 <DollarSign className="w-4 h-4" />
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


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useLoan, useRequestPayment } from '../../hooks/useLoans';
import {
    ArrowLeft,
    DollarSign,
    Banknote,
    Landmark,
    Smartphone,
    AlertCircle,
    Info,
    Upload,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

// Payment schema with Dashen USSD option
const paymentSchema = z.object({
    amount: z.number()
        .min(1, 'Payment amount must be at least 1 ETB')
        .max(1000000, 'Payment amount cannot exceed 1,000,000 ETB'),
    paymentMethod: z.enum(['cash', 'bank', 'mobile', 'dashen_ussd'] as const),
    phoneNumber: z.string()
        .regex(/^\+251[0-9]{9}$/, 'Phone number must be in format +2519XXXXXXXX')
        .optional(),
    receiptUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const PaymentPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: loan, isLoading, refetch } = useLoan(id!);
    const requestPayment = useRequestPayment();

    const [currentInterest, setCurrentInterest] = useState(0);
    const [dashenLoading, setDashenLoading] = useState(false);
    const [dashenResult, setDashenResult] = useState<{
        show: boolean;
        success?: boolean;
        message?: string;
        orderId?: string;
    }>({ show: false });

    // Get token from localStorage
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Calculate current interest
    useEffect(() => {
        if (loan && loan.status === 'active') {
            const dailyRate = (loan.interestRate / 100) / 30;
            const lastCalc = loan.lastInterestCalculation
                ? new Date(loan.lastInterestCalculation)
                : loan.disbursementDate
                    ? new Date(loan.disbursementDate)
                    : new Date(loan.requestDate);

            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff > 0) {
                const newInterest = loan.remainingPrincipal * dailyRate * daysDiff;
                setCurrentInterest(Math.round(newInterest * 100) / 100);
            } else {
                setCurrentInterest(0);
            }
        }
    }, [loan]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: undefined,
            paymentMethod: undefined,
            phoneNumber: '',
            receiptUrl: '',
            notes: '',
        },
    });

    const watchAmount = watch('amount');
    const watchMethod = watch('paymentMethod');

    // Reset Dashen result when payment method changes
    useEffect(() => {
        setDashenResult({ show: false });
    }, [watchMethod]);

    // Get the base URL and remove trailing /api if present
    const getBaseUrl = () => {
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Remove trailing /api if present
        if (baseUrl.endsWith('/api')) {
            baseUrl = baseUrl.slice(0, -4);
        }
        return baseUrl;
    };

    const handleDashenPayment = async (data: PaymentForm) => {
        if (!data.phoneNumber) {
            toast.error('Phone number is required for Dashen USSD payment');
            return;
        }

        setDashenLoading(true);
        setDashenResult({ show: false });

        const token = getToken();
        if (!token) {
            toast.error('Please login again');
            setDashenLoading(false);
            return;
        }

        try {
            // Use the normalized base URL
            const baseUrl = getBaseUrl();
            const url = `${baseUrl}/api/loans/dashen-payment/initiate`;
            console.log('📡 Calling URL:', url); // Should show correct URL

            const response = await axios.post(url, {
                loanId: id,
                amount: data.amount,
                phoneNumber: data.phoneNumber
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setDashenResult({
                    show: true,
                    success: true,
                    message: response.data.message,
                    orderId: response.data.data.orderId
                });
                toast.success('USSD payment request sent! Check your phone.');

                reset({
                    amount: undefined,
                    paymentMethod: 'dashen_ussd',
                    phoneNumber: data.phoneNumber,
                    receiptUrl: '',
                    notes: '',
                });

                await refetch();

                setTimeout(() => {
                    setDashenResult({ show: false });
                }, 10000);
            }
        } catch (error: any) {
            console.error('Dashen payment error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to initiate USSD payment';
            setDashenResult({
                show: true,
                success: false,
                message: errorMessage
            });
            toast.error(errorMessage);
        } finally {
            setDashenLoading(false);
        }
    };
    const onSubmit = async (data: PaymentForm) => {
        // Handle Dashen USSD payment separately
        if (data.paymentMethod === 'dashen_ussd') {
            await handleDashenPayment(data);
            return;
        }

        // Handle regular payment methods (cash, bank, mobile)
        try {
            await requestPayment.mutateAsync({
                id: id!,
                data: {
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    receiptUrl: data.receiptUrl || undefined,
                    notes: data.notes,
                },
            });

            await refetch();
            navigate(`/loans/${id}`);
            toast.success('Payment request submitted successfully!');
        } catch (error) {
            // Error handled in hook
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

    if (!loan) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loan Not Found</h2>
                    <button
                        onClick={() => navigate('/loans')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Back to Loans
                    </button>
                </div>
            </div>
        );
    }

    // Verify ownership
    const isOwner = user?._id && loan.memberId?._id &&
        loan.memberId._id.toString() === user._id.toString();

    if (!isOwner) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You don't have permission to make payments on this loan.</p>
                    <button
                        onClick={() => navigate('/loans')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Back to Loans
                    </button>
                </div>
            </div>
        );
    }

    // Check if loan is active
    if (loan.status !== 'active') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loan Not Active</h2>
                    <p className="text-gray-600 mb-6">
                        This loan is {loan.status.replace(/_/g, ' ')}. Only active loans can receive payments.
                    </p>
                    <button
                        onClick={() => navigate(`/loans/${id}`)}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        View Loan Details
                    </button>
                </div>
            </div>
        );
    }

    // Calculate totals
    const totalDue = loan.remainingPrincipal + (loan.unpaidInterest || 0) + currentInterest;
    const dailyRate = (loan.interestRate / 100) / 30;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/loans/${id}`)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary-600" />
                        Make a Payment
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Loan #{loan.loanNumber}
                    </p>
                </div>
            </div>

            {/* Current Status Card */}
            <div className="bg-linear-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-primary-700">Principal</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-primary-700">Remaining</p>
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(loan.remainingPrincipal)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-primary-700">Unpaid Interest</p>
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(loan.unpaidInterest || 0)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-primary-700">Current Interest</p>
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(currentInterest)}</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-primary-800">Total Due Today:</span>
                        <span className="text-2xl font-bold text-primary-800">{formatCurrency(totalDue)}</span>
                    </div>
                    <p className="text-xs text-primary-600 mt-2">
                        Interest accrues daily at {(dailyRate * 100).toFixed(2)}% ({loan.interestRate}% monthly)
                    </p>
                </div>
            </div>

            {/* Info Card - Updated for Dashen USSD */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                    {watchMethod === 'dashen_ussd'
                        ? 'Pay instantly via Dashen USSD push. You will receive a notification on your phone to enter your PIN and complete payment.'
                        : 'Your payment will be marked as pending until Super Admin reviews and approves it. Interest will continue to accrue until approval.'}
                </p>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Payment Amount */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Payment Amount (ETB) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ETB</span>
                        <input
                            type="number"
                            {...register('amount', { valueAsNumber: true })}
                            className={cn(
                                "w-full pl-16 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                errors.amount
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-200 focus:ring-primary-200'
                            )}
                            placeholder="Enter amount"
                            step="0.01"
                            min="1"
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}

                    {/* Payment breakdown preview */}
                    {watchAmount > 0 && watchMethod !== 'dashen_ussd' && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Interest:</span>
                                    <span className="font-medium text-amber-600">
                                        {formatCurrency(Math.min(watchAmount, currentInterest))}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unpaid Interest:</span>
                                    <span className="font-medium text-amber-600">
                                        {formatCurrency(Math.min(Math.max(0, watchAmount - currentInterest), loan.unpaidInterest || 0))}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Principal Portion:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(Math.max(0, watchAmount - currentInterest - (loan.unpaidInterest || 0)))}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 my-2"></div>
                                <div className="flex justify-between font-medium">
                                    <span>Total Payment:</span>
                                    <span>{formatCurrency(watchAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {watchAmount > 0 && watchMethod === 'dashen_ussd' && (
                        <div className="mt-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <p className="text-sm font-medium text-green-800 mb-2">USSD Payment Details</p>
                            <div className="space-y-1 text-sm text-green-700">
                                <p>✓ Payment will be processed instantly via USSD</p>
                                <p>✓ You'll receive a push notification on your phone</p>
                                <p>✓ Enter your Dashen PIN to confirm</p>
                                <p className="font-medium mt-2">Total to pay: {formatCurrency(watchAmount)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            type="button"
                            onClick={() => setValue('paymentMethod', 'cash')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
                                watchMethod === 'cash'
                                    ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                        >
                            <Banknote className={cn(
                                "w-5 h-5",
                                watchMethod === 'cash' ? 'text-primary-600' : 'text-gray-500'
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                watchMethod === 'cash' ? 'text-primary-700' : 'text-gray-600'
                            )}>
                                Cash
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('paymentMethod', 'bank')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
                                watchMethod === 'bank'
                                    ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                        >
                            <Landmark className={cn(
                                "w-5 h-5",
                                watchMethod === 'bank' ? 'text-primary-600' : 'text-gray-500'
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                watchMethod === 'bank' ? 'text-primary-700' : 'text-gray-600'
                            )}>
                                Bank
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('paymentMethod', 'mobile')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
                                watchMethod === 'mobile'
                                    ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                        >
                            <Smartphone className={cn(
                                "w-5 h-5",
                                watchMethod === 'mobile' ? 'text-primary-600' : 'text-gray-500'
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                watchMethod === 'mobile' ? 'text-primary-700' : 'text-gray-600'
                            )}>
                                Mobile
                            </span>
                        </button>

                        {/* Dashen USSD Button */}
                        <button
                            type="button"
                            onClick={() => setValue('paymentMethod', 'dashen_ussd')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
                                watchMethod === 'dashen_ussd'
                                    ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                        >
                            <Smartphone className={cn(
                                "w-5 h-5",
                                watchMethod === 'dashen_ussd' ? 'text-green-600' : 'text-gray-500'
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                watchMethod === 'dashen_ussd' ? 'text-green-700' : 'text-gray-600'
                            )}>
                                Dashen USSD
                            </span>
                        </button>
                    </div>
                    {errors.paymentMethod && (
                        <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
                    )}
                </div>

                {/* Phone Number - Only for Dashen USSD */}
                {watchMethod === 'dashen_ussd' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Dashen Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                {...register('phoneNumber')}
                                className={cn(
                                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                    errors.phoneNumber
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-primary-200'
                                )}
                                placeholder="+2519XXXXXXXX"
                            />
                        </div>
                        {errors.phoneNumber && (
                            <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Enter the phone number registered with Dashen Bank. You'll receive a USSD push to complete payment.
                        </p>
                    </div>
                )}

                {/* Receipt URL - Only for non-Dashen payments */}
                {watchMethod !== 'dashen_ussd' && watchMethod !== undefined && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Receipt URL (Optional)
                        </label>
                        <div className="relative">
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="url"
                                {...register('receiptUrl')}
                                className={cn(
                                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                    errors.receiptUrl
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-primary-200'
                                )}
                                placeholder="https://example.com/receipt.jpg"
                            />
                        </div>
                        {errors.receiptUrl && (
                            <p className="text-sm text-red-600">{errors.receiptUrl.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Upload your receipt to a cloud service and paste the link here
                        </p>
                    </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        {...register('notes')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                        placeholder="Any additional information about this payment..."
                    />
                </div>

                {/* Dashen Payment Result Display */}
                {dashenResult.show && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-start gap-3",
                        dashenResult.success
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                    )}>
                        {dashenResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className={cn(
                                "font-medium",
                                dashenResult.success ? "text-green-800" : "text-red-800"
                            )}>
                                {dashenResult.success ? 'Payment Request Sent!' : 'Payment Failed'}
                            </p>
                            <p className={cn(
                                "text-sm mt-1",
                                dashenResult.success ? "text-green-700" : "text-red-700"
                            )}>
                                {dashenResult.message}
                            </p>
                            {dashenResult.orderId && (
                                <p className="text-xs text-green-600 mt-2">
                                    Order ID: {dashenResult.orderId}
                                </p>
                            )}
                            {dashenResult.success && (
                                <div className="mt-3 pt-2 border-t border-green-200">
                                    <p className="text-xs text-green-700 font-medium">Next Steps:</p>
                                    <ol className="text-xs text-green-600 list-decimal list-inside mt-1 space-y-1">
                                        <li>Check your phone for USSD notification</li>
                                        <li>Open the notification or dial *127#</li>
                                        <li>Enter your Dashen Bank PIN when prompted</li>
                                        <li>Confirm the payment to complete</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/loans/${id}`)}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={requestPayment.isPending || dashenLoading}
                        className={cn(
                            "flex-1 px-4 py-3 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2",
                            watchMethod === 'dashen_ussd'
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                                : "bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30"
                        )}
                    >
                        {(requestPayment.isPending || dashenLoading) ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {watchMethod === 'dashen_ussd' ? 'Sending USSD Request...' : 'Processing...'}
                            </>
                        ) : (
                            <>
                                {watchMethod === 'dashen_ussd' ? (
                                    <>
                                        <Smartphone className="w-4 h-4" />
                                        Pay with Dashen USSD
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4" />
                                        Submit Payment Request
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentPage;