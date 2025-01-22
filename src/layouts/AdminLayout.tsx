import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Initialize from localStorage, defaulting to screen size if no saved store
        const savedState = localStorage.getItem('sidebarOpen');
        if (savedState !== null) {
            return savedState === 'true';
        }
        return window.innerWidth >= 1024; // Default based on screen size
    });
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    // Handle sidebar store and mobile detection based on screen size
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                // On desktop, check localStorage first, otherwise default to open
                const savedState = localStorage.getItem('sidebarOpen');
                setSidebarOpen(savedState !== null ? savedState === 'true' : true);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Close sidebar on route change in mobile view
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location, isMobile]);

    // Toggle sidebar and save store to localStorage
    const toggleSidebar = () => {
        setSidebarOpen(prevState => {
            const newState = !prevState;
            if (!isMobile) {
                localStorage.setItem('sidebarOpen', String(newState));
            }
            return newState;
        });
    };

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <Header
                isSidebarOpen={sidebarOpen}
                isMobile={isMobile}
                onToggle={toggleSidebar}
            />

            <div className="flex relative">
                <Sidebar
                    isOpen={sidebarOpen}
                    isMobile={isMobile}
                />

                <main
                    className={`flex-1 min-h-screen transition-all duration-300
                               ${!isMobile && sidebarOpen ? 'ml-64' : ''}
                               ${!isMobile && !sidebarOpen ? 'ml-16' : ''}
                               pt-16`}
                >
                    <div className="p-4 md:p-6 ">
                        <div className="container mx-auto">
                            <Outlet />
                        </div>
                    </div>

                    <Footer />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default AdminLayout;