export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    userId?: number;
    username?: string;
    email?: string;
    fullName?: string;
    roles?: string[];
    permissions?: string[];
    errorCode?: string;
}
export interface ErrorResponse {
    message: string;
    success: boolean;
    errorCode?: string;
}

export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    expiresIn: number;
    userId: number;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
}