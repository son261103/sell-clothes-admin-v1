import React from 'react';

interface CouponLoadingProps {
    type?: 'full' | 'overlay';
}

const CouponLoading: React.FC<CouponLoadingProps> = ({ type = 'full' }) => {
    if (type === 'overlay') {
        return (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300">Đang tải danh sách mã giảm giá...</p>
            <div className="w-full max-w-2xl space-y-3">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 h-12 rounded-md animate-pulse"></div>
                ))}
            </div>
        </div>
    );
};

export default CouponLoading;