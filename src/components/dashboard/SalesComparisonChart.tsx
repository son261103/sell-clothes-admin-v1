import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';

interface MonthlyData {
    month: string;
    count: number;
    revenue: number;
}

interface SalesComparisonChartProps {
    orders: MonthlyData[];
    revenue: MonthlyData[];
    isLoading: boolean;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p
                        key={`tooltip-${index}`}
                        className="text-sm"
                        style={{ color: entry.color }}
                    >
                        {entry.name === 'orders' ? 'Số đơn: ' : 'Doanh thu: '}
                        {entry.name === 'orders'
                            ? entry.value
                            : new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                minimumFractionDigits: 0
                            }).format(entry.value as number)
                        }
                    </p>
                ))}
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
    </div>
);

const SalesComparisonChart: React.FC<SalesComparisonChartProps> = ({ orders, revenue, isLoading }) => {
    // Prepare data for the chart
    const chartData = useMemo(() => {
        if (!orders?.length || !revenue?.length) {
            // Return sample data if no data available
            return Array(6)
                .fill(0)
                .map((_, i) => ({
                    name: `T${i + 1}`,
                    orders: 0,
                    revenue: 0
                }));
        }

        // Combine orders and revenue data
        const combined = orders.map(orderItem => {
            const revenueItem = revenue.find(r => r.month === orderItem.month) || { revenue: 0 };

            return {
                name: orderItem.month,
                orders: orderItem.count,
                revenue: revenueItem.revenue
            };
        });

        // Return the most recent 6 months
        return combined.slice(-6);
    }, [orders, revenue]);

    if (isLoading) {
        return <ChartSkeleton />;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#4f46e5"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toString()}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                    yAxisId="left"
                    dataKey="orders"
                    name="Đơn hàng"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
                <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesComparisonChart;