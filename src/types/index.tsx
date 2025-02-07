// auth
export * from './auth/authRequest';
export * from './auth/authResponse';

// user
export * from './user/userRequest';
export * from './user/userResponse';

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

