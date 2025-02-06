import {RouteObjectWithMeta} from "./types.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import {dashboardRoutes} from "./modules/dashboard.routes.tsx";
import {userRoutes} from "./modules/user.routes.tsx";
import {productRoutes} from "./modules/product.routes.tsx";
import {settingRoutes} from "./modules/setting.routes.tsx";

export const adminRoutes: RouteObjectWithMeta = {
    path: '/admin',
    element: <AdminLayout/>,
    meta: {
        requiredPermissions: []
    },
    children: [
        ...dashboardRoutes,
        ...userRoutes,
        ...productRoutes,
        ...settingRoutes
    ]
};