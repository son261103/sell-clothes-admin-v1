export const PRODUCT_IMAGE_ENDPOINTS = {
    UPLOAD: (productId: number) => `/products/images/upload/${productId}`,
    UPDATE_FILE: (imageId: number) => `/products/images/update-file/${imageId}`,
    UPDATE: (imageId: number) => `/products/images/update/${imageId}`,
    SET_PRIMARY: (imageId: number) => `/products/images/primary/${imageId}`,
    REORDER: (productId: number) => `/products/images/reorder/${productId}`,
    DELETE: (imageId: number) => `/products/images/${imageId}`,
    LIST: (productId: number) => `/products/images/list/${productId}`,
    GET_PRIMARY: (productId: number) => `/products/images/primary/${productId}`,
    GET_HIERARCHY: (productId: number) => `/products/images/hierarchy/${productId}`
} as const;