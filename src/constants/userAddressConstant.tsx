export const USER_ADDRESS_ENDPOINTS = {
    // User operations
    LIST: '/user-addresses',
    GET: (addressId: number) => `/user-addresses/${addressId}`,
    CREATE: '/user-addresses',
    UPDATE: (addressId: number) => `/user-addresses/${addressId}`,
    DELETE: (addressId: number) => `/user-addresses/${addressId}`,

    // Default address operations
    SET_DEFAULT: (addressId: number) => `/user-addresses/${addressId}/default`,
    GET_DEFAULT: '/user-addresses/default',

    // Address verification
    VALIDATE: '/user-addresses/validate',
    CHECK_EXISTS: (addressId: number) => `/user-addresses/check/${addressId}`,
    CHECK_OWNER: (addressId: number) => `/user-addresses/check/${addressId}/owner`,

    // Count addresses
    COUNT: '/user-addresses/count',

    // Admin operations
    ADMIN_GET: (addressId: number) => `/user-addresses/${addressId}`,
    ADMIN_USER_ADDRESSES: (userId: number) => `/user-addresses/user/${userId}`,
    ADMIN_CREATE: (userId: number) => `/user-addresses/user/${userId}`,
    ADMIN_UPDATE: (addressId: number) => `/user-addresses/${addressId}`,
    ADMIN_DELETE: (addressId: number) => `/user-addresses/${addressId}`
} as const;