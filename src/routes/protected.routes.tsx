import React, { useEffect, useCallback } from 'react';
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

export const ProtectedRoute = ({
                                   children,
                                   requiredRoles = [],
                                   requiredPermissions = [],
                                   forbiddenRoles = []
                               }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

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

                if (!hasPermission) {
                    if (mounted) {
                        navigate(decoded.status === 'BANNED' ?
                                '/account-banned' : '/forbidden',
                            { replace: true }
                        );
                    }
                    return;
                }

                if (mounted) {
                    setIsAuthorized(true);
                }
            } catch {
                if (mounted) {
                    navigate('/auth/login', { replace: true });
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        checkAuthorization();

        return () => {
            mounted = false;
        };
    }, [navigate, location, checkPermissions]);

    if (isLoading) return null;
    return isAuthorized ? <>{children}</> : null;
};