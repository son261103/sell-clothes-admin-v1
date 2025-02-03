import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AUTH_ENDPOINTS } from '../constants/authConstant';
import type { TokenResponse } from '../types';
import type { ApiResponse } from '../types';
import { jwtDecode } from 'jwt-decode';

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

interface DecodedToken {
    roles: string[];
    permissions: string[];
    status: string;
    exp: number;
}

const apiConfig = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// Centralized logout function
const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    window.location.href = '/auth/login';
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
};

// Validate token status
const validateToken = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.status === 'BANNED') {
            window.location.href = '/account-banned';
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

apiConfig.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            // Check if token is valid and not expired before adding to headers
            if (!validateToken(token) || isTokenExpired(token)) {
                handleLogout();
                return Promise.reject(new Error('Invalid or expired token'));
            }
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

        // Handle 401 and token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken || isTokenExpired(refreshToken)) {
                    handleLogout();
                    throw new Error('No refresh token available or token expired');
                }

                const response = await axios.post<ApiResponse<TokenResponse>>(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
                    { refreshToken },
                    { headers: API_CONFIG.HEADERS }
                );

                if (response.data.data) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Validate new token before saving
                    if (!validateToken(accessToken)) {
                        throw new Error('New token is invalid');
                    }

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return apiConfig(originalRequest);
                }

                handleLogout();
                throw new Error('Failed to refresh token');
            } catch (error) {
                handleLogout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default apiConfig;