export const PAYMENT_ENDPOINTS = {
    // Payment operations
    LIST: '/payment/admin',
    VIEW: (id: number) => `/payment/admin/${id}`,
    CREATE: '/payment/admin/create',
    UPDATE: (id: number) => `/payment/admin/${id}`,
    DELETE: (id: number) => `/payment/admin/${id}/delete`,

    // Payment by order
    ORDER_PAYMENT: (orderId: number) => `/payment/admin/order/${orderId}`,
    CREATE_FOR_ORDER: (orderId: number) => `/payment/admin/order/${orderId}/create`,

    // Payment status operations - CHỈNH SỬA: Loại bỏ endpoint confirm không tồn tại
    // CONFIRM: (id: number) => `/payment/admin/${id}/confirm`, // Endpoint này không tồn tại!
    CANCEL: (id: number) => `/payment/admin/${id}/cancel`,
    REFUND: (id: number) => `/payment/admin/${id}/refund`,

    // Transaction verification
    VERIFY: (transactionCode: string) => `/payment/admin/transaction/${transactionCode}`,
    CHECK_STATUS: (transactionId: number) => `/payment/admin/status/${transactionId}`,

    // Payment histories
    HISTORIES: (id: number) => `/payment/admin/${id}/histories`,

    // COD Specific operations
    CONFIRM_COD: (id: number) => `/payment/admin/${id}/confirm-cod`,
    REJECT_COD: (id: number) => `/payment/admin/${id}/reject-cod`,
    REATTEMPT_COD: (id: number) => `/payment/admin/${id}/reattempt-cod`,

    // OTP operations
    SEND_OTP: (orderId: number) => `/payment/admin/order/${orderId}/send-otp`,
    CONFIRM_OTP: (orderId: number) => `/payment/admin/order/${orderId}/confirm-delivery`,

    // Payment Methods
    METHODS: {
        LIST: '/payment-methods/list',
        VIEW: (id: number) => `/payment-methods/view/${id}`,
        CREATE: '/payment-methods/create',
        UPDATE: (id: number) => `/payment-methods/edit/${id}`,
        DELETE: (id: number) => `/payment-methods/delete/${id}`,
        GET_ACTIVE: '/payment-methods/active',
        BY_TYPE: (type: string) => `/payment-methods/type/${type}`
    },

    // Admin specific operations
    ADMIN: {
        LIST: '/payment/admin',
        VIEW: (id: number) => `/payment/admin/${id}`,
        UPDATE: (id: number) => `/payment/admin/${id}/status`,
        UPDATE_STATUS: (id: number) => `/payment/admin/${id}/status`,
        COMPLETE: (orderId: number) => `/payment/admin/order/${orderId}/complete`,
        CANCEL: (id: number) => `/payment/admin/${id}/cancel`,
        REFUND: (id: number) => `/payment/admin/${id}/refund`,
        STATS: '/payment/admin/stats',
        EXPORT: '/payment/admin/export',
        BY_DATE_RANGE: '/payment/admin/date-range',
        BY_STATUS: (status: string) => `/payment/admin/status/${status}`,
        BY_METHOD: (methodId: number) => `/payment/admin/method/${methodId}`,

        // Payment method management
        METHODS: {
            LIST: '/payment-methods/admin/list',
            VIEW: (id: number) => `/payment-methods/admin/${id}`,
            CREATE: '/payment-methods/admin/create',
            UPDATE: (id: number) => `/payment-methods/admin/${id}`,
            DELETE: (id: number) => `/payment-methods/admin/${id}`,
            TOGGLE_STATUS: (id: number) => `/payment-methods/admin/${id}/toggle-status`
        }
    },

    // Filter and search
    FILTER: '/payment/admin/filter',
    SEARCH: '/payment/admin/search',

    // Payment gateway callback URLs
    GATEWAY: {
        RETURN: '/payment/admin/confirm',
        NOTIFY: '/payment/gateway/notify',
        CANCEL: '/payment/gateway/cancel'
    }
} as const;