import React from 'react';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    ClipboardList,
    UserPlus,
    BadgeCheck,
    KeyRound,
    Package2,
    Tags,
    BarChartHorizontal,
    PieChart,
    Bell,
    Mail,
    SlidersHorizontal,
    LifeBuoy,
    Folder,
    List,
    Plus,
    PlusCircle,
    Eye // Thêm icon cho chi tiết
} from 'lucide-react';

export interface IMenuItem {
    title: string;
    path?: string;
    icon: React.ReactNode;
    children?: IMenuItem[];
}

export const menuItems: IMenuItem[] = [
    {
        title: 'Bảng điều khiển',
        path: '/admin/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        title: 'Kiểm soát truy cập',
        icon: <ShieldCheck className="w-5 h-5" />,
        children: [
            {
                title: 'Vai trò',
                icon: <BadgeCheck className="w-4 h-4" />,
                children: [
                    {
                        title: 'Danh sách vai trò',
                        path: '/admin/access-control/roles/list',
                        icon: <ClipboardList className="w-4 h-4" />,
                    },
                    {
                        title: 'Thêm vai trò',
                        path: '/admin/access-control/roles/add',
                        icon: <UserPlus className="w-4 h-4" />,
                    },
                ]
            },
            {
                title: 'Quyền hạn',
                icon: <KeyRound className="w-4 h-4" />,
                children: [
                    {
                        title: 'Danh sách quyền',
                        path: '/admin/access-control/permissions/list',
                        icon: <ClipboardList className="w-4 h-4" />,
                    },
                ]
            }
        ]
    },
    {
        title: 'Quản lý người dùng',
        icon: <Users className="w-5 h-5" />,
        children: [
            {
                title: 'Danh sách người dùng',
                path: '/admin/users/list',
                icon: <Users className="w-4 h-4" />,
            },
            {
                title: 'Thêm người dùng',
                path: '/admin/users/add',
                icon: <UserPlus className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Thương hiệu',
        icon: <Tags className="w-5 h-5" />,
        children: [
            {
                title: 'Danh sách thương hiệu',
                path: '/admin/brands/list',
                icon: <List className="w-4 h-4" />,
            },
            {
                title: 'Thêm thương hiệu',
                path: '/admin/brands/add',
                icon: <Plus className="w-4 h-4" />,
            }
        ]
    },
    {
        title: 'Quản lý danh mục',
        icon: <Folder className="w-5 h-5" />,
        children: [
            {
                title: 'Danh sách danh mục',
                path: '/admin/categories/list',
                icon: <List className="w-4 h-4" />,
            },
            {
                title: 'Thêm danh mục',
                path: '/admin/categories/add',
                icon: <Plus className="w-4 h-4" />,
            }
        ]
    },
    {
        title: 'Sản phẩm',
        icon: <Package2 className="w-5 h-5" />,
        children: [
            {
                title: 'Danh sách sản phẩm',
                path: '/admin/products/list',
                icon: <Package2 className="w-4 h-4" />,
            },
            {
                title: 'Thêm sản phẩm',
                path: '/admin/products/add',
                icon: <PlusCircle className="w-4 h-4" />,
            },
            {
                title: 'Chi tiết sản phẩm',
                path: '/admin/products/detail/:productId',
                icon: <Eye className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Quản lý đơn hàng',
        icon: <ClipboardList className="w-5 h-5" />,
        children: [
            {
                title: 'Danh sách đơn hàng',
                path: '/admin/orders/list',
                icon: <List className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Báo cáo',
        icon: <BarChartHorizontal className="w-5 h-5" />,
        children: [
            {
                title: 'Báo cáo doanh số',
                path: '/admin/reports/sales',
                icon: <PieChart className="w-4 h-4" />,
            },
            {
                title: 'Phân tích',
                path: '/admin/reports/analytics',
                icon: <BarChartHorizontal className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Thông báo',
        icon: <Bell className="w-5 h-5" />,
        children: [
            {
                title: 'Cảnh báo hệ thống',
                path: '/admin/notifications/alerts',
                icon: <Bell className="w-4 h-4" />,
            },
            {
                title: 'Tin nhắn',
                path: '/admin/notifications/messages',
                icon: <Mail className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Cài đặt',
        path: '/admin/settings',
        icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
        title: 'Trợ giúp',
        path: '/admin/help',
        icon: <LifeBuoy className="w-5 h-5" />,
    },
];