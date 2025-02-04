import { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { routes } from "./routes";
import { Loader2 } from 'lucide-react';

// Progress Loading Component
const ProgressLoading = ({ message = 'Loading...' }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Tăng nhanh lúc đầu, chậm dần về cuối với easing function
                const remaining = 100 - prev;
                const increment = Math.max(0.5, remaining * 0.1);
                return Math.min(prev + increment, 100);
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-96 flex flex-col items-center gap-6 shadow-xl"
                 data-aos="fade-up"
                 data-aos-duration="500">
                {/* Loading icon */}
                <Loader2 className="w-12 h-12 text-primary animate-spin" />

                {/* Loading text */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                        {Math.round(progress)}%
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// Navigation loading component with smooth transitions
const NavigationLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200); // Reduced slightly for better UX

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
            <ProgressLoading message="Đang tải trang..." />
        </div>
    );
};

const App = () => {
    const element = useRoutes(routes);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Initialize AOS with custom settings
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out',
            offset: 50,
            delay: 100,
            mirror: true
        });

        // Simulate initial loading with smooth transition
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {isInitializing ? (
                <ProgressLoading message="Đang khởi động ứng dụng..." />
            ) : (
                <>
                    {element}
                    <NavigationLoading />
                </>
            )}
        </div>
    );
};

export default App;