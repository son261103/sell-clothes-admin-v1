import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FileAnalysisProps } from './types';

const FileAnalysis: React.FC<FileAnalysisProps> = ({
                                                       selectedFile,
                                                       isAnalyzingFile,
                                                       zipContents,
                                                       skuFolders
                                                   }) => {
    if (!selectedFile) return null;

    const isZipFile = selectedFile.name.toLowerCase().endsWith('.zip');
    const isExcelFile = selectedFile.name.toLowerCase().endsWith('.xlsx') ||
        selectedFile.name.toLowerCase().endsWith('.xls');

    if (isAnalyzingFile) {
        return (
            <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                <span>Đang phân tích tập tin...</span>
            </div>
        );
    }

    // Handle case for empty/invalid zip contents
    const isZipAnalysisFailed = isZipFile && (!zipContents ||
        (typeof zipContents.hasExcelFile === 'undefined' &&
            typeof zipContents.hasImagesFolder === 'undefined'));

    if (isZipAnalysisFailed) {
        return (
            <div className="border border-amber-200 dark:border-amber-900 rounded-md p-4 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">Không thể phân tích tập tin ZIP</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Không thể phân tích nội dung của tập tin ZIP. Hãy đảm bảo rằng tập tin ZIP có cấu trúc hợp lệ và chứa tập tin Excel.
                </p>
            </div>
        );
    }

    if (isZipFile && zipContents) {
        return (
            <div className="border rounded-md p-4 space-y-3">
                <h3 className="font-medium">Thông tin tập tin ZIP</h3>
                <div className="space-y-2">
                    <p>
                        <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Có tập tin Excel:</span>
                        <span className={zipContents.hasExcelFile ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {zipContents.hasExcelFile ? "✓" : "✗"}
                        </span>
                    </p>
                    {zipContents.hasExcelFile && zipContents.excelFileName && (
                        <p>
                            <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Tên tập tin Excel:</span>
                            <span>{zipContents.excelFileName}</span>
                        </p>
                    )}
                    <p>
                        <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Có thư mục hình ảnh:</span>
                        <span className={zipContents.hasImagesFolder ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {zipContents.hasImagesFolder ? "✓" : "✗"}
                        </span>
                    </p>
                    {zipContents.hasImagesFolder && zipContents.imageCount !== undefined && (
                        <p>
                            <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Số lượng hình ảnh:</span>
                            <span>{zipContents.imageCount}</span>
                        </p>
                    )}
                    <p>
                        <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Kích thước tổng:</span>
                        <span>
                            {zipContents.formattedSize ||
                                (zipContents.totalSize && !isNaN(zipContents.totalSize)
                                    ? `${(zipContents.totalSize / (1024 * 1024)).toFixed(2)} MB`
                                    : 'Không xác định')}
                        </span>
                    </p>
                </div>

                {!zipContents.hasExcelFile && (
                    <div className="mt-2 p-3 border border-red-200 dark:border-red-900 rounded-md bg-red-50 dark:bg-red-900/10">
                        <div className="flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <p className="text-sm font-medium">Thiếu tập tin Excel</p>
                        </div>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                            Tập tin ZIP phải chứa một tập tin Excel (.xlsx hoặc .xls) ở thư mục gốc.
                        </p>
                    </div>
                )}

                {skuFolders && skuFolders.length > 0 && (
                    <div>
                        <h4 className="font-medium mt-3 mb-2">Thư mục SKU đã phát hiện ({skuFolders.length})</h4>
                        <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                    <th className="py-2 px-3">SKU</th>
                                    <th className="py-2 px-3">Hình ảnh chính</th>
                                    <th className="py-2 px-3">Hình ảnh phụ</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {skuFolders.map((folder, index) => (
                                    <tr key={index} className="text-sm">
                                        <td className="py-2 px-3">{folder.sku}</td>
                                        <td className="py-2 px-3">
                                            <span className={folder.hasMainImage ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                                {folder.hasMainImage ? "✓" : "✗"}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3">{folder.secondaryImageCount}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (isExcelFile) {
        return (
            <div className="border rounded-md p-4">
                <h3 className="font-medium">Thông tin tập tin Excel</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Đã chọn tập tin Excel. Lưu ý rằng nếu bạn muốn nhập hình ảnh, hãy đóng gói
                    tập tin Excel và thư mục hình ảnh vào một file ZIP.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-red-200 dark:border-red-900 rounded-md p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Định dạng tập tin không hỗ trợ</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Vui lòng chọn tập tin Excel (.xlsx, .xls) hoặc tập tin ZIP chứa Excel và hình ảnh.
            </p>
        </div>
    );
};

export default FileAnalysis;