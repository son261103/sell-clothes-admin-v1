import React, {useState} from 'react';
import {User, Mail, Phone, Upload, Trash2, Lock} from 'lucide-react';
import type {UserData} from '../../../types';
import {useAvatar} from '../../../hooks/avatarHooks';
import {validateForm, ValidationErrors} from '../../../utils/auth/registerUtils';
import {toast} from "react-hot-toast";

interface UserFormProps {
    initialData?: Partial<UserData>;
    onSubmit: (data: UserData, avatarFile?: File) => Promise<void>;
    isLoading: boolean;
    validationErrors?: ValidationErrors;
    onDeleteAvatar?: (userId: number) => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({
                                               initialData = {},
                                               onSubmit,
                                               isLoading,
                                               validationErrors = {},
                                               onDeleteAvatar
                                           }) => {
    const isEditMode = Boolean(initialData.userId);

    const {
        // uploadAvatar,
        // updateAvatar,
        deleteAvatar,
        isLoading: isAvatarLoading
    } = useAvatar();

    const [formData, setFormData] = useState<UserData>({
        username: initialData.username || '',
        email: initialData.email || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        avatar: initialData.avatar,
        password: '',
        userId: initialData.userId,
        status: initialData.status || 'ACTIVE'
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatar || null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const validateFormData = (): boolean => {
        if (isEditMode) {
            // Validate only required fields in edit mode
            const editErrors: ValidationErrors = {};
            if (!formData.email?.trim()) {
                editErrors.email = 'Email không được để trống';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                editErrors.email = 'Email không hợp lệ';
            }
            if (!formData.fullName?.trim()) {
                editErrors.fullName = 'Họ tên không được để trống';
            } else if (formData.fullName.length < 2) {
                editErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
            }
            setErrors(editErrors);
            return Object.keys(editErrors).length === 0;
        } else {
            // Use full validation from registerUtils in create mode
            const validationResult = validateForm({
                username: formData.username || '',
                email: formData.email || '',
                password: formData.password || '',
                confirmPassword: formData.password || '',
                fullName: formData.fullName || '',
            });
            setErrors(validationResult);
            return Object.keys(validationResult).length === 0;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = async () => {
        if (initialData.userId && initialData.avatar) {
            const toastId = toast.loading('Đang xóa ảnh đại diện...');
            try {
                if (onDeleteAvatar) {
                    await onDeleteAvatar(initialData.userId);
                } else {
                    await deleteAvatar(initialData.userId);
                }
                setAvatarFile(null);
                setAvatarPreview(null);
                setFormData(prev => ({
                    ...prev,
                    avatar: undefined
                }));
                toast.success('Xóa ảnh đại diện thành công', {id: toastId});
            } catch (error) {
                console.error('Error deleting avatar:', error);
                toast.error('Không thể xóa ảnh đại diện', {id: toastId});
            }
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
            setFormData(prev => ({
                ...prev,
                avatar: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateFormData()) {
            setShowConfirmation(true);
        }
    };

    const confirmSubmit = async () => {
        try {
            // Chỉ chuyển formData và avatarFile cho parent component xử lý
            await onSubmit(formData, avatarFile || undefined);
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setShowConfirmation(false);
        }
    };

    // Combine local errors with prop validation errors
    const displayErrors = {...errors, ...validationErrors};

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div
                            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
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
                            <label
                                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <Upload className="w-4 h-4 text-primary"/>
                            </label>
                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={removeAvatar}
                                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    displayErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm ${
                                    isEditMode ? 'cursor-not-allowed opacity-60' : ''
                                }`}
                                placeholder="Nhập tên đăng nhập"
                                disabled={isEditMode}
                            />
                        </div>
                        {displayErrors.username && (
                            <p className="mt-1 text-sm text-red-500">{displayErrors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    displayErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập email"
                            />
                        </div>
                        {displayErrors.email && (
                            <p className="mt-1 text-sm text-red-500">{displayErrors.email}</p>
                        )}
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Họ và tên
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    displayErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        {displayErrors.fullName && (
                            <p className="mt-1 text-sm text-red-500">{displayErrors.fullName}</p>
                        )}
                    </div>

                    {/* Phone */}
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
                                onChange={handleInputChange}
                                className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm"
                                placeholder="Nhập số điện thoại (không bắt buộc)"
                            />
                        </div>
                    </div>

                    {/* Password - Only show in create mode */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                        displayErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                    placeholder="Nhập mật khẩu"
                                    autoComplete="new-password"
                                />
                            </div>
                            {displayErrors.password && (
                                <p className="mt-1 text-sm text-red-500">{displayErrors.password}</p>
                            )}
                        </div>
                    )}

                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={isLoading || isAvatarLoading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading || isAvatarLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-white dark:bg-secondary bg-opacity-70 dark:bg-opacity-70 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Xác nhận thông tin
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn có chắc chắn muốn {isEditMode ? "cập nhật" : "tạo"} người dùng này?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={confirmSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserForm;