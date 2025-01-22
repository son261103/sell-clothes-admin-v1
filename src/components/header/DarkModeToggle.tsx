import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = React.useState(() => {
        // Lấy trạng thái từ localStorage hoặc mặc định là light mode
        const savedMode = localStorage.getItem('theme');
        return savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
            {darkMode ? (
                <Sun className="w-5 h-5 text-primary dark:text-primary" />
            ) : (
                <Moon className="w-5 h-5 text-primary dark:text-primary" />
            )}
        </button>
    );
};

export default DarkModeToggle;
