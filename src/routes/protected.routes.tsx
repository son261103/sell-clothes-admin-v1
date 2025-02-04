import React, { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { initializeSession } from '../config/apiConfig';

interface DecodedToken {
    roles: string[];
    permissions: string[];
    status: string;
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    forbiddenRoles?: string[];
}

const authStateCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export const ProtectedRoute = ({
                                   children,
                                   requiredRoles = [],
                                   requiredPermissions = [],
                                   forbiddenRoles = []
                               }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [authState, setAuthState] = useState<{
        isAuthorized: boolean | null;
        isLoading: boolean;
    }>({ isAuthorized: null, isLoading: true });

    const checkPermissions = useCallback((decoded: DecodedToken): boolean => {
        const userRoles = decoded.roles || [];
        const userPermissions = decoded.permissions || [];

        return !(
            decoded.status === 'BANNED' ||
            (forbiddenRoles.length > 0 &&
                forbiddenRoles.some(role => userRoles.includes(role))) ||
            (requiredRoles.length > 0 &&
                !requiredRoles.some(role => userRoles.includes(role))) ||
            (requiredPermissions.length > 0 &&
                !requiredPermissions.some(permission =>
                    userPermissions.includes(permission)))
        );
    }, [forbiddenRoles, requiredRoles, requiredPermissions]);

    useEffect(() => {
        let mounted = true;

        const checkAuthorization = async () => {
            const cacheKey = `${location.pathname}-${JSON.stringify({
                requiredRoles,
                requiredPermissions,
                forbiddenRoles
            })}`;

            // Check cache
            const cachedAuth = authStateCache.get(cacheKey);
            if (cachedAuth && Date.now() - cachedAuth.timestamp < CACHE_DURATION) {
                if (mounted) {
                    setAuthState({
                        isAuthorized: cachedAuth.isValid,
                        isLoading: false
                    });
                }
                return;
            }

            try {
                const isSessionValid = await initializeSession();

                if (!isSessionValid) {
                    if (mounted) {
                        sessionStorage.setItem('redirectPath', location.pathname);
                        navigate('/auth/login', { replace: true });
                    }
                    return;
                }

                const token = sessionStorage.getItem('accessToken');
                if (!token) {
                    if (mounted) {
                        sessionStorage.setItem('redirectPath', location.pathname);
                        navigate('/auth/login', { replace: true });
                    }
                    return;
                }

                const decoded = jwtDecode<DecodedToken>(token);
                const hasPermission = checkPermissions(decoded);

                // Cache the result
                authStateCache.set(cacheKey, {
                    isValid: hasPermission,
                    timestamp: Date.now()
                });

                if (!hasPermission) {
                    if (mounted) {
                        navigate(
                            decoded.status === 'BANNED' ?
                                '/account-banned' : '/forbidden',
                            { replace: true }
                        );
                    }
                    return;
                }

                if (mounted) {
                    setAuthState({
                        isAuthorized: true,
                        isLoading: false
                    });
                }
            } catch {
                if (mounted) {
                    navigate('/auth/login', { replace: true });
                }
            }
        };

        checkAuthorization();

        return () => {
            mounted = false;
        };
    }, [navigate, location, checkPermissions]);

    if (authState.isLoading) return null;
    return authState.isAuthorized ? <>{children}</> : null;
};