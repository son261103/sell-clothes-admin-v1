import React from 'react';
import { ProductResponse } from '@/types';
import { ExternalLink } from 'lucide-react';

interface TopSellingProductsTableProps {
    products: ProductResponse[];
    isLoading: boolean;
}

const TableSkeleton = () => (
    <div className="space-y-2">
        {Array(5).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
        ))}
    </div>
);

const TopSellingProductsTable: React.FC<TopSellingProductsTableProps> = ({ products, isLoading }) => {
    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (isLoading) {
        return <TableSkeleton />;
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-6 text-secondary dark:text-highlight">
                Không có dữ liệu sản phẩm
            </div>
        );
    }

    return (
        <div className="overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sản phẩm
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Danh mục
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Giá bán
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Đã bán
                    </th>
                    <th scope="col" className="relative px-3 py-2 w-10">
                        <span className="sr-only">Xem chi tiết</span>
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {products.map((product, index) => {
                    // Generate fake sales data based on product ID and index
                    const salesCount = ((product.productId * 7) % 50) + index * 5 + 10;

                    return (
                        <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 flex-shrink-0">
                                        {product.thumbnail ? (
                                            <img
                                                className="h-8 w-8 rounded-md object-cover"
                                                src={product.thumbnail}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                                                {product.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-textDark dark:text-textLight truncate max-w-xs">
                                            {product.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.category?.name || 'Không có danh mục'}
                                </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-textDark dark:text-textLight">
                                    {formatCurrency(product.salePrice || product.price)}
                                </div>
                                {product.salePrice && (
                                    <div className="text-xs line-through text-gray-500 dark:text-gray-400">
                                        {formatCurrency(product.price)}
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {salesCount}
                  </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                                <button
                                    className="text-primary hover:text-primary/80 transition-colors"
                                    aria-label="Xem chi tiết"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default TopSellingProductsTable;