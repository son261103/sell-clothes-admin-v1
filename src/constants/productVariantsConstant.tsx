export const PRODUCT_VARIANT_ENDPOINTS = {
    // Base paths
    VIEW: (id: number) => `/product-variants/view/${id}`,
    CREATE: '/product-variants/create',
    EDIT: (id: number) => `/product-variants/edit/${id}`,
    DELETE: (id: number) => `/product-variants/delete/${id}`,

    // Hierarchy and product-specific endpoints
    GET_HIERARCHY: (productId: number) => `/product-variants/hierarchy/${productId}`,
    GET_BY_PRODUCT: (productId: number) => `/product-variants/product/${productId}`,
    GET_ACTIVE_BY_PRODUCT: (productId: number) => `/product-variants/product/${productId}/active`,

    // SKU related endpoints
    GET_BY_SKU: (sku: string) => `/product-variants/sku/${sku}`,

    // Stock management
    UPDATE_STOCK: (id: number) => `/product-variants/${id}/stock`,
    GET_LOW_STOCK: '/product-variants/low-stock',
    GET_OUT_OF_STOCK: '/product-variants/out-of-stock',

    // Status management
    TOGGLE_STATUS: (id: number) => `/product-variants/status/${id}`,

    // Bulk operations
    BULK_CREATE: '/product-variants/bulk-create',

    // Filtering and availability
    GET_FILTERED: '/product-variants/filter',
    CHECK_AVAILABILITY: '/product-variants/check-availability',

    // Product-specific attributes
    GET_AVAILABLE_SIZES: (productId: number) => `/product-variants/product/${productId}/sizes`,
    GET_AVAILABLE_COLORS: (productId: number) => `/product-variants/product/${productId}/colors`,
} as const;