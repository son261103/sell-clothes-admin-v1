import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Outlet } from 'react-router-dom';

// Lazy load components
const BrandListPage = lazy(() => import('@/pages/Brand/BrandListPage.tsx'));
const BrandAddPage = lazy(() => import('@/pages/Brand/BrandAddPage.tsx'));

export const brandRoutes: RouteObjectWithMeta[] = [
    {
        path: 'brands',
        element: <Outlet />,
        children: [
            {
                path: 'list',
                element: <BrandListPage />,
                meta: {
                    title: 'Brand Management',
                    requiredPermissions: ['VIEW_BRAND']
                }
            },
            {
                path: 'add',
                element: <BrandAddPage />,
                meta: {
                    title: 'Add Brand',
                    requiredPermissions: ['CREATE_BRAND']
                }
            },
        ],
        meta: {
            title: 'Brand Management',
            requiredPermissions: ['VIEW_BRAND'],
        }
    }
];