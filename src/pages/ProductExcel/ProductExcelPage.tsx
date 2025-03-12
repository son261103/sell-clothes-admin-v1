import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import {
    Download, Upload, PackageOpen, FileSpreadsheet,
    AlertCircle, CheckCircle, Loader2, ArrowLeft,
    FileDown, FileUp, FileQuestion, X, Info,
    HelpCircle, Filter
} from 'lucide-react';

import {
    useProductExcel,
    useProductExcelImport,
    useProductExcelExport,
    useProductExcelTemplate,
    useProductExcelStatus,
    useProductExcelZipInfo,
    useProductExcelErrorReport
} from '../../hooks/productExcelHooks';
import { useProducts } from '../../hooks/productHooks';

import type {
    ProductExcelImportRequest,
    ProductExcelImportOptions,
    ProductExcelExportRequest,
    ProductExcelZipInfoRequest
} from '@/types';

// Information Modal Component
const InfoModal = ({
                       isOpen,
                       title,
                       content,
                       onClose
                   }: {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onClose: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    {title}
                                </h3>

                                <div className="mt-2">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductExcelPage: React.FC = () => {
    // UI States
    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importConfirmed, setImportConfirmed] = useState(false);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false);
    const [showImportResults, setShowImportResults] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
    const [isPollingStatus, setIsPollingStatus] = useState(false);

    // Export options state
    const [exportOptions, setExportOptions] = useState<ProductExcelExportRequest>({
        includeVariants: true,
        includeImages: true,
        fileFormat: 'xlsx'
    });

    // Import options state
    const [importOptions, setImportOptions] = useState<ProductExcelImportOptions>({
        validateOnly: false,
        skipDuplicates: true,
        updateExisting: false,
        importImages: true,
        generateSlugs: true,
        generateSkus: true
    });

    // Products state
    const { productsPage } = useProducts();

    // Hooks
    const { error: generalError, clearError } = useProductExcel();
    const {
        importResult,
        importStats,
        isLoading: isImporting,
        importProducts,
        clearImportResult
    } = useProductExcelImport();
    const {
        isLoading: isExporting,
        exportProducts
    } = useProductExcelExport();
    const {
        templateInfo,
        downloadTemplate,
        getTemplateInfo
    } = useProductExcelTemplate();
    const {
        progressInfo,
        checkImportStatus
    } = useProductExcelStatus();
    const {
        zipContents,
        skuFolders,
        analyzeZipFile
    } = useProductExcelZipInfo();
    const {
        errorReport,
        errorDetails,
        fetchErrorReport
    } = useProductExcelErrorReport();

    // Fetch template info on initial load
    useEffect(() => {
        getTemplateInfo();
    }, [getTemplateInfo]);

    // Clean up status check interval on unmount
    useEffect(() => {
        return () => {
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        };
    }, [statusCheckInterval]);

    // Start polling import status when import is confirmed
    useEffect(() => {
        if (importConfirmed && importResult?.success && !isPollingStatus) {
            setIsPollingStatus(true);
            const interval = setInterval(async () => {
                const progress = await checkImportStatus();
                if (progress && (!progress.inProgress || progress.percentComplete === 100)) {
                    clearInterval(interval);
                    setIsPollingStatus(false);
                    setStatusCheckInterval(null);
                }
            }, 3000);
            setStatusCheckInterval(interval);
        }
    }, [importConfirmed, importResult, isPollingStatus, checkImportStatus]);

    // Reset states when changing tabs
    useEffect(() => {
        setSelectedFile(null);
        setImportConfirmed(false);
        setShowImportResults(false);
        setShowExportOptions(false);
        clearImportResult();
    }, [activeTab, clearImportResult]);

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setSelectedFile(null);
            return;
        }

        const file = files[0];
        setSelectedFile(file);
        setImportConfirmed(false);
        setIsAnalyzingFile(true);

        // Check if file is a ZIP file
        if (file.name.toLowerCase().endsWith('.zip')) {
            try {
                const request: ProductExcelZipInfoRequest = { file };
                await analyzeZipFile(request);
            } catch (error) {
                console.error('Error analyzing ZIP file:', error);
            }
        }

        setIsAnalyzingFile(false);
    };

    // Handle template download
    const handleDownloadTemplate = async () => {
        await downloadTemplate();
    };

    // Handle import option changes
    const handleImportOptionChange = (option: keyof ProductExcelImportOptions, value: boolean) => {
        setImportOptions(prev => ({
            ...prev,
            [option]: value
        }));
    };

    // Handle export option changes
    const handleExportOptionChange = <K extends keyof ProductExcelExportRequest>(
        option: K,
        value: ProductExcelExportRequest[K]
    ) => {
        setExportOptions(prev => ({
            ...prev,
            [option]: value
        }));
    };

    // Handle clearing error
    const handleClearError = useCallback(() => {
        if (generalError) {
            clearError();
        }
    }, [generalError, clearError]);

    // Handle import submission
    const handleSubmitImport = async () => {
        if (!selectedFile) return;

        setImportConfirmed(true);
        const request: ProductExcelImportRequest = {
            file: selectedFile,
            options: importOptions
        };

        try {
            await importProducts(request);
            setShowImportResults(true);
        } catch (error) {
            console.error('Import error:', error);
        }
    };

    // Handle export submission
    const handleSubmitExport = async () => {
        await exportProducts(exportOptions);
    };

    // Handle fetch error report
    const handleFetchErrorReport = async () => {
        if (importResult?.errorReportUrl) {
            await fetchErrorReport(importResult.errorReportUrl);
        }
    };

    // Render template info modal content
// Render template info modal content
    const renderTemplateInfoContent = () => (
        <div className="space-y-4">
            <p>
                Mẫu nhập liệu Excel cho phép bạn nhập sản phẩm hàng loạt vào hệ thống một cách dễ dàng.
            </p>
            {templateInfo && (
                <div className="space-y-2">
                    <p><strong>Phiên bản:</strong> {templateInfo.version}</p>
                    <p><strong>Cập nhật lần cuối:</strong> {new Date(templateInfo.lastUpdated).toLocaleDateString('vi-VN')}</p>

                    <p><strong>Tính năng hỗ trợ:</strong></p>
                    <ul className="list-disc pl-5">
                        {templateInfo.supportedFeatures && templateInfo.supportedFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center">
                        <span className={templateInfo.includesCategories ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {templateInfo.includesCategories ? "✓" : "✗"}
                        </span>
                            <span className="ml-2">Danh mục sản phẩm</span>
                        </div>

                        <div className="flex items-center">
                        <span className={templateInfo.includesBrands ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {templateInfo.includesBrands ? "✓" : "✗"}
                        </span>
                            <span className="ml-2">Thương hiệu</span>
                        </div>

                        <div className="flex items-center">
                        <span className={templateInfo.includesVariants ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {templateInfo.includesVariants ? "✓" : "✗"}
                        </span>
                            <span className="ml-2">Biến thể sản phẩm</span>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                Tải mẫu Excel này và thực hiện theo hướng dẫn trong tập tin để nhập sản phẩm vào hệ thống.
            </p>
        </div>
    );

    // Render import help modal content
    const renderHelpContent = () => (
        <div className="space-y-4">
            <h4 className="font-medium">Hướng dẫn nhập Excel</h4>
            <ol className="list-decimal pl-5 space-y-2">
                <li>Tải mẫu Excel từ nút "Tải mẫu nhập liệu"</li>
                <li>Điền thông tin sản phẩm theo hướng dẫn trong tập tin</li>
                <li>Nếu cần nhập hình ảnh, hãy đóng gói tập tin Excel và thư mục hình ảnh vào một file ZIP</li>
                <li>Tải lên tập tin Excel đã điền hoặc file ZIP</li>
                <li>Kiểm tra và xác nhận việc nhập sản phẩm</li>
            </ol>
            <h4 className="font-medium mt-4">Cấu trúc file ZIP</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                <pre>
{`your-import.zip
  ├── product-import.xlsx
  └── images/
      ├── SKU001/
      │   ├── main.jpg
      │   ├── image1.jpg
      │   └── image2.jpg
      └── SKU002/
          ├── main.jpg
          └── image1.jpg`}
                </pre>
            </div>
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                Đảm bảo tên thư mục hình ảnh trùng với SKU sản phẩm. Hình ảnh chính nên được đặt tên là "main.jpg".
            </p>
        </div>
    );

    // Render file analysis results
    const renderFileAnalysis = () => {
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
                        {zipContents.hasExcelFile && (
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
                        {zipContents.hasImagesFolder && (
                            <p>
                                <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Số lượng hình ảnh:</span>
                                <span>{zipContents.imageCount}</span>
                            </p>
                        )}
                        <p>
                            <span className="inline-block w-40 text-sm text-gray-500 dark:text-gray-400">Kích thước tổng:</span>
                            <span>{(zipContents.totalSize / (1024 * 1024)).toFixed(2)} MB</span>
                        </p>
                    </div>

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

    // Render import results
    const renderImportResults = () => {
        if (!importResult) return null;

        return (
            <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center">
                    {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    )}
                    <h3 className="font-medium">
                        {importResult.success ? 'Nhập liệu thành công' : 'Nhập liệu không thành công'}
                    </h3>
                </div>

                <p className="text-sm">{importResult.message}</p>

                {importStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="border rounded-md p-3">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Sản phẩm</span>
                            <span className="text-lg font-medium">{importStats.totalProducts}</span>
                        </div>
                        <div className="border rounded-md p-3">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Biến thể</span>
                            <span className="text-lg font-medium">{importStats.totalVariants}</span>
                        </div>
                        <div className="border rounded-md p-3">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Lỗi</span>
                            <span className={`text-lg font-medium ${importStats.errorCount > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                {importStats.errorCount}
                            </span>
                        </div>
                    </div>
                )}

                {importResult.hasErrorReport && (
                    <div>
                        <button
                            onClick={handleFetchErrorReport}
                            className="text-primary hover:text-primary/90 text-sm flex items-center"
                        >
                            <FileDown className="h-4 w-4 mr-1" />
                            Xem báo cáo lỗi
                        </button>

                        {errorReport && (
                            <div className="mt-3 border rounded-md p-3 max-h-60 overflow-y-auto">
                                <h4 className="font-medium mb-2">Báo cáo lỗi</h4>
                                <div className="space-y-2">
                                    {errorDetails.map((error, index) => (
                                        <div key={index} className="border-l-2 border-red-500 pl-3 py-1">
                                            <p className="text-sm">
                                                <span className="font-medium">Sheet: </span>
                                                {error.sheet}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-medium">Dòng: </span>
                                                {error.row}, <span className="font-medium">Cột: </span>
                                                {error.column}
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {error.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {progressInfo && progressInfo.inProgress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Đang xử lý...</span>
                            <span>{progressInfo.percentComplete}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${progressInfo.percentComplete}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Đã xử lý {progressInfo.processedItems} / {progressInfo.totalItems} mục
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Render export options
    const renderExportOptions = () => (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Tùy chọn xuất</h3>

            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="include-variants"
                        checked={exportOptions.includeVariants}
                        onChange={(e) => handleExportOptionChange('includeVariants', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-variants" className="ml-2 block text-sm">
                        Bao gồm biến thể sản phẩm
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="include-images"
                        checked={exportOptions.includeImages}
                        onChange={(e) => handleExportOptionChange('includeImages', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-images" className="ml-2 block text-sm">
                        Bao gồm URL hình ảnh
                    </label>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm">Định dạng tập tin:</label>
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="format-xlsx"
                                name="file-format"
                                value="xlsx"
                                checked={exportOptions.fileFormat === 'xlsx'}
                                onChange={() => handleExportOptionChange('fileFormat', 'xlsx')}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="format-xlsx" className="ml-2 block text-sm">
                                Excel (.xlsx)
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="format-csv"
                                name="file-format"
                                value="csv"
                                checked={exportOptions.fileFormat === 'csv'}
                                onChange={() => handleExportOptionChange('fileFormat', 'csv')}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="format-csv" className="ml-2 block text-sm">
                                CSV (.csv)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm">Lọc theo:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Danh mục</label>
                            <select
                                className="w-full text-sm h-9 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                value={exportOptions.categoryId?.toString() || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleExportOptionChange('categoryId', value ? Number(value) : undefined);
                                }}
                            >
                                <option value="">Tất cả danh mục</option>
                                {/* Add category options */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Thương hiệu</label>
                            <select
                                className="w-full text-sm h-9 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                value={exportOptions.brandId?.toString() || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleExportOptionChange('brandId', value ? Number(value) : undefined);
                                }}
                            >
                                <option value="">Tất cả thương hiệu</option>
                                {/* Add brand options */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Từ ngày</label>
                            <input
                                type="date"
                                className="w-full text-sm h-9 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                value={exportOptions.dateFrom || ''}
                                onChange={(e) => handleExportOptionChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Đến ngày</label>
                            <input
                                type="date"
                                className="w-full text-sm h-9 px-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                value={exportOptions.dateTo || ''}
                                onChange={(e) => handleExportOptionChange('dateTo', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render import options
    const renderImportOptions = () => (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Tùy chọn nhập liệu</h3>

            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="validate-only"
                        checked={importOptions.validateOnly}
                        onChange={(e) => handleImportOptionChange('validateOnly', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="validate-only" className="ml-2 block text-sm">
                        Chỉ kiểm tra lỗi (không nhập liệu thực tế)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="skip-duplicates"
                        checked={importOptions.skipDuplicates}
                        onChange={(e) => handleImportOptionChange('skipDuplicates', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="skip-duplicates" className="ml-2 block text-sm">
                        Bỏ qua sản phẩm trùng lặp
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="update-existing"
                        checked={importOptions.updateExisting}
                        onChange={(e) => handleImportOptionChange('updateExisting', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="update-existing" className="ml-2 block text-sm">
                        Cập nhật sản phẩm đã tồn tại
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="import-images"
                        checked={importOptions.importImages}
                        onChange={(e) => handleImportOptionChange('importImages', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="import-images" className="ml-2 block text-sm">
                        Nhập hình ảnh kèm theo
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="generate-slugs"
                        checked={importOptions.generateSlugs}
                        onChange={(e) => handleImportOptionChange('generateSlugs', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="generate-slugs" className="ml-2 block text-sm">
                        Tự động tạo đường dẫn (slug)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="generate-skus"
                        checked={importOptions.generateSkus}
                        onChange={(e) => handleImportOptionChange('generateSkus', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="generate-skus" className="ml-2 block text-sm">
                        Tự động tạo mã SKU nếu trống
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-primary"/> Quản lý nhập xuất Excel
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý nhập và xuất dữ liệu sản phẩm qua Excel
                    </p>
                </div>
                <div className="w-full sm:w-auto flex gap-2">
                    <Link
                        to="/admin/products"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <ArrowLeft className="h-3.5 w-3.5"/>
                        <span>Quay lại</span>
                    </Link>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <HelpCircle className="h-3.5 w-3.5"/>
                        <span>Hướng dẫn</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex">
                        <button
                            className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${
                                activeTab === 'import'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('import')}
                        >
                            <FileUp className="h-4 w-4" />
                            Nhập Excel
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${
                                activeTab === 'export'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('export')}
                        >
                            <FileDown className="h-4 w-4" />
                            Xuất Excel
                        </button>
                    </nav>
                </div>

                <div className="p-4">
                    {/* Import Tab Content */}
                    {activeTab === 'import' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5"/>
                                    <span>Tải mẫu nhập liệu</span>
                                </button>
                                <button
                                    onClick={() => setShowTemplateInfoModal(true)}
                                    className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                                >
                                    <FileQuestion className="h-3.5 w-3.5"/>
                                    <span>Thông tin mẫu</span>
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                                    <PackageOpen className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                </div>
                                <h3 className="text-sm font-medium mb-2">Tải lên tập tin Excel hoặc ZIP</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                                    Hỗ trợ định dạng .xlsx, .xls hoặc .zip (bao gồm Excel + hình ảnh)
                                </p>

                                <label
                                    htmlFor="file-upload"
                                    className={`inline-flex justify-center h-9 px-4 text-sm rounded-md ${
                                        selectedFile
                                            ? 'bg-gray-200 dark:bg-gray-700 text-textDark dark:text-textLight'
                                            : 'bg-primary text-white hover:bg-primary/90'
                                    } items-center gap-1.5 cursor-pointer`}
                                >
                                    <Upload className="h-3.5 w-3.5"/>
                                    <span>{selectedFile ? 'Chọn tập tin khác' : 'Chọn tập tin'}</span>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.zip"
                                    onChange={handleFileChange}
                                />

                                {selectedFile && (
                                    <div className="mt-4 flex items-center">
                                        <FileSpreadsheet className="h-4 w-4 text-primary mr-2" />
                                        <span className="text-sm">{selectedFile.name}</span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* File Analysis */}
                            {selectedFile && renderFileAnalysis()}

                            {/* Import Options */}
                            {selectedFile && !importConfirmed && renderImportOptions()}

                            {/* Import Button */}
                            {selectedFile && !importConfirmed && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSubmitImport}
                                        disabled={isImporting}
                                        className={`inline-flex justify-center h-10 px-4 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5 ${
                                            isImporting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                <span>
                                                    {importOptions.validateOnly
                                                        ? 'Kiểm tra dữ liệu'
                                                        : 'Nhập dữ liệu'}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Import Results */}
                            {showImportResults && renderImportResults()}

                            {/* Error Message */}
                            {generalError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex justify-between items-center">
                                    <div>{generalError}</div>
                                    <button onClick={handleClearError} className="text-red-500 hover:text-red-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Export Tab Content */}
                    {activeTab === 'export' && (
                        <div className="space-y-4">
                            <div className="bg-primary/10 rounded-lg p-4">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-primary">Thông tin xuất Excel</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Tính năng này cho phép bạn xuất danh sách sản phẩm ra tập tin Excel hoặc CSV.
                                            Bạn có thể tùy chỉnh các thông tin xuất và áp dụng bộ lọc.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <div className="text-sm">
                                    Hiện có <span className="font-medium">{productsPage?.totalElements || 0}</span> sản phẩm
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowExportOptions(!showExportOptions)}
                                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                                    >
                                        <Filter className="h-3.5 w-3.5"/>
                                        <span>{showExportOptions ? 'Ẩn tùy chọn' : 'Tùy chọn xuất'}</span>
                                    </button>

                                    <button
                                        onClick={handleSubmitExport}
                                        disabled={isExporting}
                                        className={`inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5 ${
                                            isExporting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isExporting ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>Đang xuất...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-3.5 w-3.5" />
                                                <span>Xuất Excel</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Export Options */}
                            {showExportOptions && renderExportOptions()}

                            {/* Error Message */}
                            {generalError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex justify-between items-center">
                                    <div>{generalError}</div>
                                    <button onClick={handleClearError} className="text-red-500 hover:text-red-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Template Info Modal */}
            <InfoModal
                isOpen={showTemplateInfoModal}
                title="Thông tin mẫu nhập liệu"
                content={renderTemplateInfoContent()}
                onClose={() => setShowTemplateInfoModal(false)}
            />

            {/* Help Modal */}
            <InfoModal
                isOpen={showHelpModal}
                title="Hướng dẫn nhập/xuất Excel"
                content={renderHelpContent()}
                onClose={() => setShowHelpModal(false)}
            />
        </div>
    );
};

export default ProductExcelPage;