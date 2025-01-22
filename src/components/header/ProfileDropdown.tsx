import { Link } from 'react-router-dom';
import { User, LogOut, Settings, Shield } from 'lucide-react';

interface ProfileDropdownProps {
    username?: string;
    avatar?: string;
    onLogout?: () => void;
}

const ProfileDropdown = ({
                             username = 'Admin',
                             avatar,
                             onLogout = () => {},
                         }: ProfileDropdownProps) => {
    return (
        <div className="relative group  ">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {avatar ? (
                        <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-white" />
                    )}
                </div>
                <span className="hidden md:block text-sm text-primary dark:text-primary">
          {username}
        </span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-secondary rounded-lg shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-textDark dark:text-textLight">{username}</p>
                    <p className="text-xs text-primary dark:text-primary">admin@example.com</p>
                </div>

                {/* Menu Items */}
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
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500
                     hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;