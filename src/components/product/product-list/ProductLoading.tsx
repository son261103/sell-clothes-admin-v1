import React from 'react';

interface ProductLoadingProps {
    type?: 'overlay' | 'fullpage';
}

const ProductLoading: React.FC<ProductLoadingProps> = ({ type = 'fullpage' }) => {
    if (type === 'overlay') {
        return (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50
                backdrop-blur-sm flex items-center justify-center z-30">
                <div className="flex items-center gap-3 p-4 rounded-lg
                    bg-white dark:bg-gray-800 shadow-lg">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent
                        rounded-full animate-spin"/>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Đang tải...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
    );
};

export default ProductLoading;