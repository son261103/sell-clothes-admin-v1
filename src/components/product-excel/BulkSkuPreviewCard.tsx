import React, { useState } from 'react';
import { Loader2, Tag, Download, ArrowDownUp, Filter } from 'lucide-react';
import { BulkSkuPreviewCardProps } from './types';
import BulkSkuPreviewTable from './BulkSkuPreviewTable';

const BulkSkuPreviewCard: React.FC<BulkSkuPreviewCardProps> = ({
                                                                   bulkSkuPreview,
                                                                   isLoading
                                                               }) => {
    const [filterBy, setFilterBy] = useState<'all' | 'size' | 'color'>('all');
    const [selectedFilter, setSelectedFilter] = useState<string>('');

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                <span>Đang tạo mã SKU...</span>
            </div>
        );
    }

    if (!bulkSkuPreview) {
        return null;
    }

    const { product, skus, totalCount } = bulkSkuPreview;

    // Get unique sizes and colors for filtering
    const uniqueSizes = [...new Set(skus.map(sku => sku.size))];
    const uniqueColors = [...new Set(skus.map(sku => sku.color))];

    // Filter skus based on current filter
    const filteredSkus = (() => {
        if (filterBy === 'all' || !selectedFilter) {
            return skus;
        } else if (filterBy === 'size') {
            return skus.filter(sku => sku.size === selectedFilter);
        } else if (filterBy === 'color') {
            return skus.filter(sku => sku.color === selectedFilter);
        }
        return skus;
    })();

    const exportToCsv = () => {
        // Create CSV content
        const headers = ['STT', 'SKU', 'Kích thước', 'Màu sắc', 'Thư mục'];
        const rows = skus.map((sku, index) => [
            (index + 1).toString(),
            sku.sku,
            sku.size,
            sku.color,
            sku.folderPath
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create a Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `skus_${product.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                    <Tag className="h-5 w-5 text-primary mr-2" />
                    Kết quả tạo mã SKU ({totalCount})
                </h3>
                <button
                    onClick={exportToCsv}
                    className="text-primary hover:text-primary/90 text-sm flex items-center"
                >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    <span>Xuất CSV</span>
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Sản phẩm:</span>
                        <span className="ml-2 font-medium">{product}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Tổng số SKU:</span>
                        <span className="ml-2 font-medium text-primary">{totalCount}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm">Lọc theo:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={filterBy}
                        onChange={(e) => {
                            setFilterBy(e.target.value as 'all' | 'size' | 'color');
                            setSelectedFilter('');
                        }}
                        className="text-sm h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    >
                        <option value="all">Tất cả</option>
                        <option value="size">Kích thước</option>
                        <option value="color">Màu sắc</option>
                    </select>

                    {filterBy === 'size' && (
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="text-sm h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value="">Tất cả kích thước</option>
                            {uniqueSizes.map((size, index) => (
                                <option key={index} value={size}>{size}</option>
                            ))}
                        </select>
                    )}

                    {filterBy === 'color' && (
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="text-sm h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value="">Tất cả màu sắc</option>
                            {uniqueColors.map((color, index) => (
                                <option key={index} value={color}>{color}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => {
                            setFilterBy('all');
                            setSelectedFilter('');
                        }}
                        className="text-sm h-8 px-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    >
                        <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
                        Đặt lại
                    </button>
                </div>
            </div>

            <BulkSkuPreviewTable skus={filteredSkus} />

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Hiển thị {filteredSkus.length} trên tổng số {totalCount} mã SKU
                {filterBy !== 'all' && selectedFilter && ` (Đang lọc theo ${filterBy === 'size' ? 'kích thước' : 'màu sắc'}: ${selectedFilter})`}
            </div>
        </div>
    );
};

export default BulkSkuPreviewCard;