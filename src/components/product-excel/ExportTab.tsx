import React, { useState } from 'react';
import { Filter, Loader2, Download, Info } from 'lucide-react';

import {
    useProductExcel,
    useProductExcelExport
} from '../../hooks/productExcelHooks';
import { useProducts } from '../../hooks/productHooks';

import ExportOptions from './ExportOptions';
import ErrorMessage from './ErrorMessage';

import type { ProductExcelExportRequest } from '@/types';

const ExportTab: React.FC = () => {
    // State
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Export options state
    const [exportOptions, setExportOptions] = useState<ProductExcelExportRequest>({
        includeVariants: true,
        includeImages: true,
        fileFormat: 'xlsx'
    });

    // Hooks
    const { error: generalError, clearError } = useProductExcel();
    const {
        isLoading: isExporting,
        exportProducts
    } = useProductExcelExport();
    const { productsPage } = useProducts();

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

    // Handle export submission
    const handleSubmitExport = async () => {
        await exportProducts(exportOptions);
    };

    return (
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
            {showExportOptions && (
                <ExportOptions
                    exportOptions={exportOptions}
                    handleExportOptionChange={handleExportOptionChange}
                />
            )}

            {/* Error Message */}
            <ErrorMessage error={generalError} onClear={clearError} />
        </div>
    );
};

export default ExportTab;