import React from 'react';
import { User, Mail, Phone, Upload, Trash2, ArrowRight } from 'lucide-react';

interface ValidationError {
    [key: string]: string;
}

interface UserAddFormData {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
    profileCompleted: boolean;
}

interface ProfileFormProps {
    formData: UserAddFormData;
    validationErrors: ValidationError;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: (username: string, avatarPreview: string | null) => void;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteAvatar?: () => void;
    avatarPreview: string | null;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
                                                            formData,
                                                            validationErrors,
                                                            isLoading,
                                                            onInputChange,
                                                            onNext,
                                                            onAvatarChange,
                                                            onDeleteAvatar,
                                                            avatarPreview
                                                        }) => {
    const handleNext = () => {
        onNext(formData.username, avatarPreview);
    };

    return (
        <div className="space-y-6">
            {/* Avatar Upload Section */}
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
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <label className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onAvatarChange}
                                className="hidden"
                            />
                            <Upload className="w-4 h-4 text-primary"/>
                        </label>
                        {avatarPreview && onDeleteAvatar && (
                            <button
                                type="button"
                                onClick={onDeleteAvatar}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-red-500"/>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col md:grid-cols-2 gap-8">
                {/* Username Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={onInputChange}
                            className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                validationErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>
                    {validationErrors.username && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onInputChange}
                            className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                            placeholder="Nhập email"
                        />
                    </div>
                    {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                    )}
                </div>

                {/* Full Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={onInputChange}
                            className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                validationErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                            placeholder="Nhập họ và tên"
                        />
                    </div>
                    {validationErrors.fullName && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.fullName}</p>
                    )}
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Số điện thoại
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={onInputChange}
                            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm"
                            placeholder="Nhập số điện thoại (không bắt buộc)"
                        />
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
};