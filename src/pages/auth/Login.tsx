import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data.email, data.password);
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
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4 shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Mahber Hub
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Community Micro-finance Management
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter your email"
                                    className={cn(
                                        "w-full pl-12 pr-4 py-4 sm:py-3 text-base rounded-xl border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                        errors.email
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 bg-gray-50'
                                    )}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600 ml-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-4 sm:py-3 text-base rounded-xl border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 bg-gray-50'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600 ml-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full bg-primary-600 text-white font-semibold rounded-xl",
                                "py-4 sm:py-3 text-base sm:text-lg",
                                "transition-all transform active:scale-[0.98]",
                                "hover:bg-primary-700",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "shadow-lg shadow-primary-600/30"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-8">
                        <details className="group">
                            <summary className="text-sm text-gray-500 list-none flex items-center justify-center gap-1 cursor-pointer py-2">
                                <span>Demo credentials</span>
                                <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 text-sm animate-slide-in">
                                <p className="font-medium text-gray-700">Use these for testing:</p>
                                <div className="space-y-1 text-gray-600">
                                    <p><span className="font-medium">Super Admin:</span> super@mahber.com</p>
                                    <p><span className="font-medium">Approver:</span> approver@mahber.com</p>
                                    <p><span className="font-medium">Member:</span> member@mahber.com</p>
                                    <p className="text-xs text-gray-400 mt-2">Password: SuperAdmin123! (or as created)</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
                    © 2026 Mahber Hub. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;