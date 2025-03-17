import { ProductResponse, ProductVariantResponse } from "@/types";

/**
 * Types for the Product Separate Excel service
 * Provides interfaces for separate product and variant import/export operations
 */

// =====================================================================
// COMMON TYPES
// =====================================================================

/**
 * Error Report Details
 */
export interface SeparateExcelErrorDetail {
    sheet: string;
    row: number;
    column?: string;
    message: string;
}

export interface SeparateExcelErrorReport {
    totalErrors: number;
    errorRowCount: number;
    errors: SeparateExcelErrorDetail[];
    generatedAt: string;
}

/**
 * Import Options
 */
export interface SeparateExcelImportOptions {
    validateOnly?: boolean;
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    importImages?: boolean;
    generateSlugs?: boolean;
    generateSkus?: boolean;
}

/**
 * Import Status
 */
export interface SeparateExcelImportProgressRequest {
    jobId?: string;
}

export interface SeparateExcelImportProgressResponse {
    jobId: string;
    inProgress: boolean;
    totalItems: number;
    processedItems: number;
    percentComplete: number;
    startTime?: string;
    estimatedEndTime?: string;
    currentStatus: string;
    errors: string[];
    message?: string;
}

// =====================================================================
// PRODUCT TYPES
// =====================================================================

/**
 * Product Import
 */
export interface ProductSeparateExcelImportRequest {
    file: File; // Will be converted to FormData
    options?: SeparateExcelImportOptions;
}

export interface ProductSeparateExcelImportResponse {
    success: boolean;
    message: string;
    totalImported: number;
    errorCount?: number;
    errorRowCount?: number;
    hasErrorReport?: boolean;
    errorReportUrl?: string;
    productIds?: number[];
    importedProducts?: ProductResponse[];
}

/**
 * Product Export
 */
export interface ProductSeparateExcelExportRequest {
    productIds: number[];
    includeInactive?: boolean;
    fileFormat?: 'xlsx' | 'csv';
}

export interface ProductSeparateExcelExportResponse {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    productCount: number;
    exportedAt: string;
}

// =====================================================================
// VARIANT TYPES
// =====================================================================

/**
 * Variant Import
 */
export interface VariantSeparateExcelImportRequest {
    productId: number;
    file: File; // Will be converted to FormData
    options?: SeparateExcelImportOptions;
}

export interface VariantSeparateExcelImportResponse {
    success: boolean;
    message: string;
    totalImported: number;
    errorCount?: number;
    errorRowCount?: number;
    hasErrorReport?: boolean;
    errorReportUrl?: string;
    skuList?: string[];
    importedVariants?: ProductVariantResponse[];
}

/**
 * Variant Export
 */
export interface VariantSeparateExcelExportRequest {
    productId: number;
    includeInactive?: boolean;
    fileFormat?: 'xlsx' | 'csv';
}

export interface VariantSeparateExcelExportResponse {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    variantCount: number;
    exportedAt: string;
}

/**
 * SKU Information
 */
export interface SkuInfo {
    sku: string;
    size: string;
    color: string;
    hasMainImage?: boolean;
    imageNames?: string[];
    folderPath?: string;
}