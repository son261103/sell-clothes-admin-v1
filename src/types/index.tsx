// auth
export * from './auth/authRequest';
export * from './auth/authResponse';

// user
export * from './user/userRequest';
export * from './user/userResponse';

// permission
export * from './permission/permissionRequest';
export * from './permission/permissionResponse';

// role
export * from './role/roleRequest';
export * from './role/roleResponse';

// category
export * from './category/categoryRequest';
export * from './category/categoryResponse';

// brand
export * from './brand/BrandRequest';
export * from './brand/BrandResponse';

// product
export * from './product/productRequest';
export * from './product/productResponse';

// product image
export * from './product/productImageRequest';
export * from './product/productImageResponse';

// product variant
export * from './product/productVariantRequest';
export * from './product/productVariantResponse';

// order
export * from './order/order.types';


// user address
export * from './userAddress/user.address.types'

// payment
export * from './payment/payment.types'

// order item
export * from './orderItem/order.item.types'

// coupon
export * from './orderCoupon/coupon.types'


// phân trang
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface PageRequest {
    page?: number;
    size?: number;
    sort?: string;
}

