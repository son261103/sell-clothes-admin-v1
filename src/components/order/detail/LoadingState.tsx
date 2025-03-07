// src/components/order/detail/LoadingState.tsx
import React from 'react';

interface LoadingStateProps {
    message?: string;
    minHeight?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
                                                       message = 'Đang tải dữ liệu...',
                                                       minHeight = 'min-h-[400px]'
                                                   }) => {
    return (
        <div className={`bg-white dark:bg-secondary rounded-xl shadow-sm p-6 flex justify-center items-center ${minHeight}`}>
            <div>
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
};

export default LoadingState;