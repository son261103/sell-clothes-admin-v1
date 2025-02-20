export const CATEGORY_ENDPOINTS = {
    // Parent Category endpoints
    PARENT: {
        LIST: '/categories/parent/list',
        LIST_ACTIVE: '/categories/parent/list/active',
        VIEW: (id: number) => `/categories/parent/view/${id}`,
        CREATE: '/categories/parent/create',
        EDIT: (id: number) => `/categories/parent/edit/${id}`,
        DELETE: (id: number) => `/categories/parent/delete/${id}`,
        TOGGLE_STATUS: (id: number) => `/categories/parent/toggle-status/${id}`,
        GET_HIERARCHY: (id: number) => `/categories/parent/${id}/hierarchy`,
        GET_BY_NAME: (name: string) => `/categories/parent/by-name/${name}`,
        GET_BY_SLUG: (slug: string) => `/categories/parent/by-slug/${slug}`,
    },

    // Sub-Category endpoints
    SUB: {
        LIST: (parentId: number) => `/categories/sub/list/${parentId}`,
        LIST_ACTIVE: (parentId: number) => `/categories/sub/list/active/${parentId}`,
        VIEW: (id: number) => `/categories/sub/view/${id}`,
        CREATE: (parentId: number) => `/categories/sub/create/${parentId}`,
        EDIT: (id: number) => `/categories/sub/edit/${id}`,
        DELETE: (id: number) => `/categories/sub/delete/${id}`,
        TOGGLE_STATUS: (id: number) => `/categories/sub/toggle-status/${id}`,
    }
} as const;