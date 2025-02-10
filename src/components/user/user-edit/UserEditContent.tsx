import type {UserResponse, UserUpdateRequest} from '../../../types';
import type {UserEditTabType} from './UserEditTabs.tsx';
import UserForm from "../user-list/UserForm.tsx";

interface UserEditContentProps {
    activeTab: UserEditTabType;
    user: UserResponse | null;
    onSubmit: (data: UserUpdateRequest) => Promise<void>;
    isLoading: boolean;
}

const UserEditContent = ({activeTab, user, onSubmit, isLoading}: UserEditContentProps) => {
    switch (activeTab) {
        case 'profile':
            return user ? (
                <UserForm
                    initialData={user}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin người dùng
                </div>
            );
        case 'password':
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