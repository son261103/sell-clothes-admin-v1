import React, { useEffect, useState } from 'react';
import {
    Package2,
    Building2,
    DollarSign,
    Tag,
    Calendar,
    Clock,
    ChevronRight
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

import { formatPrice, formatDate } from '@/utils/format';
import { ProductResponse, CategoryResponse } from "@/types";
import { useCategories } from '@/hooks/categoryHooks';

interface ProductDetailsSectionProps {
    product: ProductResponse;
}

export const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({ product }) => {
    const [parentCategory, setParentCategory] = useState<CategoryResponse | null>(null);
    const { categoriesPage } = useCategories();
    const categories = categoriesPage?.content || [];

    // Xác định danh mục cha nếu category hiện tại là danh mục con
    useEffect(() => {
        if (product.category.parentId && categories.length > 0) {
            const parent = categories.find(cat => cat.categoryId === product.category.parentId);
            if (parent) {
                setParentCategory(parent);
            }
        } else {
            setParentCategory(null);
        }
    }, [product.category, categories]);

    // Xác định xem danh mục hiện tại là danh mục con hay không
    const isSubCategory = !!product.category.parentId;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        <StatusBadge status={product.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hiển thị đường dẫn danh mục */}
                        <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Package2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">Danh mục:</span>

                            {isSubCategory ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                    {parentCategory && (
                                        <span className="text-sm px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                                            {parentCategory.name}
                                        </span>
                                    )}
                                    <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-sm px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded">
                                        {product.category.name}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                                    {product.category.name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">Thương hiệu:</span>
                            <span className="text-sm px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 rounded">
                                {product.brand.name}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Giá bán:</span>
                            <span className="text-sm font-medium text-primary">{formatPrice(product.price)}</span>
                        </div>
                        {product.salePrice && (
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Giá khuyến mãi:</span>
                                <span className="text-sm font-medium text-red-500">{formatPrice(product.salePrice)}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mô tả</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.description || 'Không có mô tả'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">Ngày tạo:</span>
                            <span className="text-sm">{formatDate(product.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 flex-shrink-0" />
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
                        <div className="flex items-start md:items-center gap-2 text-gray-600 dark:text-gray-400 flex-wrap">
                            <span className="text-sm">Đường dẫn (slug):</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white overflow-x-auto max-w-full">
                                {product.slug}
                            </span>
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
                        {parentCategory && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái danh mục cha:</span>
                                <StatusBadge status={parentCategory.status} />
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Trạng thái {isSubCategory ? 'danh mục con' : 'danh mục'}:
                            </span>
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
};