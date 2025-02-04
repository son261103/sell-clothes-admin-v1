import { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { routes } from "./routes";

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
                // Tăng nhanh lúc đầu, chậm dần về cuối
                const increment = Math.max(1, (100 - prev) / 15);
                return Math.min(prev + increment, 100);
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-96 flex flex-col items-center gap-6">
                {/* Loading text */}
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
                    <p className="text-gray-600 text-lg font-medium">{Math.round(progress)}%</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// Navigation loading component
const NavigationLoading = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (!isLoading) return null;

    return <ProgressLoading message="Đang tải trang..." />;
};

const App = () => {
    const element = useRoutes(routes);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Initialize AOS
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out',
        });

        // Initial loading simulation
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 2000); // Increased to 2s to show progress

        return () => clearTimeout(timer);
    }, []);

    if (isInitializing) {
        return <ProgressLoading message="Đang khởi động ứng dụng..." />;
    }

    return (
        <>
            {element}
            <NavigationLoading />
        </>
    );
};

export default App;