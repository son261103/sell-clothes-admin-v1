import React from 'react';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    ClipboardList,
    UserPlus,
    BadgeCheck,
    Key,
    Package,
    Tag,
    BarChart3,
    PieChart,
    BellRing,
    MessageSquare,
    Sliders,
    LifeBuoy,
} from 'lucide-react';

export interface IMenuItem {
    title: string;
    path?: string;
    icon: React.ReactNode;
    children?: IMenuItem[];
}

export const menuItems: IMenuItem[] = [
    {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboard className="w-5 h-5"/>,
    },
    {
        title: 'Access Control',
        icon: <ShieldCheck className="w-5 h-5"/>,
        children: [
            {
                title: 'Roles',
                icon: <BadgeCheck className="w-4 h-4"/>,
                children: [
                    {
                        title: 'Role List',
                        path: '/admin/access-control/roles/list',
                        icon: <ClipboardList className="w-4 h-4"/>,
                    },
                    {
                        title: 'Add Role',
                        path: '/admin/access-control/roles/add',
                        icon: <UserPlus className="w-4 h-4"/>,
                    },
                ]
            },
            {
                title: 'Permissions',
                icon: <Key className="w-4 h-4"/>,
                children: [
                    {
                        title: 'Permission List',
                        path: '/admin/access-control/permissions/list',
                        icon: <ClipboardList className="w-4 h-4"/>,
                    },
                ]
            }
        ]
    },
    {
        title: 'User Management',
        icon: <Users className="w-5 h-5"/>,
        children: [
            {
                title: 'User List',
                path: '/admin/users/list',
                icon: <Users className="w-4 h-4"/>,
            },
            {
                title: 'Add User',
                path: '/admin/users/add',
                icon: <UserPlus className="w-4 h-4"/>,
            },
        ]
    },
    {
        title: 'Products',
        icon: <Package className="w-5 h-5"/>,
        children: [
            {
                title: 'Product List',
                path: '/admin/products',
                icon: <Package className="w-4 h-4"/>,
            },
            {
                title: 'Categories',
                path: '/admin/products/categories',
                icon: <Tag className="w-4 h-4"/>,
            },
        ]
    },
    {
        title: 'Reports',
        icon: <BarChart3 className="w-5 h-5"/>,
        children: [
            {
                title: 'Sales Report',
                path: '/admin/reports/sales',
                icon: <PieChart className="w-4 h-4"/>,
            },
            {
                title: 'Analytics',
                path: '/admin/reports/analytics',
                icon: <BarChart3 className="w-4 h-4"/>,
            },
        ]
    },
    {
        title: 'Notifications',
        icon: <BellRing className="w-5 h-5"/>,
        children: [
            {
                title: 'System Alerts',
                path: '/admin/notifications/alerts',
                icon: <BellRing className="w-4 h-4"/>,
            },
            {
                title: 'Messages',
                path: '/admin/notifications/messages',
                icon: <MessageSquare className="w-4 h-4"/>,
            },
        ]
    },
    {
        title: 'Settings',
        path: '/admin/settings',
        icon: <Sliders className="w-5 h-5"/>,
    },
    {
        title: 'Help',
        path: '/admin/help',
        icon: <LifeBuoy className="w-5 h-5"/>,
    },
];
