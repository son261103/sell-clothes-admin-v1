import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUserAvailability, useUserError } from '../../hooks/userHooks';
import { useAvatar } from '../../hooks/avatarHooks';
import type { UserCreateRequest } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/user/user-add/PageHeader';
import { UserAddTabs } from '../../components/user/user-add/UserAddTabs';
import { ProfileForm } from '../../components/user/user-add/ProfileForm';
import { PasswordForm } from '../../components/user/user-add/PasswordForm';

interface ValidationError {
    [key: string]: string;
}

interface UserAddFormData {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    profileCompleted: boolean;
}

const UserAddPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [isMobileView, setIsMobileView] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError>({});
    const [formData, setFormData] = useState<UserAddFormData>({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        profileCompleted: false
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { createUser, isLoading: isUserLoading } = useUsers();
    const { uploadAvatar, isLoading: isAvatarLoading } = useAvatar();
    const { error: serverError, clearError } = useUserError();
    const {
        checkUsername,
        checkEmail,
        resetCheckStatus,
    } = useUserAvailability();

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    useEffect(() => {
        if (serverError) {
            toast.error(serverError);
            clearError();
        }
    }, [serverError, clearError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setValidationErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateTabFields = (tab: 'profile' | 'password'): boolean => {
        const newErrors: ValidationError = {};

        if (tab === 'profile') {
            if (!formData.username?.trim()) newErrors.username = 'Tên đăng nhập là bắt buộc';
            if (!formData.email?.trim()) {
                newErrors.email = 'Email là bắt buộc';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Email không hợp lệ';
            }
            if (!formData.fullName?.trim()) {
                newErrors.fullName = 'Họ tên là bắt buộc';
            } else if (formData.fullName.length < 2) {
                newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
            }
        }

        if (tab === 'password') {
            if (!formData.password) {
                newErrors.password = 'Mật khẩu là bắt buộc';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (validateTabFields('profile')) {
            const toastId = toast.loading('Đang kiểm tra thông tin...');

            try {
                const [usernameAvailable, emailAvailable] = await Promise.all([
                    checkUsername(formData.username),
                    checkEmail(formData.email)
                ]);

                let hasError = false;

                if (!usernameAvailable) {
                    setValidationErrors(prev => ({
                        ...prev,
                        username: 'Tên đăng nhập đã tồn tại'
                    }));
                    hasError = true;
                }

                if (!emailAvailable) {
                    setValidationErrors(prev => ({
                        ...prev,
                        email: 'Email đã tồn tại'
                    }));
                    hasError = true;
                }

                if (hasError) {
                    toast.error('Vui lòng kiểm tra lại thông tin', { id: toastId });
                    return;
                }

                // Nếu không có lỗi, tiếp tục xử lý
                toast.success('Kiểm tra thông tin thành công', { id: toastId });
                setFormData(prev => ({ ...prev, profileCompleted: true }));
                setActiveTab('password');

            } catch (error) {
                console.error('Error checking profile:', error);
                toast.error('Có lỗi xảy ra khi kiểm tra thông tin', { id: toastId });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateTabFields('password')) return;

        try {
            setIsSubmitting(true);
            const toastId = toast.loading('Đang tạo người dùng mới...');

            // Check availability again before final submission
            const [usernameCheck, emailCheck] = await Promise.all([
                checkUsername(formData.username),
                checkEmail(formData.email)
            ]);

            if (!usernameCheck || !emailCheck) {
                toast.error('Tên đăng nhập hoặc email đã tồn tại', { id: toastId });
                setActiveTab('profile');
                return;
            }

            const createUserData: UserCreateRequest = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone
            };

            const createdUser = await createUser(createUserData);

            if (!createdUser) {
                toast.error('Không thể tạo người dùng', { id: toastId });
                return;
            }

            if (avatarFile && createdUser.userId) {
                try {
                    const avatarUploadSuccess = await uploadAvatar(createdUser.userId, avatarFile);
                    if (!avatarUploadSuccess) {
                        toast.error('Tạo người dùng thành công nhưng không thể tải lên ảnh đại diện', { id: toastId });
                        navigate('/admin/users/list');
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading avatar:', error);
                    toast.error('Tạo người dùng thành công nhưng không thể tải lên ảnh đại diện', { id: toastId });
                    navigate('/admin/users/list');
                    return;
                }
            }

            toast.success('Tạo người dùng thành công', { id: toastId });
            navigate('/admin/users/list');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage);
            console.error('Lỗi khi tạo người dùng:', error);
        } finally {
            setIsSubmitting(false);
            resetCheckStatus();
        }
    };

    const handleCancel = useCallback(() => {
        const confirmLeave = window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.');
        if (confirmLeave) {
            clearError();
            navigate('/admin/users/list');
        }
    }, [navigate, clearError]);

    const isLoading = isUserLoading || isSubmitting || isAvatarLoading;

    return (
        <div className="space-y-4">
            <PageHeader onCancel={handleCancel} />

            <div className="relative">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                    <UserAddTabs
                        activeTab={activeTab}
                        isProfileCompleted={formData.profileCompleted}
                        isMobileView={isMobileView}
                    />

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' ? (
                                    <ProfileForm
                                        formData={formData}
                                        validationErrors={validationErrors}
                                        isLoading={isLoading}
                                        onInputChange={handleInputChange}
                                        onNext={handleNext}
                                        onAvatarChange={handleAvatarChange}
                                        avatarPreview={avatarPreview}
                                    />
                                ) : (
                                    <PasswordForm
                                        password={formData.password}
                                        confirmPassword={formData.confirmPassword}
                                        username={formData.username}
                                        avatarPreview={avatarPreview}
                                        validationErrors={validationErrors}
                                        isLoading={isLoading}
                                        onInputChange={handleInputChange}
                                        onBack={() => setActiveTab('profile')}
                                        onSubmit={handleSubmit}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAddPage;