/**
 * Endpoint constants for the Product Separate Excel service
 * Provides paths for separate product and variant import/export operations
 */
export const PRODUCT_SEPARATE_EXCEL_ENDPOINTS = {
    // Base URL
    BASE: '/products/separate',

    // Product endpoints
    PRODUCT: {
        // Template endpoints
        TEMPLATE: '/products/separate/product/template',
        TEMPLATE_PACKAGE: '/products/separate/product/template-package',

        // Import/Export endpoints
        IMPORT: '/products/separate/product/import',
        IMPORT_ZIP: '/products/separate/product/import-zip',
        EXPORT: '/products/separate/product/export',
    },

    // Variant endpoints
    VARIANT: {
        // Template endpoints
        TEMPLATE: (productId: number) => `/products/separate/variant/template/${productId}`,
        TEMPLATE_PACKAGE: (productId: number) => `/products/separate/variant/template-package/${productId}`,

        // Import/Export endpoints
        IMPORT: (productId: number) => `/products/separate/variant/import/${productId}`,
        IMPORT_ZIP: (productId: number) => `/products/separate/variant/import-zip/${productId}`,
        EXPORT: (productId: number) => `/products/separate/variant/export/${productId}`,
    },

    // Shared endpoints
    ERROR_REPORT: (reportId: string) => `/products/separate/error-report/${reportId}`,
    IMPORT_STATUS: '/products/separate/import/status',
};