import {lazy} from 'react';
import {RouteObjectWithMeta} from '../types';
import {Outlet} from 'react-router-dom';
import RoleAddPage from "../../pages/Role/RoleAddPage.tsx";

// Lazy load các components
const RoleListPage = lazy(() => import('../../pages/Role/RoleListPage.tsx'));


export const roleRoutes: RouteObjectWithMeta[] = [
    {
        path: 'access-control/roles',
        element: <Outlet/>,
        children: [
            {
                path: 'list',
                element: <RoleListPage/>,
                meta: {
                    title: 'Role Management',
                    requiredPermissions: ['VIEW_ROLE']
                }
            },
            {
                path: 'add',
                element: <RoleAddPage/>,
                meta: {
                    title: 'Add Role',
                    requiredPermissions: ['CREATE_ROLE']
                }
            }
        ],
        meta: {
            title: 'Role Management',
            requiredPermissions: ['VIEW_ROLE'],
        }
    }
];