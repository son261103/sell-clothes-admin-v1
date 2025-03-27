import {RouteObjectWithMeta} from '../types';
import {Outlet} from 'react-router-dom';
import ReportsPage from "@/pages/StatisticsReports/ReportsPage.tsx";



export const reportRoutes: RouteObjectWithMeta[] = [
    {
        path: 'reports',
        element: <Outlet/>,
        children: [
            {
                path: '',
                element: <ReportsPage/>,
            },
        ],
    }
];