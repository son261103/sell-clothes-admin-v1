import React from 'react';
import { Edit, XCircle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import type { ProductResponse } from '@/types';

interface ProductActionButtonsProps {
    product: ProductResponse;
    onEdit: (product: ProductResponse) => void;
    onDelete: (product: ProductResponse) => void;
    onStatusChange: (id: number) => void;
    onRefreshImage?: () => void;
}

const ActionButton = ({onClick, icon: Icon, color, title}: {
    onClick: () => void;
    icon: typeof Edit;
    color: string;
    title: string;
}) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 ${color} 
            transition-colors duration-200 hover:scale-105 transform`}
        title={title}
    >
        <Icon className="w-3.5 h-3.5"/>
    </button>
);

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
                                                                       product,
                                                                       onEdit,
                                                                       onDelete,
                                                                       onStatusChange,
                                                                       onRefreshImage
                                                                   }) => {
    return (
        <div className="flex items-center gap-1.5">
            <ActionButton
                onClick={() => onEdit(product)}
                icon={Edit}
                color="text-blue-600 dark:text-blue-400"
                title="Chỉnh sửa"
            />
            <ActionButton
                onClick={() => onStatusChange(product.productId)}
                icon={product.status ? XCircle : CheckCircle}
                color={product.status
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'}
                title={product.status ? 'Vô hiệu hóa' : 'Kích hoạt'}
            />
            <ActionButton
                onClick={() => onDelete(product)}
                icon={Trash2}
                color="text-red-600 dark:text-red-400"
                title="Xóa"
            />
            {product.thumbnail && onRefreshImage && (
                <ActionButton
                    onClick={onRefreshImage}
                    icon={RefreshCw}
                    color="text-gray-600 dark:text-gray-400"
                    title="Làm mới ảnh"
                />
            )}
        </div>
    );
};

export default ProductActionButtons;