import { RouteObject } from 'react-router-dom';
import { authRoutes } from './auth.routes';
import { adminRoutes, RouteObjectWithMeta } from './admin.routes';
import { Navigate } from 'react-router-dom';
import NotFound from "../pages/NotFound/NotFound.tsx";
import { ProtectedRoute } from './protected.routes';

// Create protected admin routes by wrapping each route element with ProtectedRoute
const protectedAdminRoutes: RouteObjectWithMeta = {
    path: '/admin',
    element: (
        <ProtectedRoute
            requiredPermissions={adminRoutes.meta?.requiredPermissions}
            forbiddenRoles={['ROLE_CUSTOMER']}
        >
            {adminRoutes.element}
        </ProtectedRoute>
    ),
    children: adminRoutes.children?.map((route) => ({
        ...route,
        element: (
            <ProtectedRoute
                requiredPermissions={route.meta?.requiredPermissions}
                forbiddenRoles={['ROLE_CUSTOMER']}
            >
                {route.element}
            </ProtectedRoute>
        ),
    })),
};

// Define public routes
const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/admin/dashboard" replace />
    },
    authRoutes,
];

// Define a not found route
const notFoundRoute: RouteObject = {
    path: '*',
    element: <NotFound />,
};

// Combine all routes into a single array
export const routes: RouteObject[] = [
    ...publicRoutes,
    protectedAdminRoutes as RouteObject,
    notFoundRoute,
];

// Export individual route groups for modularity if needed
export { publicRoutes, authRoutes, adminRoutes };
