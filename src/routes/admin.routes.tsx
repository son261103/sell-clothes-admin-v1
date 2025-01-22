import { RouteObject } from 'react-router-dom';
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";


export const adminRoutes: RouteObject = {
    path: '/admin',
    element: <AdminLayout />,
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
            element: <div>Users Management Page</div>
        },
        {
            path: 'products',
            element: <div>Products Management Page</div>
        },
        {
            path: 'products/add',
            element: <div>Add Product Page</div>
        },
        {
            path: 'products/categories',
            element: <div>Categories Management Page</div>
        },
        {
            path: 'reports',
            element: <div>Reports Page</div>
        },
        {
            path: 'settings',
            element: <div>Settings Page</div>
        }
    ]
};