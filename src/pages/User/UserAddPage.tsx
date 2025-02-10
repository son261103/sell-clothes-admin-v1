// UserAddPage.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUserAvailability } from '../../hooks/userHooks';
import UserForm from '../../components/user/user-list/UserForm';
import type { UserCreateRequest, UserData } from '../../types';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAddPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createUser, isLoading } = useUsers();
    const {
        checkUsername,
        checkEmail,
        resetCheckStatus
    } = useUserAvailability();

    const handleSubmit = async (formData: UserData, avatarFile?: File) => {
        setIsSubmitting(true);
        const toastId = toast.loading('Đang tạo người dùng mới...');

        try {
            // Check username and email availability
            const isUsernameAvailable = await checkUsername(formData.username);
            const isEmailAvailable = await checkEmail(formData.email);

            if (!isUsernameAvailable || !isEmailAvailable) {
                toast.error('Tên đăng nhập hoặc email đã tồn tại', { id: toastId });
                setIsSubmitting(false);
                return;
            }

            // Transform UserData to UserCreateRequest
            const createUserData: UserCreateRequest = {
                username: formData.username,
                email: formData.email,
                password: formData.password || '',
                fullName: formData.fullName,
                phone: formData.phone,
                avatar: formData.avatar,
                status: 'ACTIVE'
            };

            const success = await createUser(
                createUserData,
                avatarFile,
                (progress) => {
                    if (toastId) {
                        toast.loading(`Đang tải lên... ${progress}%`, { id: toastId });
                    }
                }
            );

            if (success) {
                toast.success('Tạo người dùng thành công', { id: toastId });
                navigate('/admin/users/list');
            } else {
                toast.error('Không thể tạo người dùng', { id: toastId });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage, { id: toastId });
            console.error('Lỗi khi tạo người dùng:', error);
        } finally {
            setIsSubmitting(false);
            resetCheckStatus();
        }
    };

    const handleCancel = useCallback(() => {
        navigate('/admin/users/list');
    }, [navigate]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
                data-aos-duration="500"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-textDark dark:text-textLight">
                            Thêm người dùng mới
                        </h1>
                        <p className="text-sm text-secondary dark:text-highlight">
                            Điền thông tin để tạo tài khoản người dùng mới
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="relative">
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="200"
                    data-aos-duration="500"
                >
                    <div className="p-6">
                        <div data-aos="fade-up" data-aos-delay="300">
                            <UserForm
                                onSubmit={handleSubmit}
                                isLoading={isLoading || isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAddPage;