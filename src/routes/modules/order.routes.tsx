import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Outlet } from 'react-router-dom';

// Lazy load components
const OrderListPage = lazy(() => import('@/pages/order/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/pages/order/OrderDetailPage'));

export const orderRoutes: RouteObjectWithMeta[] = [
    {
        path: 'orders',
        element: <Outlet />,
        children: [
            {
                path: 'list',
                element: <OrderListPage />,
                meta: {
                    title: 'Order Management',
                    requiredPermissions: ['VIEW_ORDER']
                }
            },
            {
                path: 'detail/:id',
                element: <OrderDetailPage />,
                meta: {
                    title: 'Order Detail',
                    requiredPermissions: ['VIEW_ORDER']
                }
            }
        ],
        meta: {
            title: 'Order Management',
            requiredPermissions: ['VIEW_ORDER'],
        }
    }
];