import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Outlet } from 'react-router-dom';

// Lazy load components
const ProductListPage = lazy(() => import('@/pages/Product/ProductListPage.tsx'));
const ProductAddPage = lazy(() => import('@/pages/Product/ProductAddPage.tsx'));

export const productRoutes: RouteObjectWithMeta[] = [
    {
        path: 'products',
        element: <Outlet />,
        children: [
            {
                path: 'list',
                element: <ProductListPage />,
                meta: {
                    title: 'Product Management',
                    requiredPermissions: ['VIEW_PRODUCT']
                }
            },
            {
                path: 'add',
                element: <ProductAddPage />,
                meta: {
                    title: 'Add Product',
                    requiredPermissions: ['CREATE_PRODUCT']
                }
            },
        ],
        meta: {
            title: 'Product Management',
            requiredPermissions: ['VIEW_PRODUCT'],
        }
    }
];