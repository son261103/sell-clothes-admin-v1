import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authHooks';
import { jwtDecode } from 'jwt-decode';

// Define a type for the decoded token structure
interface DecodedToken {
    roles: string[];
    permissions: string[];
    status: string; // Status field to check user's account state
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

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            // Save the current path to redirect back after login
            sessionStorage.setItem('redirectPath', location.pathname);
            navigate('/auth/login', { replace: true });
            return;
        }

        try {
            // Decode the token
            const decoded = jwtDecode<DecodedToken>(token);
            const userRoles = decoded.roles || [];
            const userPermissions = decoded.permissions || [];
            const userStatus = decoded.status;

            // Redirect if the user's account is banned
            if (userStatus === 'BANNED') {
                navigate('/account-banned', { replace: true });
                return;
            }

            // Check required roles
            const hasRequiredRole =
                requiredRoles.length === 0 ||
                requiredRoles.some(role => userRoles.includes(role));

            // Check required permissions
            const hasRequiredPermission =
                requiredPermissions.length === 0 ||
                requiredPermissions.some(permission => userPermissions.includes(permission));

            // Check forbidden roles
            const hasForbiddenRole = forbiddenRoles.some(role => userRoles.includes(role));

            // Redirect if the user lacks required roles/permissions or has forbidden roles
            if (
                (!hasRequiredRole || !hasRequiredPermission) ||
                hasForbiddenRole
            ) {
                navigate('/forbidden', { replace: true });
                return;
            }
        } catch {
            // Invalid or corrupted token
            localStorage.removeItem('accessToken');
            navigate('/auth/login', { replace: true });
        }
    }, [isAuthenticated, requiredRoles, requiredPermissions, forbiddenRoles, navigate, location]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
};
