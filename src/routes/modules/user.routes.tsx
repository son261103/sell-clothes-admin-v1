import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Navigate, Outlet } from 'react-router-dom';

// Lazy load các components
const UserListPage = lazy(() => import('../../pages/User/UserListPage'));

export const userRoutes: RouteObjectWithMeta[] = [
    {
        path: 'users',
        element: <Outlet />,
        children: [
            {
                index: true,
                element: <Navigate to="list" replace />,
            },
            {
                path: 'list',
                element: <UserListPage />,
                meta: {
                    title: 'User Management',
                    requiredPermissions: ['VIEW_CUSTOMER']
                }
            },
        ],
        meta: {
            title: 'User Management',
            requiredPermissions: ['VIEW_CUSTOMER'],
        }
    }
];