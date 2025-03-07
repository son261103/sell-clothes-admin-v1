import {RouteObjectWithMeta} from "./types.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import {dashboardRoutes} from "./modules/dashboard.routes.tsx";
import {userRoutes} from "./modules/user.routes.tsx";
import {productRoutes} from "./modules/product.routes.tsx";
import {settingRoutes} from "./modules/setting.routes.tsx";
import {permissionRoutes} from "./modules/permission.routes.tsx";
import {roleRoutes} from "./modules/role.routes.tsx";
import {categoryRoutes} from "@/routes/modules/category.routes.tsx";
import {brandRoutes} from "@/routes/modules/brand.routes.tsx";
import {orderRoutes} from "@/routes/modules/order.routes.tsx";
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
        ...permissionRoutes,
        ...roleRoutes,
        ...categoryRoutes,
        ...brandRoutes,
        ...orderRoutes,


        ...settingRoutes,

    ]
};