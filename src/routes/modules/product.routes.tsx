import { RouteObjectWithMeta } from '../types';

export const productRoutes: RouteObjectWithMeta[] = [
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
    }
];