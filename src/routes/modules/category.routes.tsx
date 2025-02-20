import {lazy} from 'react';
import {RouteObjectWithMeta} from '../types';
import {Outlet} from 'react-router-dom';

// Lazy load components
const CategoryListPage = lazy(() => import('@/pages/Category/CategoryListPage.tsx'));
const CategoryAddPage = lazy(() => import('@/pages/Category/CategoryAddPage.tsx'));


export const categoryRoutes: RouteObjectWithMeta[] = [
    {
        path: 'categories',
        element: <Outlet/>,
        children: [
            {
                path: 'list',
                element: <CategoryListPage/>,
                meta: {
                    title: 'Category Management',
                    requiredPermissions: ['VIEW_CATEGORY']
                }
            },
            {
                path: 'add',
                element: <CategoryAddPage/>,
                meta: {
                    title: 'Add Category',
                    requiredPermissions: ['CREATE_CATEGORY']
                }
            },
            // {
            //     path: ':categoryId/subcategories',
            //     element: <Outlet/>,
            //     children: [
            //         {
            //             path: '',
            //             element: <SubcategoryListPage/>,
            //             meta: {
            //                 title: 'Subcategory Management',
            //                 requiredPermissions: ['VIEW_CATEGORY']
            //             }
            //         },
            //     ],
            //     meta: {
            //         title: 'Subcategory Management',
            //         requiredPermissions: ['VIEW_CATEGORY']
            //     }
            // }
        ],
        meta: {
            title: 'Category Management',
            requiredPermissions: ['VIEW_CATEGORY'],
        }
    }
];