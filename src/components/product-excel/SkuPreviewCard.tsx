import React from 'react';
import { Loader2, Tag, Copy, FolderClosed } from 'lucide-react';
import { SkuPreviewCardProps } from './types';

const SkuPreviewCard: React.FC<SkuPreviewCardProps> = ({
                                                           skuPreview,
                                                           isLoading
                                                       }) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Đã sao chép vào clipboard!');
            })
            .catch(err => {
                console.error('Lỗi khi sao chép:', err);
            });
    };

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                <span>Đang tạo mã SKU...</span>
            </div>
        );
    }

    if (!skuPreview) {
        return null;
    }

    return (
        <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Kết quả tạo mã SKU</h3>
                <button
                    onClick={() => copyToClipboard(skuPreview.generatedSku)}
                    className="text-primary hover:text-primary/90 text-sm flex items-center"
                >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Sao chép</span>
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <Tag className="h-5 w-5 text-primary mr-2" />
                    <span className="text-lg font-medium">{skuPreview.generatedSku}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Mã sản phẩm</span>
                    <span className="text-sm font-medium">{skuPreview.productCode}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Mã kích thước</span>
                    <span className="text-sm font-medium">{skuPreview.sizeCode}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Mã màu sắc</span>
                    <span className="text-sm font-medium">{skuPreview.colorCode}</span>
                </div>
            </div>

            {skuPreview.folderPath && (
                <div className="mt-3">
                    <div className="flex items-center mb-1">
                        <FolderClosed className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium">Đường dẫn thư mục hình ảnh:</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm">
                        <code>{skuPreview.folderPath}</code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sử dụng đường dẫn này để tổ chức hình ảnh sản phẩm trong file ZIP khi nhập sản phẩm
                    </p>
                </div>
            )}
        </div>
    );
};

export default SkuPreviewCard;