// src/components/order/detail/PaymentStatusWorkflowPopup.tsx
import React from 'react';
import { X, CreditCard, CheckCircle, AlertTriangle, RotateCcw, XCircle } from 'lucide-react';
import { PaymentStatus } from '@/types';

interface PaymentStatusWorkflowPopupProps {
    isOpen: boolean;
    currentStatus: PaymentStatus | null | undefined;
    onClose: () => void;
    onStatusChange: (newStatus: PaymentStatus) => void;
}

const PaymentStatusWorkflowPopup: React.FC<PaymentStatusWorkflowPopupProps> = ({
                                                                                   isOpen,
                                                                                   currentStatus,
                                                                                   onClose,
                                                                                   onStatusChange
                                                                               }) => {
    if (!isOpen) return null;

    // Status configuration
    const statusOptions = [
        {
            status: PaymentStatus.PENDING,
            label: 'Chờ thanh toán',
            icon: <CreditCard className="w-5 h-5" />,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
            status: PaymentStatus.COMPLETED,
            label: 'Đã thanh toán',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30'
        },
        {
            status: PaymentStatus.FAILED,
            label: 'Thanh toán thất bại',
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            status: PaymentStatus.REFUNDED,
            label: 'Đã hoàn tiền',
            icon: <RotateCcw className="w-5 h-5" />,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            status: PaymentStatus.CANCELLED,
            label: 'Đã hủy thanh toán',
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-700'
        }
    ];

    // Determine available transitions based on current status
    // This is a simplified workflow - you might want to customize this based on your business rules
    const getAvailableTransitions = (status: PaymentStatus | null | undefined): PaymentStatus[] => {
        if (!status) return [PaymentStatus.PENDING, PaymentStatus.COMPLETED, PaymentStatus.FAILED];

        switch (status) {
            case PaymentStatus.PENDING:
                return [PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.CANCELLED];
            case PaymentStatus.COMPLETED:
                return [PaymentStatus.REFUNDED];
            case PaymentStatus.FAILED:
                return [PaymentStatus.PENDING, PaymentStatus.CANCELLED];
            case PaymentStatus.REFUNDED:
            case PaymentStatus.CANCELLED:
                return [PaymentStatus.PENDING];
            default:
                return [];
        }
    };

    const availableTransitions = getAvailableTransitions(currentStatus);

    const handleStatusClick = (status: PaymentStatus) => {
        onStatusChange(status);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Cập nhật trạng thái thanh toán
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Trạng thái thanh toán hiện tại:
                    </p>
                    {statusOptions.map(option =>
                            option.status === currentStatus && (
                                <div
                                    key={option.status}
                                    className={`flex items-center gap-2 p-2 rounded-md ${option.bgColor}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.color} bg-white dark:bg-gray-800`}>
                                        {option.icon}
                                    </div>
                                    <span className={`font-medium ${option.color}`}>{option.label}</span>
                                </div>
                            )
                    )}
                </div>

                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Chọn trạng thái mới:
                    </p>
                    <div className="space-y-2">
                        {statusOptions
                            .filter(option => availableTransitions.includes(option.status) && option.status !== currentStatus)
                            .map(option => (
                                <button
                                    key={option.status}
                                    onClick={() => handleStatusClick(option.status)}
                                    className={`flex items-center gap-2 p-3 w-full rounded-md border border-gray-200 dark:border-gray-700 hover:${option.bgColor} transition-colors`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.color} bg-white dark:bg-gray-800`}>
                                        {option.icon}
                                    </div>
                                    <span className="font-medium">{option.label}</span>
                                </button>
                            ))}

                        {availableTransitions.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                                Không có trạng thái mới có thể chuyển đổi từ trạng thái hiện tại.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusWorkflowPopup;