import React, { useState, useEffect } from 'react';
import {
    MoreVertical, Edit, XCircle, CheckCircle,
    Trash2, RefreshCw
} from 'lucide-react';
import type { ProductResponse } from '@/types';

interface ProductMobileActionsProps {
    product: ProductResponse;
    onEdit: (product: ProductResponse) => void;
    onDelete: (product: ProductResponse) => void;
    onStatusChange: (id: number) => void;
    onRefreshImage?: () => void;
}

const ProductMobileActions: React.FC<ProductMobileActionsProps> = ({
                                                                       product,
                                                                       onEdit,
                                                                       onDelete,
                                                                       onStatusChange,
                                                                       onRefreshImage
                                                                   }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById(`dropdown-${product.productId}`);
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [product.productId]);

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-secondary dark:text-highlight"/>
            </button>

            {isOpen && (
                <div
                    id={`dropdown-${product.productId}`}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product);
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Edit className="w-4 h-4"/>
                        Chỉnh sửa
                    </button>

                    <button
                        onClick={() => {
                            onStatusChange(product.productId);
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        {product.status ? (
                            <>
                                <XCircle className="w-4 h-4"/>
                                Vô hiệu hóa
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4"/>
                                Kích hoạt
                            </>
                        )}
                    </button>

                    {product.thumbnail && onRefreshImage && (
                        <button
                            onClick={() => {
                                onRefreshImage();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                        >
                            <RefreshCw className="w-4 h-4"/>
                            Làm mới ảnh
                        </button>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>

                    <button
                        onClick={() => {
                            onDelete(product);
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-red-600"
                    >
                        <Trash2 className="w-4 h-4"/>
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductMobileActions;