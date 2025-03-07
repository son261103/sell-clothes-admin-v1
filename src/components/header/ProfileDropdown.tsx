import {Link, useNavigate} from 'react-router-dom';
import {User, LogOut, Settings, Shield} from 'lucide-react';
import {useAuth} from '../../hooks/authHooks'; // Update the path as needed

const ProfileDropdown = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const success = await logout();
            if (success) {
                navigate('/auth/login'); // Redirect to login page after successful logout
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="relative group">
            <button
                type="button"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Profile menu"
            >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">

                    <User className="w-5 h-5 text-white"/>

                </div>
                <span className="hidden md:block text-sm font-medium text-primary dark:text-primary">
                    {user?.username || 'Admin'}
                </span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-secondary rounded-lg shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-textDark dark:text-textLight">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-primary dark:text-primary truncate">{user?.email || 'admin@example.com'}</p>
                </div>

                <div className="p-2 space-y-1">
                    <Link
                        to="/admin/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <User className="w-4 h-4"/>
                        <span>Hồ sơ</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <Settings className="w-4 h-4"/>
                        <span>Cài đặt</span>
                    </Link>

                    <Link
                        to="/admin/permissions"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-textDark dark:text-textLight
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <Shield className="w-4 h-4"/>
                        <span>Phân quyền</span>
                    </Link>

                    <hr className="my-2 border-gray-200 dark:border-gray-700"/>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                        <LogOut className="w-4 h-4"/>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;