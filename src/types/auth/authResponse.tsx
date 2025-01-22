export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userId: number;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
}

export interface AuthError {
    message: string;
    field?: string;
    code?: string;
}
