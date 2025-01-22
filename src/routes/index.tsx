import { RouteObject } from 'react-router-dom';
import { authRoutes } from './auth.routes';
import { adminRoutes } from './admin.routes';
import { Navigate } from 'react-router-dom';
import NotFound from "../pages/NotFound/NotFound.tsx";

// Kiểm tra đăng nhập
// const isAuthenticated = () => {
//     return !!localStorage.getItem('token');
// };

// Protected Route Wrapper
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//     if (!isAuthenticated()) {
//         return <Navigate to="/auth/login" replace />;
//     }
//     return <>{children}</>;
// };

// Public routes
const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/auth/login" replace />
    },
    authRoutes,
    adminRoutes,
];

// Protected routes
// const protectedRoutes: RouteObject[] = [
//     {
//         ...adminRoutes,
//         element: <ProtectedRoute>{adminRoutes.element}</ProtectedRoute>
//     }
// ];

// Not found route
const notFoundRoute: RouteObject = {
    path: '*',
    element: <NotFound />
};

// Combine all routes
export const routes: RouteObject[] = [
    ...publicRoutes,
    // ...protectedRoutes,
    notFoundRoute
];

// Export các routes riêng lẻ
// export { publicRoutes, protectedRoutes, authRoutes, adminRoutes };
export { publicRoutes, authRoutes, adminRoutes };