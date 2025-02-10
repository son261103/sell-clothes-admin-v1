import {RouteObject} from 'react-router-dom';
import {authRoutes} from './auth.routes';
import {adminRoutes} from './admin.routes';
import {Navigate} from 'react-router-dom';
import NotFoundPage from "../pages/NotFound/NotFoundPage.tsx";
import {ProtectedRoute} from './protected.routes';
import {RouteObjectWithMeta} from "./types.tsx";

// Create protected admin routes
const protectedAdminRoutes: RouteObjectWithMeta = {
    path: '/admin',
    element: (
        <ProtectedRoute forbiddenRoles={['ROLE_CUSTOMER']}>
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
        element: <Navigate to="/admin/dashboard" replace/>
    },
    authRoutes,
];

// Define a not found route
const notFoundRoute: RouteObject = {
    path: '*',
    element: <NotFoundPage/>,
};

// Combine all routes
export const routes: RouteObject[] = [
    ...publicRoutes,
    protectedAdminRoutes as RouteObject,
    notFoundRoute,
];

// Export individual route groups
export {publicRoutes, authRoutes, adminRoutes};