import React from 'react';
import { Package2 } from 'lucide-react';

interface ProductEmptyStateProps {
    onRefresh: () => void;
}

const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({ onRefresh }) => {
    return (
        <div className="p-8 text-center">
            <Package2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"/>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Không tìm thấy sản phẩm nào
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Thử thay đổi bộ lọc hoặc tạo sản phẩm mới
            </p>
            <button
                onClick={onRefresh}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
                Làm mới
            </button>
        </div>
    );
};

export default ProductEmptyState;