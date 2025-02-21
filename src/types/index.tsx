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

