import { RouteObjectWithMeta } from '../types';

export const settingRoutes: RouteObjectWithMeta[] = [
    {
        path: 'settings',
        element: <div>Settings Page</div>,
        meta: {
            requiredPermissions: ['VIEW_SETTINGS']
        }
    }
];