import React from 'react';

interface OrderLoadingProps {
    type?: 'full' | 'overlay';
}

const OrderLoading: React.FC<OrderLoadingProps> = ({ type = 'full' }) => {
    if (type === 'overlay') {
        return (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-secondary rounded-xl">
            <div className="animate-pulse space-y-4">
                {/* Header placeholder */}
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>

                {/* Table header placeholder */}
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>

                {/* Table rows placeholders */}
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded"></div>
                ))}

                {/* Pagination placeholder */}
                <div className="flex justify-between items-center mt-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

export default OrderLoading;