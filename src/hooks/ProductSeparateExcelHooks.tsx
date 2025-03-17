import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    // Shared actions
    checkImportStatus,
    downloadErrorReport,
    getErrorReportDetails,
    clearError,
    clearImportProgress,
    clearErrorReport,

    // Product actions
    downloadProductTemplate,
    downloadProductTemplatePackage,
    importProducts,
    importProductsFromZip,
    exportProducts,
    clearProductImportResult,
    clearProductExportResult,

    // Variant actions
    downloadVariantTemplate,
    downloadVariantTemplatePackage,
    importVariants,
    importVariantsFromZip,
    exportVariants,
    clearVariantImportResult,
    clearVariantExportResult,
} from '../store/features/product/ProductSeparateExcelSlice';

import {
    // General state selectors
    selectIsAnyOperationInProgress,
    selectError,
    selectGeneralOperationStatus,

    // Import progress selectors
    selectImportProgress,
    selectImportProgressInfo,
    selectImportProgressErrors,
    selectImportJobId,

    // Error report selectors
    selectErrorReport,
    selectErrorDetails,
    selectTotalErrors,
    selectErrorRowCount,
    selectErrorReportGeneratedAt,
    selectAnyImportHasErrors,
    selectAnyErrorReportUrl,
    selectCanDownloadAnyErrorReport,
    selectIsDownloadingErrorReport,

    // Product selectors
    selectProductImportResult,
    selectProductExportResult,
    selectProductImportStats,
    selectProductImportedProducts,
    selectProductIds,
    selectProductHasImportErrors,
    selectProductErrorReportUrl,
    selectProductCanDownloadErrorReport,
    selectProductExportDetails,
    selectProductImportOperationStatus,
    selectProductExportOperationStatus,

    // Variant selectors
    selectVariantImportResult,
    selectVariantExportResult,
    selectVariantImportStats,
    selectVariantImportedVariants,
    selectVariantSkuList,
    selectVariantHasImportErrors,
    selectVariantErrorReportUrl,
    selectVariantCanDownloadErrorReport,
    selectVariantExportDetails,
    selectVariantImportOperationStatus,
    selectVariantExportOperationStatus,

    // Template download status
    selectTemplateDownloadStatus
} from '../store/features/product/ProductSeparateExcelSelectors';

import type {
    ProductSeparateExcelImportRequest,
    ProductSeparateExcelExportRequest,
    VariantSeparateExcelImportRequest,
    SeparateExcelImportProgressRequest,
} from '../types/productExel/product.separate.excel.types.tsx';
import {ErrorResponseType} from "@/types";
import apiConfig from "@/config/apiConfig.tsx";

//===========================================================================
// MAIN HOOKS
//===========================================================================

/**
 * Main hook for Excel operations - provides access to general state and error handling
 */
export const useProductSeparateExcel = () => {
    const dispatch = useAppDispatch();
    const isAnyOperationInProgress = useAppSelector(selectIsAnyOperationInProgress);
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        isAnyOperationInProgress,
        error,
        clearError: handleClearError
    };
};

//===========================================================================
// PRODUCT HOOKS
//===========================================================================

/**
 * Hook for product template operations
 */
export const useProductTemplate = () => {
    const dispatch = useAppDispatch();
    const {isLoading, error, isSuccess} = useAppSelector(selectTemplateDownloadStatus);

    const handleDownloadProductTemplate = useCallback(async () => {
        try {
            console.log('Bắt đầu tải template Excel sản phẩm');
            await dispatch(downloadProductTemplate()).unwrap();
            console.log('Đã tải template Excel sản phẩm thành công');
            return true;
        } catch (error) {
            console.error('Lỗi khi tải template Excel sản phẩm:', error);
            return false;
        }
    }, [dispatch]);

    const handleDownloadProductTemplatePackage = useCallback(async () => {
        try {
            console.log('Bắt đầu tải gói template ZIP sản phẩm');
            await dispatch(downloadProductTemplatePackage()).unwrap();
            console.log('Đã tải gói template ZIP sản phẩm thành công');
            return true;
        } catch (error) {
            console.error('Lỗi khi tải gói template ZIP sản phẩm:', error);
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        isSuccess,
        downloadProductTemplate: handleDownloadProductTemplate,
        downloadProductTemplatePackage: handleDownloadProductTemplatePackage
    };
};

/**
 * Hook for product import operations
 */
export const useProductImport = () => {
    const dispatch = useAppDispatch();
    const importResult = useAppSelector(selectProductImportResult);
    const importStats = useAppSelector(selectProductImportStats);
    const importedProducts = useAppSelector(selectProductImportedProducts);
    const productIds = useAppSelector(selectProductIds);
    const hasImportErrors = useAppSelector(selectProductHasImportErrors);
    const errorReportUrl = useAppSelector(selectProductErrorReportUrl);
    const canDownloadErrorReport = useAppSelector(selectProductCanDownloadErrorReport);
    const {isLoading, error, isSuccess} = useAppSelector(selectProductImportOperationStatus);

    const handleImportProducts = useCallback(async (request: ProductSeparateExcelImportRequest) => {
        try {
            console.log('Bắt đầu gửi yêu cầu import sản phẩm từ Excel:', request.file.name);
            const result = await dispatch(importProducts(request)).unwrap();
            console.log('Kết quả import sản phẩm từ Excel:', result);
            return result;
        } catch (error) {
            console.error('Lỗi khi import sản phẩm từ Excel:', error);
            // Trả về thông tin lỗi chi tiết thay vì null
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi import sản phẩm',
                data: null,
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleImportProductsFromZip = useCallback(async (request: ProductSeparateExcelImportRequest) => {
        try {
            console.log('Bắt đầu gửi yêu cầu import sản phẩm từ ZIP:', request.file.name);
            const result = await dispatch(importProductsFromZip(request)).unwrap();
            console.log('Kết quả import sản phẩm từ ZIP:', result);
            return result;
        } catch (error) {
            console.error('Lỗi khi import sản phẩm từ ZIP:', error);
            // Trả về thông tin lỗi chi tiết thay vì null
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi import sản phẩm từ ZIP',
                data: null,
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleClearImportResult = useCallback(() => {
        dispatch(clearProductImportResult());
    }, [dispatch]);

    // Thêm hàm debug để kiểm tra cấu trúc ZIP
    const handleDebugZipStructure = useCallback(async (file: File) => {
        try {
            console.log('Bắt đầu phân tích cấu trúc ZIP:', file.name);
            const formData = new FormData();
            formData.append('file', file);

            // Gọi API trực tiếp thay vì qua slice
            const response = await apiConfig.post(
                '/products/separate/debug/zip',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Kết quả phân tích ZIP:', response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi phân tích cấu trúc ZIP:', error);
            return {
                success: false,
                message: 'Không thể phân tích cấu trúc file ZIP',
                error: error instanceof Error ? error.message : 'Lỗi không xác định'
            };
        }
    }, []);

    return {
        importResult,
        importStats,
        importedProducts,
        productIds,
        hasImportErrors,
        errorReportUrl,
        canDownloadErrorReport,
        isLoading,
        error,
        isSuccess,
        importProducts: handleImportProducts,
        importProductsFromZip: handleImportProductsFromZip,
        clearImportResult: handleClearImportResult,
        debugZipStructure: handleDebugZipStructure
    };
};

/**
 * Hook for product export operations
 */
export const useProductExport = () => {
    const dispatch = useAppDispatch();
    const exportResult = useAppSelector(selectProductExportResult);
    const exportDetails = useAppSelector(selectProductExportDetails);
    const {isLoading, error, isSuccess} = useAppSelector(selectProductExportOperationStatus);

    const handleExportProducts = useCallback(async (request: ProductSeparateExcelExportRequest) => {
        try {
            console.log('Bắt đầu gửi yêu cầu xuất sản phẩm ra Excel:', request);
            const result = await dispatch(exportProducts(request)).unwrap();
            console.log('Đã xuất sản phẩm ra Excel thành công');
            return result;
        } catch (error) {
            console.error('Lỗi khi xuất sản phẩm ra Excel:', error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi xuất sản phẩm',
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleClearExportResult = useCallback(() => {
        dispatch(clearProductExportResult());
    }, [dispatch]);

    return {
        exportResult,
        exportDetails,
        isLoading,
        error,
        isSuccess,
        exportProducts: handleExportProducts,
        clearExportResult: handleClearExportResult
    };
};

//===========================================================================
// VARIANT HOOKS
//===========================================================================

/**
 * Hook for variant template operations
 */
export const useVariantTemplate = () => {
    const dispatch = useAppDispatch();
    const {isLoading, error, isSuccess} = useAppSelector(selectTemplateDownloadStatus);

    const handleDownloadVariantTemplate = useCallback(async (productId: number) => {
        try {
            console.log(`Bắt đầu tải template Excel biến thể cho sản phẩm ID: ${productId}`);
            await dispatch(downloadVariantTemplate(productId)).unwrap();
            console.log(`Đã tải template Excel biến thể thành công cho sản phẩm ID: ${productId}`);
            return true;
        } catch (error) {
            console.error(`Lỗi khi tải template Excel biến thể cho sản phẩm ID ${productId}:`, error);
            return false;
        }
    }, [dispatch]);

    const handleDownloadVariantTemplatePackage = useCallback(async (productId: number) => {
        try {
            console.log(`Bắt đầu tải gói template ZIP biến thể cho sản phẩm ID: ${productId}`);
            await dispatch(downloadVariantTemplatePackage(productId)).unwrap();
            console.log(`Đã tải gói template ZIP biến thể thành công cho sản phẩm ID: ${productId}`);
            return true;
        } catch (error) {
            console.error(`Lỗi khi tải gói template ZIP biến thể cho sản phẩm ID ${productId}:`, error);
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        isSuccess,
        downloadVariantTemplate: handleDownloadVariantTemplate,
        downloadVariantTemplatePackage: handleDownloadVariantTemplatePackage
    };
};

/**
 * Hook for variant import operations
 */
export const useVariantImport = () => {
    const dispatch = useAppDispatch();
    const importResult = useAppSelector(selectVariantImportResult);
    const importStats = useAppSelector(selectVariantImportStats);
    const importedVariants = useAppSelector(selectVariantImportedVariants);
    const skuList = useAppSelector(selectVariantSkuList);
    const hasImportErrors = useAppSelector(selectVariantHasImportErrors);
    const errorReportUrl = useAppSelector(selectVariantErrorReportUrl);
    const canDownloadErrorReport = useAppSelector(selectVariantCanDownloadErrorReport);
    const {isLoading, error, isSuccess} = useAppSelector(selectVariantImportOperationStatus);

    const handleImportVariants = useCallback(async (request: VariantSeparateExcelImportRequest) => {
        try {
            console.log(`Bắt đầu gửi yêu cầu import biến thể từ Excel cho sản phẩm ID: ${request.productId}`);
            const result = await dispatch(importVariants(request)).unwrap();
            console.log(`Kết quả import biến thể từ Excel cho sản phẩm ID ${request.productId}:`, result);
            return result;
        } catch (error) {
            console.error(`Lỗi khi import biến thể từ Excel cho sản phẩm ID ${request.productId}:`, error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi import biến thể',
                data: null,
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleImportVariantsFromZip = useCallback(async (request: VariantSeparateExcelImportRequest) => {
        try {
            console.log(`Bắt đầu gửi yêu cầu import biến thể từ ZIP cho sản phẩm ID: ${request.productId}`);
            const result = await dispatch(importVariantsFromZip(request)).unwrap();
            console.log(`Kết quả import biến thể từ ZIP cho sản phẩm ID ${request.productId}:`, result);
            return result;
        } catch (error) {
            console.error(`Lỗi khi import biến thể từ ZIP cho sản phẩm ID ${request.productId}:`, error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi import biến thể từ ZIP',
                data: null,
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleClearImportResult = useCallback(() => {
        dispatch(clearVariantImportResult());
    }, [dispatch]);

    return {
        importResult,
        importStats,
        importedVariants,
        skuList,
        hasImportErrors,
        errorReportUrl,
        canDownloadErrorReport,
        isLoading,
        error,
        isSuccess,
        importVariants: handleImportVariants,
        importVariantsFromZip: handleImportVariantsFromZip,
        clearImportResult: handleClearImportResult
    };
};

/**
 * Hook for variant export operations
 */
export const useVariantExport = () => {
    const dispatch = useAppDispatch();
    const exportResult = useAppSelector(selectVariantExportResult);
    const exportDetails = useAppSelector(selectVariantExportDetails);
    const {isLoading, error, isSuccess} = useAppSelector(selectVariantExportOperationStatus);

    const handleExportVariants = useCallback(async (productId: number) => {
        try {
            console.log(`Bắt đầu gửi yêu cầu xuất biến thể ra Excel cho sản phẩm ID: ${productId}`);
            const result = await dispatch(exportVariants(productId)).unwrap();
            console.log(`Đã xuất biến thể ra Excel thành công cho sản phẩm ID: ${productId}`);
            return result;
        } catch (error) {
            console.error(`Lỗi khi xuất biến thể ra Excel cho sản phẩm ID ${productId}:`, error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi xuất biến thể',
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleClearExportResult = useCallback(() => {
        dispatch(clearVariantExportResult());
    }, [dispatch]);

    return {
        exportResult,
        exportDetails,
        isLoading,
        error,
        isSuccess,
        exportVariants: handleExportVariants,
        clearExportResult: handleClearExportResult
    };
};

//===========================================================================
// SHARED HOOKS
//===========================================================================

/**
 * Hook for import status tracking
 */
export const useImportStatus = () => {
    const dispatch = useAppDispatch();
    const importProgress = useAppSelector(selectImportProgress);
    const progressInfo = useAppSelector(selectImportProgressInfo);
    const progressErrors = useAppSelector(selectImportProgressErrors);
    const jobId = useAppSelector(selectImportJobId);
    const {isLoading, error, isSuccess} = useAppSelector(selectGeneralOperationStatus);

    const handleCheckImportStatus = useCallback(async (request?: SeparateExcelImportProgressRequest) => {
        try {
            console.log('Kiểm tra trạng thái import:', request?.jobId ? `JobID: ${request.jobId}` : 'Không có JobID');
            const result = await dispatch(checkImportStatus(request)).unwrap();
            console.log('Trạng thái import:', result);
            return result;
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái import:', error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi kiểm tra trạng thái import',
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleClearImportProgress = useCallback(() => {
        dispatch(clearImportProgress());
    }, [dispatch]);

    return {
        importProgress,
        progressInfo,
        progressErrors,
        jobId,
        isLoading,
        error,
        isSuccess,
        checkImportStatus: handleCheckImportStatus,
        clearImportProgress: handleClearImportProgress
    };
};

/**
 * Hook for error reporting
 */
export const useErrorReport = () => {
    const dispatch = useAppDispatch();
    const errorReport = useAppSelector(selectErrorReport);
    const errorDetails = useAppSelector(selectErrorDetails);
    const totalErrors = useAppSelector(selectTotalErrors);
    const errorRowCount = useAppSelector(selectErrorRowCount);
    const anyImportHasErrors = useAppSelector(selectAnyImportHasErrors);
    const errorReportUrl = useAppSelector(selectAnyErrorReportUrl);
    const canDownloadErrorReport = useAppSelector(selectCanDownloadAnyErrorReport);
    const errorReportGeneratedAt = useAppSelector(selectErrorReportGeneratedAt);
    const {isLoading, error, isSuccess} = useAppSelector(selectGeneralOperationStatus);
    const downloadStatus = useAppSelector(selectIsDownloadingErrorReport);

    const handleGetErrorReportDetails = useCallback(async (reportId: string) => {
        try {
            console.log(`Bắt đầu lấy chi tiết báo cáo lỗi ID: ${reportId}`);
            const result = await dispatch(getErrorReportDetails(reportId)).unwrap();
            console.log('Chi tiết báo cáo lỗi:', result);
            return result;
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết báo cáo lỗi ID ${reportId}:`, error);
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Có lỗi không xác định khi lấy chi tiết báo cáo lỗi',
                error: error as ErrorResponseType
            };
        }
    }, [dispatch]);

    const handleDownloadErrorReport = useCallback(async (reportId: string) => {
        try {
            console.log(`Bắt đầu tải báo cáo lỗi ID: ${reportId}`);
            await dispatch(downloadErrorReport(reportId)).unwrap();
            console.log(`Đã tải báo cáo lỗi thành công ID: ${reportId}`);
            return true;
        } catch (error) {
            console.error(`Lỗi khi tải báo cáo lỗi ID ${reportId}:`, error);
            return false;
        }
    }, [dispatch]);

    const handleClearErrorReport = useCallback(() => {
        dispatch(clearErrorReport());
    }, [dispatch]);

    return {
        errorReport,
        errorDetails,
        totalErrors,
        errorRowCount,
        anyImportHasErrors,
        errorReportUrl,
        canDownloadErrorReport,
        errorReportGeneratedAt,
        isLoading,
        error,
        isSuccess,
        downloadStatus,
        getErrorReportDetails: handleGetErrorReportDetails,
        downloadErrorReport: handleDownloadErrorReport,
        clearErrorReport: handleClearErrorReport
    };
};