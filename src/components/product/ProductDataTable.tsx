import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ProductPageResponse, ProductResponse } from '@/types';
import Pagination from '../common/Pagination';
import { formatPrice } from '@/utils/format';

// Components
import ProductImage from '../product/product-list/ProductImage.tsx';
import ProductActionButtons from '../product/product-list/ProductActionButtons';
import ProductMobileView from '../product/product-list/ProductMobileView';
import ProductLoading from '../product/product-list/ProductLoading';
import ProductEmptyState from '../product/product-list/ProductEmptyState';

interface ProductDataTableProps {
    products: ProductPageResponse;
    onDeleteProduct: (id: number) => void;
    onEditProduct: (product: ProductResponse) => void;
    onStatusChange: (id: number) => void;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    forceRefresh?: number;
}

const ProductDataTable: React.FC<ProductDataTableProps> = ({
                                                               products,
                                                               onDeleteProduct,
                                                               onEditProduct,
                                                               onStatusChange,
                                                               isLoading,
                                                               onRefresh,
                                                               isMobileView,
                                                               onPageChange,
                                                               onPageSizeChange,
                                                               forceRefresh = 0
                                                           }) => {
    const [localRefreshCounter, setLocalRefreshCounter] = useState(0);

    useEffect(() => {
        setLocalRefreshCounter(prev => prev + 1);
    }, [products, forceRefresh]);

    const handleDeleteClick = (product: ProductResponse) => {
        // Simply pass the ID to the parent component's handler
        onDeleteProduct(product.productId);
    };

    const refreshImage = () => {
        setLocalRefreshCounter(prev => prev + 1);
    };

    const getStatusBadgeClass = (status: boolean) => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";
        return status
            ? `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`
            : `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
    };

    if (isLoading) {
        return <ProductLoading />;
    }

    if (!products.content.length) {
        return <ProductEmptyState onRefresh={onRefresh} />;
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.content.map((product) => (
                        <ProductMobileView
                            key={`${product.productId}-${localRefreshCounter}`}
                            product={product}
                            onEdit={onEditProduct}
                            onDelete={handleDeleteClick}
                            onStatusChange={onStatusChange}
                            refreshKey={localRefreshCounter}
                            onRefreshImage={refreshImage}
                            getStatusBadgeClass={getStatusBadgeClass}
                        />
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={products.number}
                        totalPages={products.totalPages}
                        onPageChange={onPageChange}
                        pageSize={products.size}
                        totalElements={products.totalElements}
                        onPageSizeChange={onPageSizeChange}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="w-16 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700 rounded-tl-xl">ID</th>
                        <th className="w-24 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Hình ảnh</th>
                        <th className="w-64 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Thông tin</th>
                        <th className="w-48 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Danh mục & Thương hiệu</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Giá</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Trạng thái</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center rounded-tr-xl">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.content.map((product) => (
                        <tr
                            key={`${product.productId}-${localRefreshCounter}`}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                                        transition-colors duration-200 border-b border-gray-200
                                        dark:border-gray-700"
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-textDark dark:text-textLight text-center">
                                    {product.productId}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex justify-center">
                                    <ProductImage
                                        src={product.thumbnail}
                                        alt={product.name}
                                        refreshKey={localRefreshCounter}
                                    />
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-medium text-textDark dark:text-textLight">
                                        {product.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {product.description || 'Không có mô tả'}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm text-textDark dark:text-textLight">
                                            {product.category.name}
                                        </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {product.brand.name}
                                        </span>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm font-medium text-primary">
                                            {formatPrice(product.price)}
                                        </span>
                                    {product.salePrice && (
                                        <span className="text-xs font-medium text-red-600">
                                                {formatPrice(product.salePrice)}
                                            </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-1 px-1 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex justify-center">
                                        <span className={getStatusBadgeClass(product.status)}>
                                            <div className="flex items-center gap-1">
                                                {product.status ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3"/>
                                                        <span>Hoạt động</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3"/>
                                                        <span>Vô hiệu</span>
                                                    </>
                                                )}
                                            </div>
                                        </span>
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex justify-center">
                                    <ProductActionButtons
                                        product={product}
                                        onEdit={onEditProduct}
                                        onDelete={handleDeleteClick}
                                        onStatusChange={onStatusChange}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                    currentPage={products.number}
                    totalPages={products.totalPages}
                    onPageChange={onPageChange}
                    pageSize={products.size}
                    totalElements={products.totalElements}
                    onPageSizeChange={onPageSizeChange}
                />
            </div>

            {/* Loading Overlay */}
            {isLoading && <ProductLoading type="overlay" />}
        </div>
    );
};

export default ProductDataTable;