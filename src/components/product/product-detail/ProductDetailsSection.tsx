import React from 'react';
import {
    Package2,
    Building2,
    DollarSign,
    Tag,
    Calendar,
    Clock
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

import { formatPrice, formatDate } from '@/utils/format';
import {ProductResponse} from "@/types";

interface ProductDetailsSectionProps {
    product: ProductResponse;
}

export const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({ product }) => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <StatusBadge status={product.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Package2 className="w-4 h-4" />
                        <span className="text-sm">Danh mục:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">Thương hiệu:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product.brand.name}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Giá bán:</span>
                        <span className="text-sm font-medium text-primary">{formatPrice(product.price)}</span>
                    </div>
                    {product.salePrice && (
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Giá khuyến mãi:</span>
                            <span className="text-sm font-medium text-red-500">{formatPrice(product.salePrice)}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mô tả</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.description || 'Không có mô tả'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Ngày tạo:</span>
                        <span className="text-sm">{formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Cập nhật:</span>
                        <span className="text-sm">{formatDate(product.updatedAt)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Thông tin bổ sung</h4>
                <div className="grid gap-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-sm">Đường dẫn (slug):</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-sm">Mã sản phẩm:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">#{product.productId}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Trạng thái danh mục & thương hiệu</h4>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái danh mục:</span>
                        <StatusBadge status={product.category.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái thương hiệu:</span>
                        <StatusBadge status={product.brand.status} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);