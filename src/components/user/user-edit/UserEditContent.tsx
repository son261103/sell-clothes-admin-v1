import type {UserResponse, UserUpdateRequest, UserData} from '../../../types';
import type {UserEditTabType} from './UserEditTabs';
import UserForm from "../user-list/UserForm";
import {useAvatar} from '@/hooks/avatarHooks.tsx';
import toast from 'react-hot-toast';
import UserRole from "./UserRole.tsx";

interface UserEditContentProps {
    activeTab: UserEditTabType;
    user: UserResponse | null;
    onSubmit: (data: UserUpdateRequest) => Promise<void>;
    isLoading: boolean;
}

const UserEditContent = ({activeTab, user, onSubmit, isLoading}: UserEditContentProps) => {
    const {updateAvatar, deleteAvatar, isLoading: isAvatarLoading} = useAvatar();

    const handleFormSubmit = async (formData: UserData, avatarFile?: File) => {
        try {
            if (!user) return;

            // Handle avatar update if there's a new file
            if (avatarFile) {
                const toastId = toast.loading('Đang cập nhật ảnh đại diện...');
                try {
                    const avatarSuccess = await updateAvatar(user.userId, avatarFile);
                    if (!avatarSuccess) {
                        toast.error('Không thể cập nhật ảnh đại diện', {id: toastId});
                    } else {
                        toast.success('Cập nhật ảnh đại diện thành công', {id: toastId});
                    }
                } catch (error) {
                    console.error('Error updating avatar:', error);
                    toast.error('Không thể cập nhật ảnh đại diện', {id: toastId});
                }
            }

            // Transform UserData to UserUpdateRequest
            const updateData: UserUpdateRequest = {
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone || undefined,
                status: formData.status
            };

            // Update user data
            await onSubmit(updateData);

        } catch (error) {
            console.error('Error in form submission:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
        }
    };

    const handleAvatarDelete = async (userId: number) => {
        const toastId = toast.loading('Đang xóa ảnh đại diện...');
        try {
            const success = await deleteAvatar(userId);
            if (success) {
                toast.success('Xóa ảnh đại diện thành công', {id: toastId});
            } else {
                toast.error('Không thể xóa ảnh đại diện', {id: toastId});
            }
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast.error('Không thể xóa ảnh đại diện', {id: toastId});
        }
    };

    switch (activeTab) {
        case 'profile':
            return user ? (
                <UserForm
                    initialData={user}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading || isAvatarLoading}
                    onDeleteAvatar={() => handleAvatarDelete(user.userId)}
                />
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin người dùng
                </div>
            );
        case 'permissions':
            return user ? (
                <UserRole
                    user={user}
                    onUpdateRoles={async (roles) => {
                        await onSubmit({
                            ...user,
                            roles: roles
                        });
                    }}
                    isLoading={isLoading}
                />
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin người dùng
                </div>
            );
        case 'billing':
        case 'notifications':
            return (
                <div className="text-center text-secondary dark:text-highlight py-8">
                    Tính năng đang được phát triển
                </div>
            );
        default:
            return null;
    }
};

export default UserEditContent;