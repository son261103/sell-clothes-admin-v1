export const BRAND_ENDPOINTS = {
    LIST: '/brands/list',
    LIST_ACTIVE: '/brands/list/active',
    VIEW: (id: number) => `/brands/view/${id}`,
    CREATE: '/brands/create',
    EDIT: (id: number) => `/brands/edit/${id}`,
    DELETE: (id: number) => `/brands/delete/${id}`,
    TOGGLE_STATUS: (id: number) => `/brands/status/${id}`,
    HIERARCHY: '/brands/hierarchy',
    SEARCH: '/brands/search',
    LOGO: {
        UPLOAD: '/brands/logo/upload',
        UPDATE: '/brands/logo/update',
        DELETE: '/brands/logo/delete'
    }
} as const;