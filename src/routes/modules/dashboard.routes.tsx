import { RouteObjectWithMeta } from '../types';
import DashboardPage from "../../pages/Dashboard/DashboardPage";

export const dashboardRoutes: RouteObjectWithMeta[] = [
    {
        index: true,
        element: <DashboardPage />,
        meta: {
            requiredPermissions: []
        }
    },
    {
        path: 'dashboard',
        element: <DashboardPage />,
        meta: {
            requiredPermissions: []
        }
    }
];