import {OrderStatus} from "@/types";


export const ORDER_ITEM_ENDPOINTS = {
    // Basic operations
    LIST: '/api/orders/list',
    LIST_ADMIN: '/api/orders/admin/list',
    VIEW: (id: number) => `/api/orders/view/${id}`,
    VIEW_ADMIN: (id: number) => `/api/orders/admin/${id}`,
    CREATE: '/api/orders/create',
    DELETE: (id: number) => `/api/orders/admin/${id}`,

    // User specific operations
    USER_ORDERS: (userId: number) => `/api/orders/admin/user/${userId}`,

    // Order Item operations
    GET_ORDER_ITEMS: (orderId: number) => `/api/orders/${orderId}/items`,
    GET_ORDER_ITEM: (orderId: number, itemId: number) => `/api/orders/${orderId}/items/${itemId}`,
    ADD_ITEM: (orderId: number) => `/api/orders/${orderId}/items/add`,
    REMOVE_ITEM: (orderId: number, itemId: number) => `/api/orders/${orderId}/items/${itemId}`,
    UPDATE_ITEM: (orderId: number, itemId: number) => `/api/orders/${orderId}/items/${itemId}`,

    // Status operations
    BY_STATUS: (status: OrderStatus) => `/api/orders/status/${status}`,
    BY_STATUS_ADMIN: (status: OrderStatus) => `/api/orders/admin/status/${status}`,
    UPDATE_STATUS: (id: number) => `/api/orders/admin/${id}/status`,
    CONFIRM_ORDER: (id: number) => `/api/orders/${id}/confirm`,
    CANCEL_ORDER: (id: number) => `/api/orders/${id}/cancel`,

    // Shipping related
    UPDATE_SHIPPING: (id: number) => `/api/orders/admin/${id}/shipping`,
    BY_SHIPPING_METHOD: (methodId: number) => `/api/orders/admin/shipping-method/${methodId}`,

    // Searching and filtering
    SEARCH: '/api/orders/search',
    SEARCH_ADMIN: '/api/orders/admin/search',
    FILTER: '/api/orders/filter',
    FILTER_ADMIN: '/api/orders/admin/filter',

    // Statistics
    STATISTICS: '/api/orders/admin/statistics',

    // Order Item Statistics
    BESTSELLING_VARIANTS: '/api/orders/admin/items/bestselling-variants',
    BESTSELLING_PRODUCTS: '/api/orders/admin/items/bestselling-products',
    PRODUCT_SALES: (productId: number) => `/api/orders/admin/items/product/${productId}/sales`
} as const;