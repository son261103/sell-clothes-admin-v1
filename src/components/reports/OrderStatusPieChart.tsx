import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OrderStatisticsDTO {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippingOrders: number;
    confirmedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    deliveryFailedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    monthlyOrders: {
        month: string;
        count: number;
        revenue: number;
    }[];
}

interface OrderStatusPieChartProps {
    statistics: OrderStatisticsDTO;
}

const OrderStatusPieChart: React.FC<OrderStatusPieChartProps> = ({ statistics }) => {
    const data = useMemo(() => {
        return [
            { name: 'Hoàn thành', value: statistics.completedOrders, color: '#10B981' },
            { name: 'Đang giao', value: statistics.shippingOrders, color: '#6366F1' },
            { name: 'Xử lý', value: statistics.processingOrders, color: '#3B82F6' },
            { name: 'Chờ xử lý', value: statistics.pendingOrders, color: '#F59E0B' },
            { name: 'Đã xác nhận', value: statistics.confirmedOrders, color: '#8B5CF6' },
            { name: 'Đã hủy', value: statistics.cancelledOrders, color: '#EF4444' },
            { name: 'Giao thất bại', value: statistics.deliveryFailedOrders, color: '#F97316' },
        ].filter(item => item.value > 0); // Only show status with values > 0
    }, [statistics]);

    const totalValue = useMemo(() =>
            data.reduce((sum, item) => sum + item.value, 0),
        [data]
    );

    // Custom label function that calculates percentage on the fly
    const renderCustomLabel = (props: {
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
        index: number;
        name: string;
        value: number;
    }) => {
        const { name, value } = props;
        const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(0) : '0';
        return `${name}: ${percentage}%`;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Không đủ dữ liệu để hiển thị</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => [`${value} đơn`, 'Số lượng']}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default OrderStatusPieChart;