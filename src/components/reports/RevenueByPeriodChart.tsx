import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyOrder {
    month: string;
    count: number;
    revenue: number;
}

interface RevenueByPeriodChartProps {
    data: MonthlyOrder[];
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

const RevenueByPeriodChart: React.FC<RevenueByPeriodChartProps> = ({ data }) => {
    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                />
                <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.2}
                    activeDot={{ r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default RevenueByPeriodChart;