import { lazy } from 'react';
import { RouteObjectWithMeta } from '../types';
import { Outlet } from 'react-router-dom';

// Lazy load các components
const CouponListPage = lazy(() => import('../../pages/Coupon/CouponListPage.tsx'));
const CouponCreatePage = lazy(() => import('../../pages/Coupon/CouponAddPage.tsx'));
const CouponEditPage = lazy(() => import('../../pages/Coupon/CouponEditPage.tsx'));
const CouponDetailPage = lazy(() => import('../../pages/Coupon/CouponDetailPage.tsx'));

export const couponRoutes: RouteObjectWithMeta[] = [
    {
        path: 'marketing/coupons',
        element: <Outlet />,
        children: [
            {
                path: 'list',
                element: <CouponListPage />,
                meta: {
                    title: 'Quản lý mã giảm giá',
                    requiredPermissions: ['VIEW_COUPON']
                }
            },
            {
                path: 'add',
                element: <CouponCreatePage />,
                meta: {
                    title: 'Tạo mã giảm giá',
                    requiredPermissions: ['ADD_COUPON']
                }
            },
            {
                path: 'edit/:id',
                element: <CouponEditPage />,
                meta: {
                    title: 'Chỉnh sửa mã giảm giá',
                    requiredPermissions: ['EDIT_COUPON']
                }
            },
            {
                path: 'detail/:id',
                element: <CouponDetailPage />,
                meta: {
                    title: 'Chi tiết mã giảm giá',
                    requiredPermissions: ['VIEW_COUPON']
                }
            },
        ],
        meta: {
            title: 'Quản lý mã giảm giá',
            requiredPermissions: ['VIEW_COUPON'],
        }
    }
];