import React from 'react';
import { TagIcon, RefreshCw } from 'lucide-react';

interface CouponEmptyStateProps {
    onRefresh: () => void;
}

const CouponEmptyState: React.FC<CouponEmptyStateProps> = ({ onRefresh }) => {
    return (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <TagIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Không có mã giảm giá</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                Chưa có mã giảm giá nào được tạo hoặc không tìm thấy mã giảm giá phù hợp với các điều kiện lọc.
            </p>
            <button
                onClick={onRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
                <RefreshCw className="h-4 w-4" />
                <span>Tải lại</span>
            </button>
        </div>
    );
};

export default CouponEmptyState;