import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useRequestLoan } from '../../hooks/useLoans';
import {
    HandCoins,
    ArrowLeft,
    Info,
    AlertCircle,
    Shield,
    Briefcase,
    GraduationCap,
    Home,
    Heart,
    CreditCard,
    FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const loanRequestSchema = z.object({
    principal: z.number()
        .min(100, 'Minimum loan amount is 100 ETB')
        .max(100000, 'Maximum loan amount is 100,000 ETB'),
    purpose: z.enum(['business', 'education', 'medical', 'home', 'debt', 'other'], {
        message: 'Please select a loan purpose'
    }),
    notes: z.string().optional(),
});

type LoanRequestForm = z.infer<typeof loanRequestSchema>;

const purposeIcons = {
    business: Briefcase,
    education: GraduationCap,
    medical: Heart,
    home: Home,
    debt: CreditCard,
    other: FileText,
};

const purposeLabels = {
    business: 'Business',
    education: 'Education',
    medical: 'Medical',
    home: 'Home Improvement',
    debt: 'Debt Consolidation',
    other: 'Other',
};

const LoanRequestPage = () => {
    const [, setSelectedPurpose] = useState<string>('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const requestLoan = useRequestLoan();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoanRequestForm>({
        resolver: zodResolver(loanRequestSchema),
        defaultValues: {
            principal: undefined,
            purpose: undefined,
            notes: '',
        },
    });

    const watchPrincipal = watch('principal');
    const watchPurpose = watch('purpose');

    const onSubmit = async (data: LoanRequestForm) => {
        try {
            await requestLoan.mutateAsync(data);
            navigate('/loans');
        } catch (error) {
            // Error handled in hook
        }
    };

    // Calculate estimated interest (for display)
    const calculateEstimatedInterest = (principal: number) => {
        const monthlyRate = 0.03; // 3%
        const estimatedInterest = principal * monthlyRate * 12; // Assuming 12 months
        return estimatedInterest;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/loans')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HandCoins className="w-6 h-6 text-primary-600" />
                        Request a Loan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill out the form below to request a loan. All loans have a 3% monthly interest rate.
                    </p>
                </div>
            </div>

            {/* Member Info Card */}
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-sm text-primary-700 font-medium">Requesting as</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-amber-800">Loan Terms</p>
                    <p className="text-xs text-amber-700 mt-1">
                        • 3% monthly interest rate<br />
                        • Flexible repayment - pay anytime<br />
                        • Requires approval from at least 50% of members<br />
                        • Funds disbursed after approver and super admin approval
                    </p>
                </div>
            </div>

            {/* Loan Request Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">

                {/* Loan Amount */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Loan Amount (ETB) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ETB</span>
                        <input
                            type="number"
                            {...register('principal', { valueAsNumber: true })}
                            className={cn(
                                "w-full pl-16 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                errors.principal
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-200 focus:ring-primary-200'
                            )}
                            placeholder="10000"
                            min="100"
                            max="100000"
                        />
                    </div>
                    {errors.principal && (
                        <p className="text-sm text-red-600">{errors.principal.message}</p>
                    )}

                    {/* Live calculation preview */}
                    {watchPrincipal > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500">Estimated interest (12 months):</p>
                            <p className="text-sm font-semibold text-amber-600">
                                ETB {calculateEstimatedInterest(watchPrincipal).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Total payable: ETB {(watchPrincipal + calculateEstimatedInterest(watchPrincipal)).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Loan Purpose */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Loan Purpose <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(Object.keys(purposeLabels) as Array<keyof typeof purposeLabels>).map((key) => {
                            const Icon = purposeIcons[key];
                            const isSelected = watchPurpose === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setValue('purpose', key);
                                        setSelectedPurpose(key);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 border rounded-xl transition-all",
                                        isSelected
                                            ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isSelected ? 'text-primary-600' : 'text-gray-500'
                                    )} />
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isSelected ? 'text-primary-700' : 'text-gray-600'
                                    )}>
                                        {purposeLabels[key]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {errors.purpose && (
                        <p className="text-sm text-red-600">{errors.purpose.message}</p>
                    )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        {...register('notes')}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                        placeholder="Tell us more about why you need this loan..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/loans')}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    {/* Submit Button - PROMINENT */}
                    <button
                        type="submit"
                        disabled={requestLoan.isPending}
                        className="w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-amber-900 font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary-600/40 border-2 border-primary-400"
                    >
                        {requestLoan.isPending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Loan Request'
                        )}
                    </button>
                </div>
            </form>

            {/* Warning for large amounts */}
            {watchPrincipal > 50000 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Large Loan Amount</p>
                        <p className="text-xs text-red-700 mt-1">
                            You're requesting a large loan. Please ensure you have a clear repayment plan.
                            This will require significant member approval.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanRequestPage;