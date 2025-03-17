import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic state selector - the only one that directly accesses root state
export const selectProductSeparateExcelState = (state: RootState) => state.productSeparateExcel;

//===========================================================================
// BASIC PROPERTY SELECTORS
//===========================================================================

// Product state selectors
export const selectProductImportResult = (state: RootState) => selectProductSeparateExcelState(state).productImportResult;
export const selectProductExportResult = (state: RootState) => selectProductSeparateExcelState(state).productExportResult;

// Variant state selectors
export const selectVariantImportResult = (state: RootState) => selectProductSeparateExcelState(state).variantImportResult;
export const selectVariantExportResult = (state: RootState) => selectProductSeparateExcelState(state).variantExportResult;

// Shared state selectors
export const selectImportProgress = (state: RootState) => selectProductSeparateExcelState(state).importProgress;
export const selectErrorReport = (state: RootState) => selectProductSeparateExcelState(state).errorReport;

// Status flag selectors
export const selectIsLoading = (state: RootState) => selectProductSeparateExcelState(state).isLoading;
export const selectIsExporting = (state: RootState) => selectProductSeparateExcelState(state).isExporting;
export const selectIsImporting = (state: RootState) => selectProductSeparateExcelState(state).isImporting;
export const selectError = (state: RootState) => selectProductSeparateExcelState(state).error;

//===========================================================================
// DERIVED SELECTORS FOR PRODUCT STATE
//===========================================================================

// Product import result selectors
export const selectProductImportStats = createSelector(
    selectProductImportResult,
    (importResult) => importResult ? {
        totalImported: importResult.totalImported || 0,
        errorCount: importResult.errorCount || 0,
        errorRowCount: importResult.errorRowCount || 0,
        hasErrorReport: importResult.hasErrorReport || false,
        success: importResult.success || false
    } : null
);

export const selectProductImportedProducts = createSelector(
    selectProductImportResult,
    (importResult) => importResult?.importedProducts || []
);

export const selectProductIds = createSelector(
    selectProductImportResult,
    (importResult) => importResult?.productIds || []
);

export const selectProductHasImportErrors = createSelector(
    selectProductImportResult,
    (importResult) => importResult ?
        (importResult.errorCount && importResult.errorCount > 0) || false : false
);

export const selectProductErrorReportUrl = createSelector(
    selectProductImportResult,
    (importResult) => importResult?.errorReportUrl || ''
);

export const selectProductCanDownloadErrorReport = createSelector(
    [selectProductHasImportErrors, selectProductErrorReportUrl],
    (hasErrors, url) => hasErrors && !!url
);

// Product export result selectors
export const selectProductExportDetails = createSelector(
    selectProductExportResult,
    (exportResult) => exportResult ? {
        fileUrl: exportResult.fileUrl,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        productCount: exportResult.productCount,
        exportedAt: exportResult.exportedAt
    } : null
);

//===========================================================================
// DERIVED SELECTORS FOR VARIANT STATE
//===========================================================================

// Variant import result selectors
export const selectVariantImportStats = createSelector(
    selectVariantImportResult,
    (importResult) => importResult ? {
        totalImported: importResult.totalImported || 0,
        errorCount: importResult.errorCount || 0,
        errorRowCount: importResult.errorRowCount || 0,
        hasErrorReport: importResult.hasErrorReport || false,
        success: importResult.success || false
    } : null
);

export const selectVariantImportedVariants = createSelector(
    selectVariantImportResult,
    (importResult) => importResult?.importedVariants || []
);

export const selectVariantSkuList = createSelector(
    selectVariantImportResult,
    (importResult) => importResult?.skuList || []
);

export const selectVariantHasImportErrors = createSelector(
    selectVariantImportResult,
    (importResult) => importResult ?
        (importResult.errorCount && importResult.errorCount > 0) || false : false
);

export const selectVariantErrorReportUrl = createSelector(
    selectVariantImportResult,
    (importResult) => importResult?.errorReportUrl || ''
);

export const selectVariantCanDownloadErrorReport = createSelector(
    [selectVariantHasImportErrors, selectVariantErrorReportUrl],
    (hasErrors, url) => hasErrors && !!url
);

// Variant export result selectors
export const selectVariantExportDetails = createSelector(
    selectVariantExportResult,
    (exportResult) => exportResult ? {
        fileUrl: exportResult.fileUrl,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        variantCount: exportResult.variantCount,
        exportedAt: exportResult.exportedAt
    } : null
);

//===========================================================================
// DERIVED SELECTORS FOR SHARED STATE
//===========================================================================

// Import progress selectors
export const selectImportProgressInfo = createSelector(
    selectImportProgress,
    (progress) => progress ? {
        percentComplete: progress.percentComplete,
        processedItems: progress.processedItems,
        totalItems: progress.totalItems,
        inProgress: progress.inProgress,
        jobId: progress.jobId || '',
        startTime: progress.startTime || '',
        estimatedEndTime: progress.estimatedEndTime || '',
        currentStatus: progress.currentStatus || '',
        errors: progress.errors || [],
        message: progress.message || ''
    } : null
);

export const selectImportProgressErrors = createSelector(
    selectImportProgress,
    (progress) => progress?.errors || []
);

export const selectImportJobId = createSelector(
    selectImportProgress,
    (progress) => progress?.jobId || ''
);

// Error report selectors
export const selectErrorDetails = createSelector(
    selectErrorReport,
    (errorReport) => errorReport?.errors || []
);

export const selectTotalErrors = createSelector(
    selectErrorReport,
    (errorReport) => errorReport?.totalErrors || 0
);

export const selectErrorRowCount = createSelector(
    selectErrorReport,
    (errorReport) => errorReport?.errorRowCount || 0
);

export const selectErrorReportGeneratedAt = createSelector(
    selectErrorReport,
    (errorReport) => errorReport?.generatedAt || ''
);

//===========================================================================
// OPERATION STATUS SELECTORS
//===========================================================================

// Define operation status interface
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

// General operation status selectors
export const selectIsAnyOperationInProgress = createSelector(
    [selectIsLoading, selectIsImporting, selectIsExporting],
    (isLoading, isImporting, isExporting) => isLoading || isImporting || isExporting
);

export const selectGeneralOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Product operation status selectors
export const selectProductImportOperationStatus = createSelector(
    [selectIsImporting, selectError],
    (isImporting, error): OperationStatus => ({
        isLoading: isImporting,
        error,
        isSuccess: !isImporting && !error
    })
);

export const selectProductExportOperationStatus = createSelector(
    [selectIsExporting, selectError],
    (isExporting, error): OperationStatus => ({
        isLoading: isExporting,
        error,
        isSuccess: !isExporting && !error
    })
);

// Variant operation status selectors
export const selectVariantImportOperationStatus = createSelector(
    [selectIsImporting, selectError],
    (isImporting, error): OperationStatus => ({
        isLoading: isImporting,
        error,
        isSuccess: !isImporting && !error
    })
);

export const selectVariantExportOperationStatus = createSelector(
    [selectIsExporting, selectError],
    (isExporting, error): OperationStatus => ({
        isLoading: isExporting,
        error,
        isSuccess: !isExporting && !error
    })
);

// Template and error report download status selectors
export const selectTemplateDownloadStatus = createSelector(
    selectGeneralOperationStatus,
    (status) => ({...status}) // Return a new object to ensure reference changes
);

export const selectIsDownloadingErrorReport = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error) => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Combined selectors for error reporting
export const selectAnyImportHasErrors = createSelector(
    [selectProductHasImportErrors, selectVariantHasImportErrors],
    (productHasErrors, variantHasErrors) => productHasErrors || variantHasErrors
);

export const selectAnyErrorReportUrl = createSelector(
    [selectProductErrorReportUrl, selectVariantErrorReportUrl],
    (productUrl, variantUrl) => productUrl || variantUrl
);

export const selectCanDownloadAnyErrorReport = createSelector(
    [selectProductCanDownloadErrorReport, selectVariantCanDownloadErrorReport],
    (productCanDownload, variantCanDownload) => productCanDownload || variantCanDownload
);