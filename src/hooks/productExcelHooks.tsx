import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    importProducts,
    checkImportStatus,
    downloadTemplate,
    downloadFullTemplate,
    downloadInstructions,
    exportProducts,
    getTemplateInfo,
    analyzeZipFile,
    generateSkuPreview,
    generateBulkSkuPreview,
    performBulkOperation,
    fetchErrorReport,
    downloadErrorReport,
    clearError,
    clearImportResult,
    clearExportResult,
    clearImportProgress,
    clearErrorReport,
    clearZipInfo,
    clearSkuPreview,
    clearBulkSkuPreview,
    clearBulkOperationResult
} from '../store/features/product/productExcelSlice';
import {
    selectImportResult,
    selectExportResult,
    selectImportProgress,
    selectZipInfo,
    selectTemplateInfo,
    selectSkuPreview,
    selectBulkSkuPreview,
    selectBulkOperationResult,
    selectErrorReport,
    selectError,
    selectImportStats,
    selectImportedProducts,
    selectImportedVariants,
    selectImportProgressInfo,
    selectImportProgressErrors,
    selectImportJobId,
    selectZipContents,
    selectZipSkuFolders,
    selectZipSkuList,
    selectSkusWithoutMainImage,
    selectTemplateFeatures,
    selectTemplateVersion,
    selectTemplateLastUpdated,
    selectTemplateDetails,
    selectErrorDetails,
    selectTotalErrors,
    selectErrorRowCount,
    selectErrorReportGeneratedAt,
    selectImportOperationStatus,
    selectExportOperationStatus,
    selectGeneralOperationStatus,
    selectIsAnyOperationInProgress,
    selectHasImportErrors,
    selectErrorReportUrl,
    selectCanDownloadErrorReport,
    selectBulkOperationSuccess,
    selectBulkOperationStats,
    selectBulkOperationWarnings,
    selectBulkOperationErrors,
    selectSkuGenerationDetails,
    selectBulkSkuGenerationDetails,
    selectBulkSkuList,
    selectBulkSkuPaths,
    selectBulkSkusBySize,
    selectBulkSkusByColor,
    selectTemplateDownloadStatus,
    selectIsDownloadingErrorReport
} from '../store/features/product/productExcelSelectors';
import type {
    ProductExcelImportRequest,
    ProductExcelExportRequest,
    ProductExcelImportProgressRequest,
    ProductExcelZipInfoRequest,
    SkuGenerationPreviewRequest,
    BulkSkuGenerationPreviewRequest
} from '@/types';

// Main hook for Excel operations
export const useProductExcel = () => {
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

// Hook for import operations
export const useProductExcelImport = () => {
    const dispatch = useAppDispatch();
    const importResult = useAppSelector(selectImportResult);
    const importStats = useAppSelector(selectImportStats);
    const importedProducts = useAppSelector(selectImportedProducts);
    const importedVariants = useAppSelector(selectImportedVariants);
    const hasImportErrors = useAppSelector(selectHasImportErrors);
    const errorReportUrl = useAppSelector(selectErrorReportUrl);
    const canDownloadErrorReport = useAppSelector(selectCanDownloadErrorReport);
    const { isLoading, error, isSuccess } = useAppSelector(selectImportOperationStatus);

    const handleImportProducts = useCallback(async (request: ProductExcelImportRequest) => {
        try {
            const result = await dispatch(importProducts(request)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearImportResult = useCallback(() => {
        dispatch(clearImportResult());
    }, [dispatch]);

    return {
        importResult,
        importStats,
        importedProducts,
        importedVariants,
        hasImportErrors,
        errorReportUrl,
        canDownloadErrorReport,
        isLoading,
        error,
        isSuccess,
        importProducts: handleImportProducts,
        clearImportResult: handleClearImportResult
    };
};

// Hook for export operations
export const useProductExcelExport = () => {
    const dispatch = useAppDispatch();
    const exportResult = useAppSelector(selectExportResult);
    const { isLoading, error, isSuccess } = useAppSelector(selectExportOperationStatus);

    const handleExportProducts = useCallback(async (request: ProductExcelExportRequest) => {
        try {
            const result = await dispatch(exportProducts(request)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearExportResult = useCallback(() => {
        dispatch(clearExportResult());
    }, [dispatch]);

    return {
        exportResult,
        isLoading,
        error,
        isSuccess,
        exportProducts: handleExportProducts,
        clearExportResult: handleClearExportResult
    };
};

// Hook for template operations
export const useProductExcelTemplate = () => {
    const dispatch = useAppDispatch();
    const templateInfo = useAppSelector(selectTemplateInfo);
    const templateFeatures = useAppSelector(selectTemplateFeatures);
    const templateVersion = useAppSelector(selectTemplateVersion);
    const templateLastUpdated = useAppSelector(selectTemplateLastUpdated);
    const templateDetails = useAppSelector(selectTemplateDetails);
    const { isLoading, error, isSuccess } = useAppSelector(selectTemplateDownloadStatus);

    const handleDownloadTemplate = useCallback(async () => {
        try {
            await dispatch(downloadTemplate()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDownloadFullTemplate = useCallback(async () => {
        try {
            await dispatch(downloadFullTemplate()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDownloadInstructions = useCallback(async () => {
        try {
            await dispatch(downloadInstructions()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleGetTemplateInfo = useCallback(async () => {
        try {
            const result = await dispatch(getTemplateInfo()).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    return {
        templateInfo,
        templateFeatures,
        templateVersion,
        templateLastUpdated,
        templateDetails,
        isLoading,
        error,
        isSuccess,
        downloadTemplate: handleDownloadTemplate,
        downloadFullTemplate: handleDownloadFullTemplate,
        downloadInstructions: handleDownloadInstructions,
        getTemplateInfo: handleGetTemplateInfo
    };
};

// Hook for import status tracking
export const useProductExcelStatus = () => {
    const dispatch = useAppDispatch();
    const importProgress = useAppSelector(selectImportProgress);
    const progressInfo = useAppSelector(selectImportProgressInfo);
    const progressErrors = useAppSelector(selectImportProgressErrors);
    const jobId = useAppSelector(selectImportJobId);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleCheckImportStatus = useCallback(async (request?: ProductExcelImportProgressRequest) => {
        try {
            const result = await dispatch(checkImportStatus(request)).unwrap();
            return result;
        } catch {
            return null;
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

// Hook for ZIP file inspection
export const useProductExcelZipInfo = () => {
    const dispatch = useAppDispatch();
    const zipInfo = useAppSelector(selectZipInfo);
    const zipContents = useAppSelector(selectZipContents);
    const skuFolders = useAppSelector(selectZipSkuFolders);
    const skuList = useAppSelector(selectZipSkuList);
    const skusWithoutMainImage = useAppSelector(selectSkusWithoutMainImage);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleAnalyzeZipFile = useCallback(async (request: ProductExcelZipInfoRequest) => {
        try {
            const result = await dispatch(analyzeZipFile(request)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearZipInfo = useCallback(() => {
        dispatch(clearZipInfo());
    }, [dispatch]);

    return {
        zipInfo,
        zipContents,
        skuFolders,
        skuList,
        skusWithoutMainImage,
        isLoading,
        error,
        isSuccess,
        analyzeZipFile: handleAnalyzeZipFile,
        clearZipInfo: handleClearZipInfo
    };
};

// Hook for SKU generation
export const useProductExcelSkuGeneration = () => {
    const dispatch = useAppDispatch();
    const skuPreview = useAppSelector(selectSkuPreview);
    const skuGenerationDetails = useAppSelector(selectSkuGenerationDetails);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleGenerateSkuPreview = useCallback(async (request: SkuGenerationPreviewRequest) => {
        try {
            const result = await dispatch(generateSkuPreview(request)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearSkuPreview = useCallback(() => {
        dispatch(clearSkuPreview());
    }, [dispatch]);

    return {
        skuPreview,
        skuGenerationDetails,
        isLoading,
        error,
        isSuccess,
        generateSkuPreview: handleGenerateSkuPreview,
        clearSkuPreview: handleClearSkuPreview
    };
};

// Hook for Bulk SKU generation
export const useProductExcelBulkSkuGeneration = () => {
    const dispatch = useAppDispatch();
    const bulkSkuPreview = useAppSelector(selectBulkSkuPreview);
    const bulkSkuGenerationDetails = useAppSelector(selectBulkSkuGenerationDetails);
    const bulkSkuList = useAppSelector(selectBulkSkuList);
    const bulkSkuPaths = useAppSelector(selectBulkSkuPaths);
    const bulkSkusBySize = useAppSelector(selectBulkSkusBySize);
    const bulkSkusByColor = useAppSelector(selectBulkSkusByColor);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleGenerateBulkSkuPreview = useCallback(async (request: BulkSkuGenerationPreviewRequest) => {
        try {
            const result = await dispatch(generateBulkSkuPreview(request)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearBulkSkuPreview = useCallback(() => {
        dispatch(clearBulkSkuPreview());
    }, [dispatch]);

    return {
        bulkSkuPreview,
        bulkSkuGenerationDetails,
        bulkSkuList,
        bulkSkuPaths,
        bulkSkusBySize,
        bulkSkusByColor,
        isLoading,
        error,
        isSuccess,
        generateBulkSkuPreview: handleGenerateBulkSkuPreview,
        clearBulkSkuPreview: handleClearBulkSkuPreview
    };
};

// Hook for bulk operations
export const useProductExcelBulkOperations = () => {
    const dispatch = useAppDispatch();
    const bulkOperationResult = useAppSelector(selectBulkOperationResult);
    const bulkOperationSuccess = useAppSelector(selectBulkOperationSuccess);
    const bulkOperationStats = useAppSelector(selectBulkOperationStats);
    const bulkOperationWarnings = useAppSelector(selectBulkOperationWarnings);
    const bulkOperationErrors = useAppSelector(selectBulkOperationErrors);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handlePerformBulkOperation = useCallback(async (
        operation: 'delete' | 'activate' | 'deactivate',
        productIds: number[]
    ) => {
        try {
            const result = await dispatch(performBulkOperation({ operation, productIds })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearBulkOperationResult = useCallback(() => {
        dispatch(clearBulkOperationResult());
    }, [dispatch]);

    return {
        bulkOperationResult,
        bulkOperationSuccess,
        bulkOperationStats,
        bulkOperationWarnings,
        bulkOperationErrors,
        isLoading,
        error,
        isSuccess,
        performBulkOperation: handlePerformBulkOperation,
        clearBulkOperationResult: handleClearBulkOperationResult
    };
};

// Hook for error reporting
export const useProductExcelErrorReport = () => {
    const dispatch = useAppDispatch();
    const errorReport = useAppSelector(selectErrorReport);
    const errorDetails = useAppSelector(selectErrorDetails);
    const totalErrors = useAppSelector(selectTotalErrors);
    const errorRowCount = useAppSelector(selectErrorRowCount);
    const errorReportUrl = useAppSelector(selectErrorReportUrl);
    const errorReportGeneratedAt = useAppSelector(selectErrorReportGeneratedAt);
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);
    const downloadStatus = useAppSelector(selectIsDownloadingErrorReport);

    const handleFetchErrorReport = useCallback(async (reportUrl: string) => {
        try {
            const result = await dispatch(fetchErrorReport(reportUrl)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleDownloadErrorReport = useCallback(async (reportUrl: string) => {
        try {
            await dispatch(downloadErrorReport(reportUrl)).unwrap();
            return true;
        } catch {
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
        errorReportUrl,
        errorReportGeneratedAt,
        isLoading,
        error,
        isSuccess,
        downloadStatus,
        fetchErrorReport: handleFetchErrorReport,
        downloadErrorReport: handleDownloadErrorReport,
        clearErrorReport: handleClearErrorReport
    };
};

// Hook for error handling
export const useProductExcelError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};