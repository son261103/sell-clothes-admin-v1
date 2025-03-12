

// Excel Import Request/Response
import {ProductResponse, ProductVariantResponse} from "@/types";

export interface ProductExcelImportRequest {
    file: File; // Will be converted to FormData
    options?: ProductExcelImportOptions;
}

export interface ProductExcelImportOptions {
    validateOnly: boolean;
    skipDuplicates: boolean;
    updateExisting: boolean;
    importImages: boolean;
    generateSlugs: boolean;
    generateSkus: boolean;
}

export interface ProductExcelImportResponse {
    success: boolean;
    message: string;
    totalProducts: number;
    totalVariants: number;
    errorCount: number;
    errorRowCount: number;
    hasErrorReport: boolean;
    errorReportUrl: string;
    importedProducts: ProductResponse[];
    importedVariants: ProductVariantResponse[];
}

// Excel Export Request/Response
export interface ProductExcelExportRequest {
    categoryId?: number;
    brandId?: number;
    categoryIds?: number[];
    brandIds?: number[];
    status?: boolean;
    includeVariants: boolean;
    includeImages: boolean;
    dateFrom?: string;
    dateTo?: string;
    fileFormat: 'xlsx' | 'csv';
}

export interface ProductExcelExportResponse {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    productCount: number;
    variantCount: number;
    exportedAt: string;
}

// Error Report
export interface ProductExcelErrorDetail {
    sheet: string;
    row: number;
    column: string;
    message: string;
}

export interface ProductExcelErrorReport {
    totalErrors: number;
    errorRowCount: number;
    errors: ProductExcelErrorDetail[];
    generatedAt: string;
}

// Import Progress
export interface ProductExcelImportProgressRequest {
    jobId: string;
}

export interface ProductExcelImportProgressResponse {
    jobId: string;
    inProgress: boolean;
    totalItems: number;
    processedItems: number;
    percentComplete: number;
    startTime: string;
    estimatedEndTime: string;
    currentStatus: string;
    errors: string[];
}

// ZIP File Information
export interface ProductExcelZipInfoRequest {
    file: File; // Will be converted to FormData
}

export interface ProductExcelZipInfoResponse {
    hasExcelFile: boolean;
    hasImagesFolder: boolean;
    imageCount: number;
    excelFileName: string;
    totalSize: number;
    skuFolders: SkuFolderInfo[];
}

export interface SkuFolderInfo {
    sku: string;
    hasMainImage: boolean;
    secondaryImageCount: number;
    imageNames: string[];
}

// SKU Generation
export interface SkuGenerationPreviewRequest {
    productName: string;
    size: string;
    color: string;
}

export interface SkuGenerationPreviewResponse {
    generatedSku: string;
    productCode: string;
    sizeCode: string;
    colorCode: string;
}

// Template Info Response
export interface ProductExcelTemplateResponse {
    templateUrl: string;
    version: string;
    lastUpdated: string;
    supportedFeatures: string[];
    includesCategories: boolean;
    includesBrands: boolean;
    includesVariants: boolean;
}

// Bulk Processing Results
export interface ProductExcelBulkOperationResponse {
    success: boolean;
    message: string;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    processingTimeMs: number;
    warnings: string[];
    errors: string[];
}