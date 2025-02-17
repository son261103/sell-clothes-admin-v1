import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Outlet } from 'react-router-dom';

// Lazy load các components
const PermissionListPage = lazy(() => import('../../pages/Permission/PermissionListPage.tsx'));


export const permissionRoutes: RouteObjectWithMeta[] = [
    {
        path: 'access-control/permissions',
        element: <Outlet />,
        children: [
            {
                path: 'list',
                element: <PermissionListPage />,
                meta: {
                    title: 'Permission Management',
                    requiredPermissions: ['VIEW_PERMISSION']
                }
            },
        ],
        meta: {
            title: 'Permission Management',
            requiredPermissions: ['VIEW_PERMISSION'],
        }
    }
];