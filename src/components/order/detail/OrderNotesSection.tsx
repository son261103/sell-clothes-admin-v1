// src/components/order/detail/OrderNotesSection.tsx
import React from 'react';
import { FileText } from 'lucide-react';

interface OrderNotesSectionProps {
    note: string;
}

const OrderNotesSection: React.FC<OrderNotesSectionProps> = ({ note }) => {
    if (!note) return null;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-white dark:bg-secondary">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                <FileText className="w-4 h-4 text-primary" />
                Ghi chú đơn hàng
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">{note}</p>
        </div>
    );
};

export default OrderNotesSection;