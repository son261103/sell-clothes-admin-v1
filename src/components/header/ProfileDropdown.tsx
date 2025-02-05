import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/authHooks';
import { toast } from 'react-hot-toast';

interface ProfileDropdownProps {
    username?: string;
    avatar?: string;
    email?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
                                                             username = 'Admin',
                                                             avatar,
                                                             email = 'admin@example.com'
                                                         }) => {
    const navigate = useNavigate();
    const { logout, isLoading } = useAuth();

    const handleLogout = useCallback(async (): Promise<void> => {
        const loadingToast = toast.loading('Đang đăng xuất...');

        try {
            // Call the logout function from auth hook
            const success = await logout();

            // Navigate to login regardless of success/failure
            navigate('/auth/login');

            if (success) {
                toast.success('Đăng xuất thành công!');
            } else {
                toast.error('Đăng xuất thất bại!');
            }
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/auth/login');
            toast.error('Đăng xuất thất bại!');
        } finally {
            toast.dismiss(loadingToast);
        }
    }, [logout, navigate]);

    return (
        <div className="relative group">
            <button
                type="button"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading}
            >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-5 h-5 text-white" />
                    )}
                </div>
                <span className="hidden md:block text-sm text-primary dark:text-primary">
                    {username}
                </span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-secondary rounded-lg shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-textDark dark:text-textLight">
                        {username}
                    </p>
                    <p className="text-xs text-primary dark:text-primary">
                        {email}
                    </p>
                </div>

                <div className="p-2">
                    <Link
                        to="/admin/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <User className="w-4 h-4" />
                        <span>Hồ sơ</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                    </Link>

                    <Link
                        to="/admin/permissions"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Phân quyền</span>
                    </Link>

                    <hr className="my-2 border-gray-200 dark:border-gray-700" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50
                            disabled:cursor-not-allowed"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;