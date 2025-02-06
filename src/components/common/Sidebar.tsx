import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    HelpCircle,
    Box,
    FileText,
    Sparkles,
    ChevronDown,
    UserCog,
    UserPlus,
    Boxes,
    Package,
    FilePieChart,
    FileBarChart,
    Bell,
    Mail,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onToggle?: () => void;
}

interface MenuItem {
    title: string;
    path?: string;
    icon: React.ReactNode;
    children?: MenuItem[];
}

interface PopupMenuProps {
    item: MenuItem;
    isOpen: boolean;
    position: { top: number; left: number };
    onClose: () => void;
}

interface MenuItemProps {
    item: MenuItem;
    isOpen: boolean;
    isMobile: boolean;
    level?: number;
    onToggleSubmenu?: (isOpen: boolean) => void;
}

const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        title: 'User Management',
        icon: <Users className="w-5 h-5" />,
        children: [
            {
                title: 'User List',
                path: '/admin/users/list',
                icon: <Users className="w-4 h-4" />,
            },
            {
                title: 'User Roles',
                path: '/admin/users/roles',
                icon: <UserCog className="w-4 h-4" />,
            },
            {
                title: 'Add User',
                path: '/admin/users/add',
                icon: <UserPlus className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Products',
        icon: <Boxes className="w-5 h-5" />,
        children: [
            {
                title: 'Product List',
                path: '/admin/products',
                icon: <Box className="w-4 h-4" />,
            },
            {
                title: 'Categories',
                path: '/admin/products/categories',
                icon: <Package className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Reports',
        icon: <FileText className="w-5 h-5" />,
        children: [
            {
                title: 'Sales Report',
                path: '/admin/reports/sales',
                icon: <FilePieChart className="w-4 h-4" />,
            },
            {
                title: 'Analytics',
                path: '/admin/reports/analytics',
                icon: <FileBarChart className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Notifications',
        icon: <Bell className="w-5 h-5" />,
        children: [
            {
                title: 'System Alerts',
                path: '/admin/notifications/alerts',
                icon: <Bell className="w-4 h-4" />,
            },
            {
                title: 'Messages',
                path: '/admin/notifications/messages',
                icon: <Mail className="w-4 h-4" />,
            },
        ]
    },
    {
        title: 'Settings',
        path: '/admin/settings',
        icon: <Settings className="w-5 h-5" />,
    },
    {
        title: 'Help',
        path: '/admin/help',
        icon: <HelpCircle className="w-5 h-5" />,
    },
];

const PopupMenu: React.FC<PopupMenuProps> = ({ item, isOpen, position, onClose }) => {
    const location = useLocation();
    const popupRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number>();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
    };

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen || !item.children?.length) return null;

    return (
        <div
            ref={popupRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`fixed bg-white dark:bg-darkBackground shadow-lg rounded-lg py-2 z-50
                       transition-opacity duration-200 min-w-[200px]
                       ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {item.children.map((child) => (
                <Link
                    key={child.path ?? child.title}
                    to={child.path || '#'}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-secondary
                              ${location.pathname === child.path
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-textDark dark:text-textLight'}`}
                >
                    <div className="min-w-[20px]">{child.icon}</div>
                    <span className="whitespace-nowrap">{child.title}</span>
                </Link>
            ))}
        </div>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({
                                               item,
                                               isOpen,
                                               isMobile,
                                               level = 0,
                                               onToggleSubmenu
                                           }) => {
    const location = useLocation();
    const itemRef = useRef<HTMLDivElement>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const timeoutRef = useRef<number>();

    const isActive = item.path ? location.pathname === item.path : false;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isChildActive = hasChildren && item.children?.some(
        child => child.path === location.pathname
    );

    useEffect(() => {
        if (isChildActive) {
            setIsSubMenuOpen(true);
            onToggleSubmenu?.(true);
        }
    }, [isChildActive, onToggleSubmenu]);

    useEffect(() => {
        if (!isOpen) {
            setIsSubMenuOpen(false);
            setShowPopup(false);
        }
    }, [isOpen]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        if (!isOpen && hasChildren && !isMobile) {
            const rect = itemRef.current?.getBoundingClientRect();
            if (rect) {
                setPopupPosition({
                    top: rect.top,
                    left: rect.right + 8,
                });
                setShowPopup(true);
            }
        }
    };

    const handleMouseLeave = () => {
        if (!isOpen && !isMobile) {
            timeoutRef.current = window.setTimeout(() => {
                setShowPopup(false);
            }, 300);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (hasChildren) {
            e.preventDefault();
            if (isOpen) {
                setIsSubMenuOpen(!isSubMenuOpen);
                onToggleSubmenu?.(!isSubMenuOpen);
            } else {
                const rect = itemRef.current?.getBoundingClientRect();
                if (rect) {
                    setPopupPosition({
                        top: rect.top,
                        left: rect.right + 8,
                    });
                    setShowPopup(!showPopup);
                }
            }
        }
    };

    return (
        <div
            ref={itemRef}
            className={`relative ${level > 0 ? 'ml-4' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                to={item.path || '#'}
                onClick={handleClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1
                         transition-all duration-200 group relative
                         ${isActive || isChildActive
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'text-textDark hover:bg-gray-100 dark:text-textLight dark:hover:bg-secondary'
                }`}
            >
                <div className="min-w-[20px] flex items-center justify-center">
                    {item.icon}
                </div>

                {isOpen && (
                    <>
                        <span className="flex-1 whitespace-nowrap transition-all duration-300">
                            {item.title}
                        </span>

                        {hasChildren && (
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 
                                          ${isSubMenuOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </>
                )}

                {!isOpen && !isMobile && !hasChildren && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-secondary text-white
                                  text-sm rounded opacity-0 group-hover:opacity-100
                                  pointer-events-none transition-opacity z-50 whitespace-nowrap">
                        {item.title}
                    </div>
                )}
            </Link>

            {hasChildren && !isOpen && (
                <PopupMenu
                    item={item}
                    isOpen={showPopup}
                    position={popupPosition}
                    onClose={() => setShowPopup(false)}
                />
            )}

            {hasChildren && isOpen && item.children && (
                <div
                    className={`overflow-hidden transition-all duration-200 
                               ${isSubMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    {item.children.map((child) => (
                        <MenuItem
                            key={child.path || child.title}
                            item={child}
                            isOpen={isOpen}
                            isMobile={isMobile}
                            level={level + 1}
                            onToggleSubmenu={onToggleSubmenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onToggle }) => {
    return (
        <>
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-screen bg-white dark:bg-darkBackground
                       shadow-lg transition-all duration-300 ease-in-out z-50
                       ${isOpen ? 'w-64' : 'w-16'} 
                       ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                       flex flex-col`}
            >
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary shrink-0"/>
                        {isOpen && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-lg font-semibold text-primary">
                                    AURAS
                                </span>
                                <span className="text-xs text-textDark dark:text-textLight">
                                    Hệ thống quản lý
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <nav className="h-full px-2 py-4 overflow-y-auto scrollbar-none">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.path || item.title}
                                    item={item}
                                    isOpen={isOpen}
                                    isMobile={isMobile}
                                />
                            ))}
                        </div>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {isOpen && (
                        <div className="text-xs text-textDark dark:text-textLight text-center">
                            Version 1.0.0
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;