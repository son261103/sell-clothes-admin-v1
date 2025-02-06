import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AUTH_ENDPOINTS } from '../constants/authConstant';
import type { TokenResponse, ApiResponse } from '../types';
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
    userId: string | number;
    email: string;
    fullName: string;
}

interface UserInfo {
    userId: string | number;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    status: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let lastCheckTime = 0;
const CHECK_INTERVAL = 1000; // 1 giây

const apiConfig = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
});

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return (decoded.exp - 30) < Date.now() / 1000;
    } catch {
        return true;
    }
};

export const getUserFromToken = (token: string): UserInfo | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return {
            userId: decoded.userId,
            email: decoded.email,
            fullName: decoded.fullName,
            roles: decoded.roles,
            permissions: decoded.permissions,
            status: decoded.status
        };
    } catch {
        return null;
    }
};

export const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
    }
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

export const refreshAccessToken = async (): Promise<string | null> => {
    if (isRefreshing) {
        return new Promise((resolve) => {
            addRefreshSubscriber(token => resolve(token));
        });
    }

    const currentTime = Date.now();
    if (currentTime - lastCheckTime < CHECK_INTERVAL) {
        const currentToken = sessionStorage.getItem('accessToken');
        return currentToken;
    }

    lastCheckTime = currentTime;
    isRefreshing = true;

    try {
        const response = await axios.post<ApiResponse<TokenResponse>>(
            `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
            {},
            {
                withCredentials: true,
                headers: API_CONFIG.HEADERS,
            }
        );

        if (!response.data?.accessToken) {
            throw new Error('Invalid token response');
        }

        const newAccessToken = response.data.accessToken;
        sessionStorage.setItem('accessToken', newAccessToken);

        const userInfo = getUserFromToken(newAccessToken);
        if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo));
        }

        onRefreshed(newAccessToken);
        return newAccessToken;

    } catch (err) {
        const error = err as AxiosError;
        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
            handleLogout();
        }
        throw error;
    } finally {
        isRefreshing = false;
    }
};

export const initializeSession = async (): Promise<boolean> => {
    if (window.location.pathname === '/auth/login') return true;

    try {
        const currentAccessToken = sessionStorage.getItem('accessToken');
        if (!currentAccessToken || isTokenExpired(currentAccessToken)) {
            try {
                const newAccessToken = await refreshAccessToken();
                return !!newAccessToken;
            } catch {
                return false;
            }
        }

        const userInfo = getUserFromToken(currentAccessToken);
        if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo));
            return true;
        }
        return false;

    } catch {
        return false;
    }
};

let focusTimeout: number;
window.removeEventListener('focus', () => {});
window.addEventListener('focus', () => {
    window.clearTimeout(focusTimeout);
    focusTimeout = window.setTimeout(() => {
        const currentToken = sessionStorage.getItem('accessToken');
        if (currentToken && isTokenExpired(currentToken)) {
            initializeSession();
        }
    }, 1000);
});

apiConfig.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const isAuthEndpoint = config.url?.includes('/auth/login') ||
            config.url?.includes('/auth/refresh-token');

        if (isAuthEndpoint) return config;

        try {
            let accessToken = sessionStorage.getItem('accessToken');

            if (!accessToken || isTokenExpired(accessToken)) {
                accessToken = await refreshAccessToken();
                if (!accessToken) {
                    throw new Error('No valid access token');
                }
            }

            // Clean token and add Bearer prefix
            accessToken = accessToken.trim();
            config.headers.Authorization = `Bearer ${accessToken}`;
            return config;
        } catch (err) {
            return Promise.reject(err);
        }
    },
    (err) => Promise.reject(err)
);

apiConfig.interceptors.response.use(
    (response) => {
        if (response.config.url?.includes('/auth/login') &&
            response.data?.data?.accessToken) {
            const { accessToken } = response.data.data;
            sessionStorage.setItem('accessToken', accessToken);

            const userInfo = getUserFromToken(accessToken);
            if (userInfo) {
                localStorage.setItem('user', JSON.stringify(userInfo));
            }
        }
        return response;
    },
    async (error: CustomAxiosError) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    throw new Error('Token refresh failed');
                }

                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiConfig(error.config);
            } catch (refreshError) {
                handleLogout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiConfig;