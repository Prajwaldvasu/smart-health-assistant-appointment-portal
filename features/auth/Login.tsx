import React, { useState } from 'react';
import { StethoscopeIcon } from '../../shared/Icons';

interface LoginProps {
    onLogin: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate authentication (replace with real auth logic)
        setTimeout(() => {
            if (email && password) {
                onLogin(email, password);
            } else {
                setError('Please enter both email and password');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Floating medical icons */}
            <div className="absolute top-20 left-20 animate-bounce delay-300">
                <div className="w-8 h-8 bg-brand-teal-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-brand-teal-400 text-sm">💊</span>
                </div>
            </div>
            <div className="absolute top-40 right-32 animate-bounce delay-700">
                <div className="w-10 h-10 bg-brand-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-brand-green-400 text-lg">🩺</span>
                </div>
            </div>
            <div className="absolute bottom-32 left-32 animate-bounce delay-1000">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-blue-400 text-xs">❤️</span>
                </div>
            </div>
            <div className="absolute bottom-20 right-20 animate-bounce delay-500">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-purple-400 text-lg">🩹</span>
                </div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center">
                    <div className="flex justify-center animate-pulse">
                        <div className="relative">
                            <StethoscopeIcon className="h-20 w-20 text-brand-teal-500 drop-shadow-lg" />
                            <div className="absolute inset-0 h-20 w-20 bg-brand-teal-500/30 rounded-full blur-xl animate-ping"></div>
                        </div>
                    </div>
                    <h2 className="mt-6 text-4xl font-extrabold text-slate-100 animate-fade-in-up">
                        Welcome to Smart Health Assistant
                    </h2>
                    <p className="mt-2 text-sm text-slate-400 animate-fade-in-up delay-200">
                        Your AI-powered health companion
                    </p>
                    <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-brand-teal-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-brand-green-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>

                <form className="mt-8 space-y-6 animate-fade-in-up delay-300" onSubmit={handleSubmit}>
                    <div className="bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        {error && (
                            <div className="mb-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all duration-300 hover:border-brand-teal-400"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 pr-10 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all duration-300 hover:border-brand-teal-400"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-slate-400 hover:text-brand-teal-400 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-brand-teal-600 focus:ring-brand-teal-500 border-slate-600 rounded bg-slate-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-teal-600 hover:bg-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                className="text-sm text-brand-teal-400 hover:text-brand-teal-300 transition-colors"
                                onClick={() => alert('Password reset link will be sent to your email')}
                            >
                                Forgot password?
                            </button>
                            <span className="text-xs text-slate-500">
                                Demo: Any email/password
                            </span>
                        </div>
                    </div>

                    <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                        <p className="text-sm text-slate-400">
                            New to Smart Health?{' '}
                            <button
                                type="button"
                                className="text-brand-teal-400 hover:text-brand-teal-300 font-semibold transition-colors"
                                onClick={() => alert('Sign up feature coming soon! For now, use any email/password to login.')}
                            >
                                Create an account →
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
