export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
    roles?: string[];
}

export interface ForgotPasswordRequest {
    loginId: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    confirmPassword: string;
    otp: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface OtpVerificationRequest {
    email: string;
    otp: string;
}

export interface SendOtpRequest {
    email: string;
}