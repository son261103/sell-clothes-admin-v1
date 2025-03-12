// coupon.endpoints.ts

export const COUPON_ENDPOINTS = {
    // Admin endpoints
    LIST: '/coupons',
    VIEW: (id: number) => `/coupons/${id}`,
    VIEW_BY_CODE: (code: string) => `/coupons/code/${code}`,
    CREATE: '/coupons',
    UPDATE: (id: number) => `/coupons/${id}`,
    DELETE: (id: number) => `/coupons/${id}`,
    TOGGLE: (id: number) => `/coupons/${id}/toggle`,
    VALID_COUPONS: '/coupons/valid',
    ADMIN_VALIDATE: '/coupons/validate',
    STATISTICS: '/coupons/statistics',
    PUBLIC_COUPONS: '/coupons/public',
    SEARCH: '/coupons/search',

    // Client/Public endpoints
    CLIENT_LIST: '/client/coupons',
    CLIENT_VALIDATE: '/client/coupons/validate',
    CLIENT_VIEW: (code: string) => `/client/coupons/${code}`,
    CLIENT_CHECK: (code: string) => `/client/coupons/check/${code}`,

    // User order endpoints with coupon
    VALIDATE_ORDER_COUPON: '/orders/validate-coupon',
    PREVIEW_ORDER: '/orders/preview-order',
    ORDER_COUPONS: (orderId: number) => `/orders/${orderId}/coupons`,
    UPDATE_ORDER_COUPON: (orderId: number) => `/orders/${orderId}/coupon`,

    // Shipping with coupon
    SHIPPING_ESTIMATE: '/orders/shipping-estimate',
    FREE_SHIPPING_CHECK: '/orders/free-shipping-check'
} as const;