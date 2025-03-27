import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyOrder {
    month: string;
    count: number;
    revenue: number;
}

interface SalesBarChartProps {
    data: MonthlyOrder[];
}

const SalesBarChart: React.FC<SalesBarChartProps> = ({ data }) => {
    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Get the data for the current year and the previous year
    const currentYearData = data.filter(item => {
        const year = parseInt(item.month.split('-')[0]);
        const currentYear = new Date().getFullYear();
        return year === currentYear;
    });

    const previousYearData = data.filter(item => {
        const year = parseInt(item.month.split('-')[0]);
        const previousYear = new Date().getFullYear() - 1;
        return year === previousYear;
    });

    // Combine the data for comparison
    const combinedData = currentYearData.map(item => {
        const [ month] = item.month.split('-');
        const monthNum = parseInt(month);

        // Find the corresponding month in the previous year
        const prevYearItem = previousYearData.find(prev => {
            const [ prevMonth] = prev.month.split('-');
            return parseInt(prevMonth) === monthNum;
        });

        return {
            name: `Tháng ${monthNum}`,
            currentYear: item.revenue,
            previousYear: prevYearItem ? prevYearItem.revenue : 0
        };
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={combinedData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh số']}
                    labelFormatter={(label) => label}
                />
                <Legend />
                <Bar name="Năm nay" dataKey="currentYear" fill="#3B82F6" />
                <Bar name="Năm trước" dataKey="previousYear" fill="#9CA3AF" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesBarChart;