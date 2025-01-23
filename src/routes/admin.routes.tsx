import { RouteObject } from 'react-router-dom';
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";

export interface RouteObjectWithMeta extends Omit<RouteObject, 'children'> {
    children?: RouteObjectWithMeta[];
    meta?: {
        requiredPermissions?: string[];
    };
}

export const adminRoutes: RouteObjectWithMeta = {
    path: '/admin',
    element: <AdminLayout />,
    meta: {
        requiredPermissions: ['VIEW_ROLE']
    },
    children: [
        {
            index: true,
            element: <DashboardPage />
        },
        {
            path: 'dashboard',
            element: <DashboardPage />
        },
        {
            path: 'users',
            element: <div>Users Management Page</div>,
            meta: {
                requiredPermissions: ['VIEW_USER']
            }
        },
        {
            path: 'products',
            element: <div>Products Management Page</div>,
            meta: {
                requiredPermissions: ['VIEW_PRODUCT']
            }
        },
        {
            path: 'products/add',
            element: <div>Add Product Page</div>,
            meta: {
                requiredPermissions: ['CREATE_PRODUCT']
            }
        },
        {
            path: 'products/categories',
            element: <div>Categories Management Page</div>,
            meta: {
                requiredPermissions: ['VIEW_CATEGORY']
            }
        },
        {
            path: 'reports',
            element: <div>Reports Page</div>,
            meta: {
                requiredPermissions: ['VIEW_REPORT']
            }
        },
        {
            path: 'settings',
            element: <div>Settings Page</div>,
            meta: {
                requiredPermissions: ['VIEW_SETTINGS']
            }
        }
    ]
};