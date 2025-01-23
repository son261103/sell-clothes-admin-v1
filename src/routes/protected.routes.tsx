import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/authHooks';
import {jwtDecode} from 'jwt-decode';

// Define a type for the decoded token structure
interface DecodedToken {
    roles: string[];
    permissions: string[];
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
    const {isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            sessionStorage.setItem('redirectPath', location.pathname);
            navigate('/auth/login', {replace: true});
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const userRoles = decoded.roles || [];
            const userPermissions = decoded.permissions || [];

            // Check required roles
            const hasRequiredRole = requiredRoles.length === 0 ||
                requiredRoles.some(role => userRoles.includes(role));

            // Check required permissions
            const hasRequiredPermission = requiredPermissions.length === 0 ||
                requiredPermissions.some(permission => userPermissions.includes(permission));

            // Check forbidden roles
            const hasForbiddenRole = forbiddenRoles.some(role => userRoles.includes(role));

            if (
                (!hasRequiredRole || !hasRequiredPermission) ||
                hasForbiddenRole
            ) {
                navigate('/forbidden', {replace: true});
            }
        } catch {
            // Invalid token
            localStorage.removeItem('accessToken');
            navigate('/auth/login', {replace: true});
        }
    }, [isAuthenticated, requiredRoles, requiredPermissions, forbiddenRoles, navigate, location]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
};
