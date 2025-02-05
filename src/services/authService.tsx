import apiConfig from '../config/apiConfig';
import {AUTH_ENDPOINTS} from '../constants/authConstant';
import type {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    OtpVerificationRequest,
    SendOtpRequest,
    TokenResponse,
    RegisterResponse,
    ErrorResponse
} from '../types';
import {AxiosError} from 'axios';

class AuthService {
    private static handleError(err: unknown): ErrorResponse {
        const error = err as AxiosError<ApiResponse<void>>;
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'An error occurred',
            errorCode: error.response?.data?.errorCode
        };
    }

    async login(data: LoginRequest): Promise<TokenResponse> {
        try {
            console.log('AuthService: Sending login request', { ...data, password: '[REDACTED]' });

            const response = await apiConfig.post<TokenResponse>(
                AUTH_ENDPOINTS.LOGIN,
                data
            );

            console.log('AuthService: Received raw response:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });

            if (!response?.data?.accessToken) {
                throw new Error('Invalid response: Missing access token');
            }

            console.log('AuthService: Parsed response data:', {
                accessToken: '[EXISTS]',
                tokenType: response.data.tokenType
            });

            return response.data;

        } catch (err) {
            console.error('AuthService: Error during login:', err);
            this.clearLocalStorage();
            throw AuthService.handleError(err);
        }
    }

    async register(data: RegisterRequest, otp?: string): Promise<ApiResponse<RegisterResponse>> {
        try {
            const response = await apiConfig.post<ApiResponse<RegisterResponse>>(
                AUTH_ENDPOINTS.REGISTER,
                data,
                {
                    params: otp ? {otp} : undefined
                }
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async sendOtp(data: SendOtpRequest): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.post<ApiResponse<void>>(
                AUTH_ENDPOINTS.SEND_OTP,
                null,
                {params: data}
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async verifyOtp(data: OtpVerificationRequest): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.post<ApiResponse<boolean>>(
                AUTH_ENDPOINTS.VERIFY_OTP,
                null,
                {params: data}
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async resendOtp(data: SendOtpRequest): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.post<ApiResponse<void>>(
                AUTH_ENDPOINTS.RESEND_OTP,
                null,
                {params: data}
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.post<ApiResponse<void>>(
                AUTH_ENDPOINTS.FORGOT_PASSWORD,
                data
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.post<ApiResponse<void>>(
                AUTH_ENDPOINTS.RESET_PASSWORD,
                data
            );
            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<TokenResponse>> {
        try {
            const response = await apiConfig.post<ApiResponse<TokenResponse>>(
                AUTH_ENDPOINTS.REFRESH_TOKEN,
                data
            );

            if (response.data.data) {
                const {accessToken} = response.data.data;
                // Lưu token mới vào sessionStorage
                sessionStorage.setItem('accessToken', accessToken);
            }

            return response.data;
        } catch (err) {
            throw AuthService.handleError(err);
        }
    }

    private clearLocalStorage(): void {
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('user');
    }

    async logout(): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.post<ApiResponse<void>>(
                AUTH_ENDPOINTS.LOGOUT
            );

            this.clearLocalStorage();
            return response.data;
        } catch (err) {
            this.clearLocalStorage();
            throw AuthService.handleError(err);
        }
    }
}

export default new AuthService();