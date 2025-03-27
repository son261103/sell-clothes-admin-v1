import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';

interface MonthlyOrder {
    month: string;
    count: number;
    revenue: number;
}

interface RevenueChartProps {
    data: MonthlyOrder[];
    isLoading: boolean;
    period: 'day' | 'week' | 'month' | 'year';
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                <p className="text-sm text-primary">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0
                    }).format(payload[0].value as number)}
                </p>
            </div>
        );
    }

    return null;
};

// Loading skeleton for the chart
const ChartSkeleton = () => (
    <div className="flex flex-col space-y-2 w-full h-full items-center justify-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-sm animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-lg animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-xs animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md animate-pulse"></div>
    </div>
);

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading, period }) => {
    // Format data based on the selected period
    const formattedData = useMemo(() => {
        if (!data || data.length === 0) {
            // Return sample data if no data available
            return Array(12)
                .fill(0)
                .map((_, i) => ({
                    name: `${i + 1}`,
                    revenue: 0
                }));
        }

        // For simplicity, we'll just use the monthly data
        // In a real app, you'd filter data based on the selected period
        return data.map((item) => ({
            name: item.month,
            revenue: item.revenue
        }));
    }, [data, period]);

    if (isLoading) {
        return <ChartSkeleton />;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={formattedData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 10
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: 'white'
                    }}
                    activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: 'white'
                    }}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RevenueChart;