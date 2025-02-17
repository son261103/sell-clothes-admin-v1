import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
import { IMenuItem, menuItems } from './MenuConfig';

interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onToggle?: () => void;
}

interface PopupMenuProps {
    item: IMenuItem;
    isOpen: boolean;
    position: { top: number; left: number };
    onClose: () => void;
}

interface MenuItemProps {
    item: IMenuItem;
    isOpen: boolean;
    isMobile: boolean;
    level?: number;
    onToggleSubmenu?: (isOpen: boolean) => void;
}

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
        }, 300); // Increased delay for smoother interaction
    };

    if (!isOpen || !item.children?.length) return null;

    return (
        <div
            ref={popupRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed bg-white dark:bg-darkBackground shadow-xl rounded-lg py-2 z-50
                     transition-all duration-300 ease-out
                     backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95
                     ring-1 ring-gray-200 dark:ring-gray-800
                     min-w-[220px] transform-gpu"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                opacity: isVisible ? 1 : 0,
                transform: `translateX(${isVisible ? 0 : -12}px)`,
                transitionProperty: 'transform, opacity'
            }}
        >
            {item.children.map((child) => (
                <div key={child.path ?? child.title} className="px-1.5">
                    <Link
                        to={child.path || '#'}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md
                                  transition-all duration-200 text-sm group relative
                                  hover:bg-primary/5 dark:hover:bg-primary/10
                                  ${location.pathname === child.path
                            ? 'text-primary font-medium bg-primary/5 shadow-sm'
                            : 'text-textDark dark:text-textLight hover:text-primary'}`}
                    >
                        <div className={`min-w-[18px] flex items-center justify-center
                                      transition-transform duration-200
                                      group-hover:scale-110
                                      ${location.pathname === child.path ? 'text-primary' :
                            'group-hover:text-primary'}`}>
                            {child.icon}
                        </div>
                        <span className="flex-1 transition-colors duration-200">{child.title}</span>
                        {child.children && (
                            <ChevronDown className="w-4 h-4 opacity-50 transition-transform
                                                  duration-200 group-hover:opacity-100" />
                        )}
                    </Link>

                    {child.children && (
                        <div className="pl-4 mt-1 space-y-0.5">
                            {child.children.map((grandChild) => (
                                <Link
                                    key={grandChild.path ?? grandChild.title}
                                    to={grandChild.path || '#'}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm
                                              transition-all duration-200 group relative
                                              hover:bg-primary/5 dark:hover:bg-primary/10
                                              ${location.pathname === grandChild.path
                                        ? 'text-primary font-medium bg-primary/5 shadow-sm'
                                        : 'text-textDark dark:text-textLight hover:text-primary'}`}
                                >
                                    <div className={`min-w-[18px] flex items-center justify-center
                                                   transition-transform duration-200
                                                   group-hover:scale-110
                                                   ${location.pathname === grandChild.path ? 'text-primary' :
                                        'group-hover:text-primary'}`}>
                                        {grandChild.icon}
                                    </div>
                                    <span className="transition-colors duration-200">{grandChild.title}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
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
    const hasChildren = Boolean(item.children?.length);
    const isChildActive = hasChildren && item.children?.some(
        child => child.path === location.pathname ||
            child.children?.some(grandChild => grandChild.path === location.pathname)
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
            }, 300); // Increased delay for smoother interaction
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md
                          transition-all duration-300 ease-out group relative
                          hover:bg-primary/5 dark:hover:bg-primary/10
                          ${level > 0 ? 'text-sm' : ''}
                          ${(isActive || isChildActive) && 'bg-primary/5 shadow-sm'}
                          ${isActive || isChildActive
                    ? 'text-primary font-medium'
                    : 'text-textDark dark:text-textLight hover:text-primary'}`}
            >
                <div className={`min-w-[18px] flex items-center justify-center
                               transition-all duration-200
                               group-hover:scale-110
                               ${isActive || isChildActive ? 'text-primary' :
                    'group-hover:text-primary'}`}>
                    {item.icon}
                </div>

                {isOpen && (
                    <>
                        <span className="flex-1 transition-colors duration-200">
                            {item.title}
                        </span>

                        {hasChildren && (
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 
                                          opacity-50 group-hover:opacity-100
                                          ${isSubMenuOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </>
                )}

                {!isOpen && !isMobile && !hasChildren && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5
                                  bg-gray-800 dark:bg-gray-700 text-white
                                  text-xs font-medium rounded-md opacity-0
                                  group-hover:opacity-100 scale-95
                                  group-hover:scale-100 backdrop-blur-sm
                                  pointer-events-none transition-all duration-200
                                  z-50 whitespace-nowrap shadow-lg
                                  transform-gpu">
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
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                               ${isSubMenuOpen ? 'max-h-screen opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
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
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40
                             transition-opacity duration-300 ease-in-out"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-screen bg-white dark:bg-secondary
                           shadow-xl transition-all duration-300 ease-out z-50
                           ${isOpen ? 'w-64' : 'w-16'}
                           ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                           flex flex-col`}
            >
                <div className="h-16 flex items-center px-4 border-b
                               border-gray-200 dark:border-gray-700
                               transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary shrink-0
                                           transition-transform duration-300 hover:scale-110"/>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-primary
                                               tracking-wide transition-colors duration-300">
                                    AURAS
                                </span>
                                <span className="text-xs text-textDark dark:text-textLight
                                               transition-colors duration-300">
                                    Hệ thống quản lý
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto
                               scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                               scrollbar-track-transparent hover:scrollbar-thumb-gray-400
                               dark:hover:scrollbar-thumb-gray-500
                               px-2 py-4">
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.path || item.title}
                                item={item}
                                isOpen={isOpen}
                                isMobile={isMobile}
                            />
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700
                               transition-colors duration-300">
                    {isOpen && (
                        <div className="text-xs text-textDark dark:text-textLight
                                      text-center transition-colors duration-300">
                            Version 1.0.0
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;