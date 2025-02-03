import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authHooks';
import { jwtDecode } from 'jwt-decode';

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
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

    useEffect(() => {
        const checkAuthorization = () => {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                sessionStorage.setItem('redirectPath', location.pathname);
                navigate('/auth/login', { replace: true });
                return;
            }

            try {
                const decoded = jwtDecode<DecodedToken>(token);
                const userRoles = decoded.roles || [];
                const userPermissions = decoded.permissions || [];

                // Chỉ check BANNED status và role/permission
                // Không xử lý refresh token ở đây nữa vì đã có trong apiConfig
                if (decoded.status === 'BANNED') {
                    navigate('/account-banned', { replace: true });
                    return;
                }

                // Check forbidden roles first
                if (forbiddenRoles.length > 0 && forbiddenRoles.some(role => userRoles.includes(role))) {
                    navigate('/forbidden', { replace: true });
                    return;
                }

                // Check required roles and permissions
                const hasRequiredRole = requiredRoles.length === 0 ||
                    requiredRoles.some(role => userRoles.includes(role));
                const hasRequiredPermission = requiredPermissions.length === 0 ||
                    requiredPermissions.some(permission => userPermissions.includes(permission));

                if (!hasRequiredRole || !hasRequiredPermission) {
                    navigate('/forbidden', { replace: true });
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                // Chỉ handle invalid token format
                // Không xử lý remove token vì đã có trong apiConfig
                console.error('Token validation error:', error);
                navigate('/auth/login', { replace: true });
            }
        };

        checkAuthorization();
    }, [isAuthenticated, requiredRoles, requiredPermissions, forbiddenRoles, navigate, location]);

    if (isAuthorized === null) return null;
    return isAuthorized ? <>{children}</> : null;
};