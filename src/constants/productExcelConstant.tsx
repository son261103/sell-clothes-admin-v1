/**
 * Endpoint constants for the Product Excel service
 */
export const PRODUCT_EXCEL_ENDPOINTS = {
    // Template endpoints
    TEMPLATE: '/products/excel/template',
    FULL_TEMPLATE: '/products/excel/full-template',
    INSTRUCTIONS: '/products/excel/instructions',
    TEMPLATE_INFO: '/products/excel/template/info',

    // Import/Export endpoints
    IMPORT: '/products/excel/import',
    IMPORT_STATUS: '/products/excel/import/status',
    EXPORT: '/products/excel/export',

    // Utility endpoints
    ZIP_INFO: '/products/excel/zip/info',
    SKU_GENERATION_PREVIEW: '/products/excel/sku/preview',
    BULK_SKU_GENERATION_PREVIEW: '/products/excel/sku/bulk-preview',
    BULK_OPERATION: '/products/excel/bulk',
};