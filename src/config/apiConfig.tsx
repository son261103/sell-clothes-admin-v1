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
const CHECK_INTERVAL = 1000;
const TOKEN_EXPIRY_BUFFER = 60; // 60 seconds buffer before actual expiry

const apiConfig = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
});

// Cache mechanism for token validation results
const tokenValidationCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export const isTokenExpired = (token: string): boolean => {
    try {
        // Check cache first
        const cachedResult = tokenValidationCache.get(token);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
            return !cachedResult.isValid;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const isExpired = (decoded.exp - TOKEN_EXPIRY_BUFFER) < Date.now() / 1000;

        // Cache the result
        tokenValidationCache.set(token, {
            isValid: !isExpired,
            timestamp: Date.now()
        });

        return isExpired;
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
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    tokenValidationCache.clear();

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
        tokenValidationCache.clear(); // Clear cache on refresh
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

// Pre-initialize session state
let cachedSessionPromise: Promise<boolean> | null = null;

export const initializeSession = async (): Promise<boolean> => {
    if (cachedSessionPromise) {
        return cachedSessionPromise;
    }

    if (window.location.pathname === '/auth/login') return true;

    cachedSessionPromise = (async () => {
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
        } finally {
            // Clear the cached promise after a delay
            setTimeout(() => {
                cachedSessionPromise = null;
            }, CHECK_INTERVAL);
        }
    })();

    return cachedSessionPromise;
};

// Optimized focus handler
let focusTimeout: number;
const focusHandler = () => {
    window.clearTimeout(focusTimeout);
    focusTimeout = window.setTimeout(() => {
        const currentToken = sessionStorage.getItem('accessToken');
        if (currentToken && isTokenExpired(currentToken)) {
            initializeSession();
        }
    }, 1000);
};

window.removeEventListener('focus', focusHandler);
window.addEventListener('focus', focusHandler);

// Request interceptor
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

            config.headers.Authorization = `Bearer ${accessToken}`;
            return config;
        } catch (err) {
            return Promise.reject(err);
        }
    },
    (err) => Promise.reject(err)
);

// Response interceptor
apiConfig.interceptors.response.use(
    (response) => {
        if (response.config.url?.includes('/auth/login') &&
            response.data?.data?.accessToken) {
            const { accessToken } = response.data.data;
            sessionStorage.setItem('accessToken', accessToken);
            tokenValidationCache.clear();

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