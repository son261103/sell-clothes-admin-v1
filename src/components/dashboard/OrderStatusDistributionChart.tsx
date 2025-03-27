import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { OrderStatisticsDTO } from '@/types';

interface OrderStatusDistributionChartProps {
    statistics: OrderStatisticsDTO;
    isLoading: boolean;
}

// Chart data item type
interface ChartDataItem {
    name: string;
    value: number;
    fill: string;
    percent?: number; // Made optional since it's calculated later
}

// Status colors
const STATUS_COLORS = {
    pending: '#facc15', // yellow-400
    processing: '#3b82f6', // blue-500
    shipping: '#8b5cf6', // violet-500
    confirmed: '#06b6d4', // cyan-500
    completed: '#10b981', // emerald-500
    cancelled: '#ef4444', // red-500
    failed: '#f97316', // orange-500
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ChartDataItem;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{data.name}</p>
                <p className="text-sm" style={{ color: data.fill }}>
                    Số lượng: {data.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tỷ lệ: {data.percent?.toFixed(1)}%
                </p>
            </div>
        );
    }

    return null;
};

// Loading skeleton
const ChartSkeleton = () => (
    <div className="flex items-center justify-center h-full">
        <div className="w-40 h-40 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-gray-300 dark:border-t-gray-500 animate-spin"></div>
    </div>
);

// Legend item type
interface LegendItemProps {
    value: string;
    color: string;
}

// Custom legend component
const CustomizedLegend: React.FC<{
    payload?: LegendItemProps[];
}> = ({ payload }) => {
    if (!payload) return null;

    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                    <div
                        style={{ backgroundColor: entry.color }}
                        className="w-3 h-3 rounded-full mr-1"
                    ></div>
                    <span className="text-textDark dark:text-textLight">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const OrderStatusDistributionChart: React.FC<OrderStatusDistributionChartProps> = ({ statistics, isLoading }) => {
    if (isLoading) {
        return <ChartSkeleton />;
    }

    // Prepare chart data
    const chartData: ChartDataItem[] = [
        { name: 'Chờ xử lý', value: statistics.pendingOrders, fill: STATUS_COLORS.pending },
        { name: 'Đang xử lý', value: statistics.processingOrders, fill: STATUS_COLORS.processing },
        { name: 'Đang giao', value: statistics.shippingOrders, fill: STATUS_COLORS.shipping },
        { name: 'Đã xác nhận', value: statistics.confirmedOrders, fill: STATUS_COLORS.confirmed },
        { name: 'Hoàn thành', value: statistics.completedOrders, fill: STATUS_COLORS.completed },
        { name: 'Đã hủy', value: statistics.cancelledOrders, fill: STATUS_COLORS.cancelled },
        { name: 'Giao thất bại', value: statistics.deliveryFailedOrders, fill: STATUS_COLORS.failed },
    ].filter(item => item.value > 0); // Filter out zero values

    // Calculate percentages for each status
    const total = statistics.totalOrders || 1; // Avoid division by zero
    chartData.forEach(item => {
        item.percent = (item.value / total) * 100;
    });

    return (
        <div className="w-full h-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            outerRadius={80}
                            innerRadius={40}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            content={<CustomizedLegend />}
                            verticalAlign="bottom"
                            align="center"
                            layout="horizontal"
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-secondary dark:text-highlight">
                    Không có dữ liệu trạng thái đơn hàng
                </div>
            )}
        </div>
    );
};

export default OrderStatusDistributionChart;