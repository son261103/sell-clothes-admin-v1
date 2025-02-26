import React from 'react';
import { Package2, Archive, CheckCircle, XCircle, Box } from 'lucide-react';

interface ProductVariantHierarchyProps {
    hierarchy: {
        totalVariants: number;
        activeVariants: number;
        inactiveVariants: number;
        totalStock: number;
        stockBySize: Record<string, number>;
        stockByColor: Record<string, number>;
    } | null;
    isLoading: boolean;
    error: string | null;
}

export const ProductVariantHierarchySection: React.FC<ProductVariantHierarchyProps> = ({
                                                                                           hierarchy,
                                                                                           isLoading,
                                                                                           error
                                                                                       }) => {
    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-lg text-gray-600 dark:text-gray-400">Đang tải...</span>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm">Lỗi: {error}</span>
                </div>
            </div>
        );
    }

    // No Data State
    if (!hierarchy) {
        return (
            <div className="rounded-lg bg-gray-50 p-4 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <Package2 className="h-5 w-5" />
                    <span className="text-sm">Không có dữ liệu biến thể cho sản phẩm này</span>
                </div>
            </div>
        );
    }

    // Main Render
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary">
            {/* Header */}
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Package2 className="h-5 w-5 text-primary" /> Tổng quan biến thể sản phẩm
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Variants */}
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-center gap-3">
                        <Archive className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Tổng số biến thể</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {hierarchy.totalVariants}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Variants */}
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400">Biến thể hoạt động</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {hierarchy.activeVariants}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Inactive Variants */}
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400">Biến thể không hoạt động</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {hierarchy.inactiveVariants}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Stock */}
                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <div className="flex items-center gap-3">
                        <Box className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400">Tổng tồn kho</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {hierarchy.totalStock}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Details */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Stock by Size */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tồn kho theo kích thước
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(hierarchy.stockBySize).length > 0 ? (
                            Object.entries(hierarchy.stockBySize).map(([size, stock]) => (
                                <div key={size} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{size}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {stock} sản phẩm
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu kích thước</p>
                        )}
                    </div>
                </div>

                {/* Stock by Color */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tồn kho theo màu sắc
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(hierarchy.stockByColor).length > 0 ? (
                            Object.entries(hierarchy.stockByColor).map(([color, stock]) => (
                                <div key={color} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-4 w-4 rounded-full border border-gray-200 dark:border-gray-600"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {color}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {stock} sản phẩm
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu màu sắc</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};