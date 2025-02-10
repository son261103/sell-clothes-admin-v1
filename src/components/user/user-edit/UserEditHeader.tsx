import {X, RefreshCw} from 'lucide-react';

interface UserEditHeaderProps {
    onClose: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
}

const UserEditHeader = ({onClose, onRefresh, isRefreshing, isMobileView}: UserEditHeaderProps) => (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
            <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">
                    Chỉnh sửa người dùng
                </h3>
            </div>
            <p className="text-sm text-secondary dark:text-highlight mt-1">
                Cập nhật thông tin người dùng
            </p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onRefresh}
                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 
                text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 
                flex items-center gap-1.5 transition-colors duration-200
                ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isRefreshing}
            >
                <RefreshCw
                    className={`h-3.5 w-3.5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className={isMobileView ? 'hidden' : ''}>Làm mới</span>
            </button>
            <button
                className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700
                         text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors duration-200"
                onClick={onClose}
                aria-label="Đóng"
            >
                <X className="w-4 h-4"/>
            </button>
        </div>
    </div>
);

export default UserEditHeader;