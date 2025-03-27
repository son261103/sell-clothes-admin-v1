import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type ColorType = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: number;
    loading?: boolean;
    color?: ColorType;
    hideChange?: boolean;
}

// Helper function to get color classes
const getColorClasses = (color: ColorType): string => {
    switch (color) {
        case 'primary':
            return 'text-primary bg-primary/10';
        case 'secondary':
            return 'text-secondary bg-secondary/10';
        case 'accent':
            return 'text-accent bg-accent/10';
        case 'success':
            return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
        case 'warning':
            return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
        case 'info':
            return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
        case 'error':
            return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
        default:
            return 'text-primary bg-primary/10';
    }
};

const StatCard: React.FC<StatCardProps> = ({
                                               icon,
                                               title,
                                               value,
                                               change,
                                               loading = false,
                                               color = 'primary',
                                               hideChange = false
                                           }) => {
    const colorClasses = getColorClasses(color);
    const isPositiveChange = (change || 0) >= 0;

    return (
        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                    {icon}
                </div>

                {!hideChange && change !== undefined && (
                    <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                        isPositiveChange
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    }`}>
                        {isPositiveChange ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-sm font-medium text-secondary dark:text-highlight">{title}</h3>

                {loading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                ) : (
                    <p className="text-2xl font-semibold text-textDark dark:text-textLight mt-1">{value}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;