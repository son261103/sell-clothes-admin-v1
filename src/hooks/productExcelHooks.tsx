import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    importProducts,
    checkImportStatus,
    downloadTemplate,
    exportProducts,
    getTemplateInfo,
    analyzeZipFile,
    generateSkuPreview,
    performBulkOperation,
    fetchErrorReport,
    clearError,
    clearImportResult,
    clearExportResult,
    clearImportProgress,
    clearErrorReport,
    clearZipInfo,
    clearSkuPreview,
    clearBulkOperationResult
} from '../store/features/product/productExcelSlice';
import {
    selectImportResult,
    selectExportResult,
    selectImportProgress,
    selectZipInfo,
    selectTemplateInfo,
    selectSkuPreview,
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
    selectTemplateFeatures,
    selectTemplateVersion,
    selectErrorDetails,
    selectTotalErrors,
    selectImportOperationStatus,
    selectExportOperationStatus,
    selectGeneralOperationStatus,
    selectIsAnyOperationInProgress,
    selectHasImportErrors,
    selectErrorReportUrl,
    selectCanDownloadErrorReport,
    selectBulkOperationSuccess,
    selectBulkOperationWarnings,
    selectBulkOperationErrors,
    selectSkuGenerationDetails
} from '../store/features/product/productExcelSelectors';
import type {
    ProductExcelImportRequest,
    ProductExcelExportRequest,
    ProductExcelImportProgressRequest,
    ProductExcelZipInfoRequest,
    SkuGenerationPreviewRequest
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
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleDownloadTemplate = useCallback(async () => {
        try {
            await dispatch(downloadTemplate()).unwrap();
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
        isLoading,
        error,
        isSuccess,
        downloadTemplate: handleDownloadTemplate,
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

// Hook for bulk operations
export const useProductExcelBulkOperations = () => {
    const dispatch = useAppDispatch();
    const bulkOperationResult = useAppSelector(selectBulkOperationResult);
    const bulkOperationSuccess = useAppSelector(selectBulkOperationSuccess);
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
    const { isLoading, error, isSuccess } = useAppSelector(selectGeneralOperationStatus);

    const handleFetchErrorReport = useCallback(async (reportUrl: string) => {
        try {
            const result = await dispatch(fetchErrorReport(reportUrl)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearErrorReport = useCallback(() => {
        dispatch(clearErrorReport());
    }, [dispatch]);

    return {
        errorReport,
        errorDetails,
        totalErrors,
        isLoading,
        error,
        isSuccess,
        fetchErrorReport: handleFetchErrorReport,
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