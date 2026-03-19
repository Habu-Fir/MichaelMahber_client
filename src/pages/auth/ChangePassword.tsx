import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { changePassword, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data: ChangePasswordForm) => {
        try {
            await changePassword(data.currentPassword, data.newPassword);
            navigate('/dashboard');
        } catch (error) {
            // Error handled in context
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-2xl mb-4 shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            First Login
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Please change your password to continue
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            For security reasons, you must change your temporary password before accessing the system.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 ml-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('currentPassword')}
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="Enter current password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-4 sm:py-3 text-base rounded-xl border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                        errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-sm text-red-600 ml-1">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 ml-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('newPassword')}
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-4 sm:py-3 text-base rounded-xl border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-red-600 ml-1">{errors.newPassword.message}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-1">
                                Password must be at least 6 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 ml-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-4 sm:py-3 text-base rounded-xl border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600 ml-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full font-semibold rounded-xl",
                                "py-4 sm:py-3 text-base sm:text-lg",
                                "transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "shadow-lg shadow-amber-500/30",
                                "bg-gradient-to-r from-amber-500 to-yellow-600",
                                "hover:from-amber-600 hover:to-yellow-700",
                                "text-white"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Changing password...</span>
                                </div>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;