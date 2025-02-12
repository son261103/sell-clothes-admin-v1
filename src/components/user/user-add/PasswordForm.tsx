import React from 'react';
import {KeyRound, ArrowRight, User, ArrowLeft} from 'lucide-react';

interface ValidationErrors {
    [key: string]: string;
}

interface PasswordFormProps {
    password: string;
    confirmPassword: string;
    username: string;
    avatarPreview: string | null;
    validationErrors: ValidationErrors;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
                                                              password,
                                                              confirmPassword,
                                                              username,
                                                              avatarPreview,
                                                              validationErrors,
                                                              isLoading,
                                                              onInputChange,
                                                              onBack,
                                                              onSubmit
                                                          }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Display */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 text-primary"/>
                        )}
                    </div>
                </div>
                {/* Username Display */}
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {username}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={onInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                        {validationErrors.password && (
                            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Yêu cầu mật khẩu:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-400'}`}/>
                                Ít nhất 6 ký tự
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    /[a-z]/.test(password) && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-400'
                                }`}/>
                                Bao gồm chữ hoa và chữ thường
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    /\d/.test(password) ? 'bg-green-500' : 'bg-gray-400'
                                }`}/>
                                Bao gồm ít nhất 1 số
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    password && password === confirmPassword ? 'bg-green-500' : 'bg-gray-400'
                                }`}/>
                                Mật khẩu xác nhận phải trùng khớp
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="group p-2 rounded-xl transition-all duration-200 ease-in-out hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft className="text-primary w-6 h-6 transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-md
                        hover:bg-primary/90 focus:outline-none focus:ring-2
                        focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Tạo người dùng mới'}
                        {!isLoading && <ArrowRight className="w-4 h-4"/>}
                    </button>
                </div>
            </div>
        </form>
    );
};