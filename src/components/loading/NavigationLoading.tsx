import React, { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import Loading from '../common/Loading';

const NavigationLoading: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        // Only show loading for push/replace navigation, not for pop (back/forward)
        if (navigationType !== 'POP') {
            setIsLoading(true);

            // Simulate minimum loading time to prevent flashing
            const minLoadingTime = 500;
            const startTime = Date.now();

            const timer = setTimeout(() => {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadingTime) {
                    setTimeout(() => setIsLoading(false), minLoadingTime - elapsedTime);
                } else {
                    setIsLoading(false);
                }
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [location, navigationType]);

    if (!isLoading) return null;

    return <Loading fullScreen message="Đang tải trang..." />;
};

export default NavigationLoading;
