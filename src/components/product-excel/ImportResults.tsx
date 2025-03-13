import React from 'react';
import {CheckCircle, AlertCircle, FileDown, Download, Clock, Calendar, Loader2} from 'lucide-react';
import { ImportResultsProps } from './types';

const ImportResults: React.FC<ImportResultsProps> = ({
                                                         importResult,
                                                         importStats,
                                                         progressInfo,
                                                         errorReport,
                                                         errorDetails,
                                                         errorReportGeneratedAt,
                                                         handleFetchErrorReport,
                                                         handleDownloadErrorReport
                                                     }) => {
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div className="border rounded-md p-3">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Sản phẩm</span>
                        <span className="text-lg font-medium">{importStats.totalProducts}</span>
                    </div>
                    <div className="border rounded-md p-3">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Biến thể</span>
                        <span className="text-lg font-medium">{importStats.totalVariants}</span>
                    </div>
                    {importStats.totalImported !== undefined && (
                        <div className="border rounded-md p-3">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Đã nhập</span>
                            <span className="text-lg font-medium text-green-600 dark:text-green-400">{importStats.totalImported}</span>
                        </div>
                    )}
                    <div className="border rounded-md p-3">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Lỗi</span>
                        <span className={`text-lg font-medium ${importStats.errorCount > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {importStats.errorCount}
                        </span>
                    </div>
                </div>
            )}

            {importResult.hasErrorReport && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleFetchErrorReport}
                            className="text-primary hover:text-primary/90 text-sm flex items-center"
                        >
                            <FileDown className="h-4 w-4 mr-1" />
                            Xem báo cáo lỗi
                        </button>

                        <button
                            onClick={handleDownloadErrorReport}
                            className="text-primary hover:text-primary/90 text-sm flex items-center"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Tải báo cáo lỗi
                        </button>

                        {errorReportGeneratedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Báo cáo tạo lúc: {new Date(errorReportGeneratedAt).toLocaleString('vi-VN')}
                            </span>
                        )}
                    </div>

                    {errorReport && (
                        <div className="mt-3 border rounded-md p-3 max-h-60 overflow-y-auto">
                            <h4 className="font-medium mb-2 flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                Báo cáo lỗi ({errorReport.totalErrors} lỗi trong {errorReport.errorRowCount} dòng)
                            </h4>
                            <div className="space-y-3">
                                {errorDetails.map((error, index) => (
                                    <div key={index} className="border-l-2 border-red-500 pl-3 py-1">
                                        <p className="text-sm">
                                            <span className="font-medium">Sheet: </span>
                                            {error.sheet}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Dòng: </span>
                                            {error.row}
                                            {error.column && (
                                                <>, <span className="font-medium">Cột: </span>
                                                    {error.column}</>
                                            )}
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
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm items-center">
                        <span className="flex items-center">
                            <Loader2 className="h-4 w-4 text-primary mr-2 animate-spin" />
                            Đang xử lý...
                            {progressInfo.message && <span className="ml-2 text-gray-500">({progressInfo.message})</span>}
                        </span>
                        <span>{progressInfo.percentComplete}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${progressInfo.percentComplete}%` }}
                        ></div>
                    </div>
                    <div className="flex flex-wrap justify-between text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            Đã xử lý {progressInfo.processedItems} / {progressInfo.totalItems} mục
                        </p>
                        {progressInfo.estimatedEndTime && (
                            <p className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Hoàn thành dự kiến: {new Date(progressInfo.estimatedEndTime).toLocaleTimeString('vi-VN')}
                            </p>
                        )}
                    </div>

                    {progressInfo.errors && progressInfo.errors.length > 0 && (
                        <div className="mt-2 border-l-2 border-amber-500 pl-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-r-md">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Cảnh báo:</p>
                            <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-300 space-y-1 mt-1">
                                {progressInfo.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportResults;