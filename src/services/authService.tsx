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


    async login(data: LoginRequest): Promise<ApiResponse<TokenResponse>> {
        try {
            const response = await apiConfig.post<ApiResponse<TokenResponse>>(
                AUTH_ENDPOINTS.LOGIN,
                data
            );

            if (!response?.data) {
                throw new Error('Invalid response from server');
            }

            const { accessToken, tokenType } = response.data;

            // Chuyển sang dùng sessionStorage cho accessToken
            if (accessToken) {
                sessionStorage.setItem('accessToken', `${tokenType || 'Bearer'} ${accessToken}`);
            }


            return response.data;

        } catch (err) {
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