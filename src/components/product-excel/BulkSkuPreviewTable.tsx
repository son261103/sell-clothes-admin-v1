import React from 'react';
import { Copy, FolderClosed } from 'lucide-react';
import { BulkSkuPreviewTableProps } from './types';

const BulkSkuPreviewTable: React.FC<BulkSkuPreviewTableProps> = ({ skus }) => {
    if (!skus || skus.length === 0) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Đã sao chép vào clipboard!');
            })
            .catch(err => {
                console.error('Lỗi khi sao chép:', err);
            });
    };

    return (
        <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kích thước
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Màu sắc
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Thư mục
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hành động
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {skus.map((sku, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                            {sku.sku}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {sku.size}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {sku.color}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <FolderClosed className="h-3.5 w-3.5 mr-1 text-primary" />
                            <span className="text-xs truncate max-w-xs">{sku.folderPath}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                            <button
                                onClick={() => copyToClipboard(sku.sku)}
                                className="text-primary hover:text-primary/90 text-sm"
                                title="Sao chép SKU"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default BulkSkuPreviewTable;