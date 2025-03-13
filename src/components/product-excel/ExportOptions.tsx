import React from 'react';
import { ExportOptionsProps } from './types';

const ExportOptions: React.FC<ExportOptionsProps> = ({
                                                         exportOptions,
                                                         handleExportOptionChange
                                                     }) => {
    return (
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
};

export default ExportOptions;