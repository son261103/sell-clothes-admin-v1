export const ORDER_ENDPOINTS = {
    // Basic operations
    LIST: '/orders/list',
    LIST_ADMIN: '/orders/list',
    VIEW: (id: number) => `/orders/view/${id}`,
    VIEW_ADMIN: (id: number) => `/orders/${id}`,
    CREATE: '/orders/create',
    DELETE: (id: number) => `/orders/admin/${id}`,

    // User specific operations
    USER_ORDERS: (userId: number) => `/orders/user/${userId}`,
    ADD_ITEM: (orderId: number) => `/orders/${orderId}/items/add`,
    REMOVE_ITEM: (orderId: number, itemId: number) => `/orders/${orderId}/items/${itemId}`,

    // Status operations
    BY_STATUS: (status: string) => `/orders/status/${status}`,
    BY_STATUS_ADMIN: (status: string) => `/orders/status/${status}`,
    UPDATE_STATUS: (id: number) => `/orders/${id}/status`,
    CONFIRM_ORDER: (id: number) => `/orders/${id}/confirm`,
    CANCEL_ORDER: (id: number) => `/orders/${id}/cancel`,

    // Shipping related
    UPDATE_SHIPPING: (id: number) => `/orders//${id}/shipping`,
    BY_SHIPPING_METHOD: (methodId: number) => `/orders/shipping-method/${methodId}`,

    // Searching and filtering
    SEARCH: '/orders/search',
    SEARCH_ADMIN: '/orders/search',
    FILTER: '/orders/filter',
    FILTER_ADMIN: '/orders/filter',

    // Statistics
    STATISTICS: '/orders/statistics'
} as const;