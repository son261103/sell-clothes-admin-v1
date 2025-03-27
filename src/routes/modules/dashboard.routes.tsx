import { RouteObjectWithMeta } from '../types';
import StatisticsPage from "@/pages/StatisticsReports/StatisticsPage.tsx";

export const dashboardRoutes: RouteObjectWithMeta[] = [
    {
        index: true,
        element: <StatisticsPage />,
        meta: {
            requiredPermissions: []
        }
    },
    {
        path: 'dashboard',
        element: <StatisticsPage />,
        meta: {
            requiredPermissions: []
        }
    }
];