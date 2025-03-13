import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic state selector - the only one that directly accesses root state
export const selectProductExcelState = (state: RootState) => state.productExcel;

// Basic property selectors - these don't use createSelector since they're just accessing properties
// and don't need memoization for such simple operations
export const selectImportResult = (state: RootState) => selectProductExcelState(state).importResult;
export const selectExportResult = (state: RootState) => selectProductExcelState(state).exportResult;
export const selectImportProgress = (state: RootState) => selectProductExcelState(state).importProgress;
export const selectZipInfo = (state: RootState) => selectProductExcelState(state).zipInfo;
export const selectTemplateInfo = (state: RootState) => selectProductExcelState(state).templateInfo;
export const selectSkuPreview = (state: RootState) => selectProductExcelState(state).skuPreview;
export const selectBulkSkuPreview = (state: RootState) => selectProductExcelState(state).bulkSkuPreview;
export const selectBulkOperationResult = (state: RootState) => selectProductExcelState(state).bulkOperationResult;
export const selectErrorReport = (state: RootState) => selectProductExcelState(state).errorReport;
export const selectIsLoading = (state: RootState) => selectProductExcelState(state).isLoading;
export const selectIsExporting = (state: RootState) => selectProductExcelState(state).isExporting;
export const selectIsImporting = (state: RootState) => selectProductExcelState(state).isImporting;
export const selectError = (state: RootState) => selectProductExcelState(state).error;

// Derived selectors that perform actual transformations - these use createSelector for memoization
export const selectImportStats = createSelector(
    selectImportResult,
    (importResult) => importResult ? {
        totalProducts: importResult.totalProducts,
        totalVariants: importResult.totalVariants,
        errorCount: importResult.errorCount,
        errorRowCount: importResult.errorRowCount,
        hasErrorReport: importResult.hasErrorReport,
        totalImported: importResult.totalImported || 0
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

// Import progress selectors with full data transformation
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

// ZIP info selectors with complete data structure
export const selectZipContents = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo ? {
        hasExcelFile: zipInfo.hasExcelFile,
        hasImagesFolder: zipInfo.hasImagesFolder,
        imageCount: zipInfo.imageCount,
        excelFileName: zipInfo.excelFileName,
        totalSize: zipInfo.totalSize,
        formattedSize: zipInfo.formattedSize || '',
        skuFolders: zipInfo.skuFolders || [],
        skuList: zipInfo.skuList || [],
        skusWithoutMainImage: zipInfo.skusWithoutMainImage || []
    } : null
);

export const selectZipSkuFolders = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo?.skuFolders || []
);

export const selectZipSkuList = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo?.skuList || []
);

export const selectSkusWithoutMainImage = createSelector(
    selectZipInfo,
    (zipInfo) => zipInfo?.skusWithoutMainImage || []
);

// Template selectors
export const selectTemplateFeatures = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo?.supportedFeatures || []
);

export const selectTemplateVersion = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo?.version || ''
);

export const selectTemplateLastUpdated = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo?.lastUpdated || ''
);

export const selectTemplateDetails = createSelector(
    selectTemplateInfo,
    (templateInfo) => templateInfo ? {
        version: templateInfo.version || '',
        lastUpdated: templateInfo.lastUpdated || '',
        includesCategories: templateInfo.includesCategories || false,
        includesBrands: templateInfo.includesBrands || false,
        includesVariants: templateInfo.includesVariants || false
    } : null
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
    (importResult) => importResult?.errorReportUrl || ''
);

export const selectCanDownloadErrorReport = createSelector(
    [selectHasImportErrors, selectErrorReportUrl],
    (hasErrors, url) => hasErrors && !!url
);

export const selectBulkOperationSuccess = createSelector(
    selectBulkOperationResult,
    (result) => result?.success || false
);

export const selectBulkOperationStats = createSelector(
    selectBulkOperationResult,
    (result) => result ? {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        failureCount: result.failureCount,
        processingTimeMs: result.processingTimeMs || 0
    } : null
);

export const selectBulkOperationWarnings = createSelector(
    selectBulkOperationResult,
    (result) => result?.warnings || []
);

export const selectBulkOperationErrors = createSelector(
    selectBulkOperationResult,
    (result) => result?.errors || []
);

// SKU Preview selectors
export const selectSkuGenerationDetails = createSelector(
    selectSkuPreview,
    (skuPreview) => skuPreview ? {
        generatedSku: skuPreview.generatedSku,
        productCode: skuPreview.productCode,
        sizeCode: skuPreview.sizeCode,
        colorCode: skuPreview.colorCode,
        folderPath: skuPreview.folderPath || ''
    } : null
);

// Bulk SKU Preview selectors
export const selectBulkSkuGenerationDetails = createSelector(
    selectBulkSkuPreview,
    (bulkSkuPreview) => bulkSkuPreview ? {
        product: bulkSkuPreview.product,
        totalCount: bulkSkuPreview.totalCount
    } : null
);

export const selectBulkSkuList = createSelector(
    selectBulkSkuPreview,
    (bulkSkuPreview) => bulkSkuPreview?.skus || []
);

export const selectBulkSkuPaths = createSelector(
    selectBulkSkuPreview,
    (bulkSkuPreview) => bulkSkuPreview?.skus.map(sku => sku.folderPath) || []
);

export const selectBulkSkusBySize = createSelector(
    selectBulkSkuPreview,
    (bulkSkuPreview) => {
        if (!bulkSkuPreview || !bulkSkuPreview.skus || bulkSkuPreview.skus.length === 0) {
            return {};
        }

        return bulkSkuPreview.skus.reduce((acc, sku) => {
            if (!acc[sku.size]) {
                acc[sku.size] = [];
            }
            acc[sku.size].push(sku);
            return acc;
        }, {} as Record<string, typeof bulkSkuPreview.skus>);
    }
);

export const selectBulkSkusByColor = createSelector(
    selectBulkSkuPreview,
    (bulkSkuPreview) => {
        if (!bulkSkuPreview || !bulkSkuPreview.skus || bulkSkuPreview.skus.length === 0) {
            return {};
        }

        return bulkSkuPreview.skus.reduce((acc, sku) => {
            if (!acc[sku.color]) {
                acc[sku.color] = [];
            }
            acc[sku.color].push(sku);
            return acc;
        }, {} as Record<string, typeof bulkSkuPreview.skus>);
    }
);

// Template download status selectors (for the new download operations)
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