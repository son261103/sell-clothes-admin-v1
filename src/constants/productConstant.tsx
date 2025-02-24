export const PRODUCT_ENDPOINTS = {
    LIST: '/products/list',
    HIERARCHY: '/products/hierarchy',
    CREATE: '/products/create',
    EDIT: (id: number) => `/products/edit/${id}`,
    DELETE: (id: number) => `/products/delete/${id}`,
    VIEW: (id: number) => `/products/view/${id}`,
    VIEW_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    BY_CATEGORY: (categoryId: number) => `/products/category/${categoryId}`,
    BY_BRAND: (brandId: number) => `/products/brand/${brandId}`,
    FILTER: '/products/filter',
    TOGGLE_STATUS: (id: number) => `/products/status/${id}`,
    SEARCH: '/products/search',
    SALE: '/products/sale',
    LATEST: '/products/latest',
    FEATURED: '/products/featured',
    RELATED: (productId: number) => `/products/related/${productId}`
} as const;