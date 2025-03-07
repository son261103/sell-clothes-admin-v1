// src/components/order/detail/PaymentStatusButton.tsx
import React from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentStatus } from '@/types';

interface PaymentStatusButtonProps {
    currentStatus: PaymentStatus | null | undefined;
    onClick: () => void;
    disabled?: boolean;
}

const PaymentStatusButton: React.FC<PaymentStatusButtonProps> = ({
                                                                     currentStatus,
                                                                     onClick,
                                                                     disabled = false
                                                                 }) => {
    // Status color helpers
    const getStatusColor = (status?: PaymentStatus | null): string => {
        if (!status) return 'text-yellow-600 dark:text-yellow-400';
        switch (status) {
            case PaymentStatus.PENDING: return 'text-yellow-600 dark:text-yellow-400';
            case PaymentStatus.COMPLETED: return 'text-green-600 dark:text-green-400';
            case PaymentStatus.FAILED: return 'text-red-600 dark:text-red-400';
            case PaymentStatus.REFUNDED: return 'text-blue-600 dark:text-blue-400';
            case PaymentStatus.CANCELLED: return 'text-gray-600 dark:text-gray-400';
            default: return 'text-yellow-600 dark:text-yellow-400';
        }
    };

    const getStatusBgColor = (status?: PaymentStatus | null): string => {
        if (!status) return 'bg-yellow-100 dark:bg-yellow-900/30';
        switch (status) {
            case PaymentStatus.PENDING: return 'bg-yellow-100 dark:bg-yellow-900/30';
            case PaymentStatus.COMPLETED: return 'bg-green-100 dark:bg-green-900/30';
            case PaymentStatus.FAILED: return 'bg-red-100 dark:bg-red-900/30';
            case PaymentStatus.REFUNDED: return 'bg-blue-100 dark:bg-blue-900/30';
            case PaymentStatus.CANCELLED: return 'bg-gray-100 dark:bg-gray-700';
            default: return 'bg-yellow-100 dark:bg-yellow-900/30';
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex justify-center h-9 px-3 text-sm rounded-md 
                ${getStatusBgColor(currentStatus)} 
                ${getStatusColor(currentStatus)} 
                hover:opacity-80 items-center gap-1.5 
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <CreditCard className="w-4 h-4" />
            <span>Cập nhật thanh toán</span>
        </button>
    );
};

export default PaymentStatusButton;