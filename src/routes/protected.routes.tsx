import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/authHooks';
import {useEffect} from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    forbiddenRoles?: string[];
}

export const ProtectedRoute = ({
                                   children,
                                   requiredRoles = [],
                                   requiredPermissions = []
                               }: ProtectedRouteProps) => {
    const {isAuthenticated, user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            sessionStorage.setItem('redirectPath', location.pathname);
            navigate('/auth/login', {replace: true});
            return;
        }

        const hasRequiredRole = requiredRoles.length === 0 ||
            requiredRoles.some(role => user?.roles.includes(role));

        const hasRequiredPermission = requiredPermissions.length === 0 ||
            requiredPermissions.some(permission => user?.permissions.includes(permission));

        if (requiredRoles.length > 0 && !hasRequiredRole && !hasRequiredPermission) {
            navigate('/forbidden', {replace: true});
        }
    }, [isAuthenticated, user, requiredRoles, requiredPermissions, navigate, location]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
};