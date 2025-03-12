import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic selectors
export const selectProductExcelState = (state: RootState) => state.productExcel;

export const selectImportResult = createSelector(
    selectProductExcelState,
    (state) => state.importResult
);

export const selectExportResult = createSelector(
    selectProductExcelState,
    (state) => state.exportResult
);

export const selectImportProgress = createSelector(
    selectProductExcelState,
    (state) => state.importProgress
);

export const selectZipInfo = createSelector(
    selectProductExcelState,
    (state) => state.zipInfo
);

export const selectTemplateInfo = createSelector(
    selectProductExcelState,
    (state) => state.templateInfo
);

export const selectSkuPreview = createSelector(
    selectProductExcelState,
    (state) => state.skuPreview
);

export const selectBulkOperationResult = createSelector(
    selectProductExcelState,
    (state) => state.bulkOperationResult
);

export const selectErrorReport = createSelector(
    selectProductExcelState,
    (state) => state.errorReport
);

export const selectIsLoading = createSelector(
    selectProductExcelState,
    (state) => state.isLoading
);

export const selectIsExporting = createSelector(
    selectProductExcelState,
    (state) => state.isExporting
);

export const selectIsImporting = createSelector(
    selectProductExcelState,
    (state) => state.isImporting
);

export const selectError = createSelector(
    selectProductExcelState,
    (state) => state.error
);

// Import details selectors
export const selectImportStats = createSelector(
    selectImportResult,
    (importResult) => importResult ? {
        totalProducts: importResult.totalProducts,
        totalVariants: importResult.totalVariants,
        errorCount: importResult.errorCount,
        errorRowCount: importResult.errorRowCount,
        hasErrorReport: importResult.hasErrorReport
    } : null
);

export const selectImportedProducts = createSelector(
    selectImportResult,
    (importResult) => importResult?.importedProducts || []
);

export const selectImportedVariants = createSelector(
    selectImportResult,
    (importResult) => importResult?.importedVariants || []
);

// Import progress selectors
export const selectImportProgressInfo = createSelector(
    selectImportProgress,
    (progress) => progress ? {
        percentComplete: progress.percentComplete,
        processedItems: progress.processedItems,
        totalItems: progress.totalItems,
        inProgress: progress.inProgress
    } : null
);

export const selectImportProgressErrors = createSelector(
    selectImportProgress,
    (progress) => progress?.errors || []
);

export const selectImportJobId = createSelector(
    selectImportProgress,
    (progress) => progress?.jobId
);

// ZIP info selectors
export const selectZipContents = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo ? {
        hasExcelFile: zipInfo.hasExcelFile,
        hasImagesFolder: zipInfo.hasImagesFolder,
        imageCount: zipInfo.imageCount,
        excelFileName: zipInfo.excelFileName,
        totalSize: zipInfo.totalSize
    } : null
);

export const selectZipSkuFolders = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo?.skuFolders || []
);

// Template selectors
export const selectTemplateFeatures = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo?.supportedFeatures || []
);

export const selectTemplateVersion = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo?.version
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

// Combined selectors for operation status
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

export const selectImportOperationStatus = createSelector(
    [selectIsImporting, selectError],
    (isImporting, error): OperationStatus => ({
        isLoading: isImporting,
        error,
        isSuccess: !isImporting && !error
    })
);

export const selectExportOperationStatus = createSelector(
    [selectIsExporting, selectError],
    (isExporting, error): OperationStatus => ({
        isLoading: isExporting,
        error,
        isSuccess: !isExporting && !error
    })
);

export const selectGeneralOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Selector for any active operation
export const selectIsAnyOperationInProgress = createSelector(
    [selectIsLoading, selectIsImporting, selectIsExporting],
    (isLoading, isImporting, isExporting) => isLoading || isImporting || isExporting
);

// Utility selectors for specific properties
export const selectHasImportErrors = createSelector(
    selectImportResult,
    (importResult) => importResult ? importResult.errorCount > 0 : false
);

export const selectErrorReportUrl = createSelector(
    selectImportResult,
    (importResult) => importResult?.errorReportUrl
);

export const selectCanDownloadErrorReport = createSelector(
    [selectHasImportErrors, selectErrorReportUrl],
    (hasErrors, url) => hasErrors && !!url
);

export const selectBulkOperationSuccess = createSelector(
    selectBulkOperationResult,
    (result) => result?.success || false
);

export const selectBulkOperationWarnings = createSelector(
    selectBulkOperationResult,
    (result) => result?.warnings || []
);

export const selectBulkOperationErrors = createSelector(
    selectBulkOperationResult,
    (result) => result?.errors || []
);

export const selectSkuGenerationDetails = createSelector(
    selectSkuPreview,
    (skuPreview) => skuPreview ? {
        generatedSku: skuPreview.generatedSku,
        productCode: skuPreview.productCode,
        sizeCode: skuPreview.sizeCode,
        colorCode: skuPreview.colorCode
    } : null
);