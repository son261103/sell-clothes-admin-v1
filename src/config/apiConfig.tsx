import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AUTH_ENDPOINTS } from '../constants/authConstant';
import type { TokenResponse } from '../types/auth/authResponse';
import type { ApiResponse } from '../types';

const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_VERSION: '/api/v1',
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
} as const;

interface CustomAxiosError extends AxiosError {
    config: InternalAxiosRequestConfig & { _retry?: boolean };
}

const apiConfig = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

apiConfig.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiConfig.interceptors.response.use(
    (response) => response,
    async (error: CustomAxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const tokenRefreshInstance = axios.create({
                    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
                    timeout: API_CONFIG.TIMEOUT,
                    headers: API_CONFIG.HEADERS,
                });

                const response = await tokenRefreshInstance.post<ApiResponse<TokenResponse>>(
                    AUTH_ENDPOINTS.REFRESH_TOKEN,
                    { refreshToken }
                );

                if (response.data.data) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return apiConfig(originalRequest);
                }

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                throw new Error('Failed to refresh token');
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default apiConfig;