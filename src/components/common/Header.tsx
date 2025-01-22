import { Search, Menu, ChevronLeft } from 'lucide-react';
import DarkModeToggle from "../header/DarkModeToggle";
import NotificationButton from "../header/NotificationButton";
import ProfileDropdown from "../header/ProfileDropdown";
import { useState } from 'react';

interface HeaderProps {
    isSidebarOpen: boolean;
    isMobile: boolean;
    onToggle: () => void;
}

const Header = ({ isSidebarOpen, isMobile, onToggle }: HeaderProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const handleLogout = () => {
        console.log('Logging out...');
    };

    return (
        <header
            className={`fixed top-0 left-0 h-auto w-full bg-lightBackground dark:bg-darkBackground shadow-md z-50
                       transition-all duration-300
                       ${isSidebarOpen && !isMobile ? 'lg:pl-64' : ''}
                       ${!isSidebarOpen && !isMobile ? 'lg:pl-16' : ''}`}
        >
            <div className="flex flex-col w-full">
                {/* Main Header */}
                <div className="flex items-center justify-between h-16 px-4">
                    {/* Left side - Toggle and Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-secondary
                                    transition-colors duration-200"
                            aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        >
                            {isSidebarOpen ? (
                                <ChevronLeft className="w-5 h-5 text-primary  dark:text-primary" />
                            ) : (
                                <Menu className="w-5 h-5 text-primary dark:text-primary" />
                            )}
                        </button>
                    </div>

                    {/* Center - Search (Desktop) */}
                    <div className="flex-1 max-w-xl px-4 hidden md:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 rounded-lg bg-primary/10 dark:bg-secondary/30
                                         text-primary dark:text-textLight
                                         focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Search className="absolute right-3 top-2.5 w-5 h-5 text-secondary/50 dark:text-textLight/50" />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-secondary/30 md:hidden
                                     transition-colors duration-200"
                            aria-label="Search"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="w-5 h-5 text-secondary dark:text-textLight" />
                        </button>

                        <DarkModeToggle />
                        <NotificationButton />
                        <ProfileDropdown onLogout={handleLogout} />
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="md:hidden px-4 py-2 border-t border-primary/20 dark:border-secondary">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 rounded-lg bg-primary/10 dark:bg-secondary/30
                                         text-secondary dark:text-textLight
                                         focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Search className="absolute right-3 top-2.5 w-5 h-5 text-secondary/50 dark:text-textLight/50" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;