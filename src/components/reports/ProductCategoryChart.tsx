import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Sample data for categories - in a real app, this would come from props
const DEFAULT_DATA = [
    { name: 'Thời trang nữ', value: 42, color: '#EF4444' },
    { name: 'Thời trang nam', value: 28, color: '#3B82F6' },
    { name: 'Phụ kiện', value: 18, color: '#F59E0B' },
    { name: 'Giày dép', value: 12, color: '#10B981' },
];

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface ProductCategoryChartProps {
    data?: CategoryData[];
}

const ProductCategoryChart: React.FC<ProductCategoryChartProps> = ({ data = DEFAULT_DATA }) => {
    // Format value as percentage
    const formatPercent = (value: number) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percent = (value / total) * 100;
        return `${percent.toFixed(1)}%`;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatPercent(value)}`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => [formatPercent(value), 'Tỷ lệ']}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ProductCategoryChart;