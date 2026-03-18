import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

// ✅ Logo (make sure it's transparent PNG)
import logo from '/MichaelMahber.png';

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
            // handled in context
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">

                    {/* 🔥 LOGO (NO BOX, CLEAN DISPLAY) */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center mb-6">
                            <img
                                src={logo}
                                alt="Michael Mahber Logo"
                                className="h-20 sm:h-24 w-auto object-contain drop-shadow-xl"
                            />
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Michael Hub
                        </h1>

                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Community Micro-finance Management
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* EMAIL */}
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
                                        "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
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

                        {/* PASSWORD */}
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
                                        "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
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
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600 ml-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* 🔥 GOLD BUTTON */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full font-semibold rounded-xl",
                                "py-4 sm:py-3 text-base sm:text-lg",
                                "transition-all transform active:scale-[0.98]",

                                // Gold gradient
                                "bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600",

                                // Text
                                "text-gray-900",

                                // Shadow
                                "shadow-lg shadow-yellow-500/30",

                                // Hover
                                "hover:from-yellow-500 hover:to-yellow-700",

                                // Disabled
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* FOOTER */}
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
                    © 2026 Michael Mahber Hub. Under the protection of St. Michael.
                </p>
            </div>
        </div>
    );
};

export default Login;