import React from 'react';
import {
    Clock,
    CheckCheck,
    Truck,
    PackageCheck,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderStatusWorkflowPopupProps {
    isOpen: boolean;
    currentStatus: OrderStatus;
    onClose: () => void;
    onStatusChange: (newStatus: OrderStatus) => void;
}

const OrderStatusWorkflowPopup: React.FC<OrderStatusWorkflowPopupProps> = ({
                                                                               isOpen,
                                                                               currentStatus,
                                                                               onClose,
                                                                               onStatusChange
                                                                           }) => {
    if (!isOpen) return null;

    // Define all statuses in workflow order
    const statusFlow = [
        {
            status: OrderStatus.PENDING,
            label: 'Chờ xử lý',
            icon: Clock,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500',
            bgLightColor: 'bg-yellow-100'
        },
        {
            status: OrderStatus.PROCESSING,
            label: 'Đang xử lý',
            icon: CheckCheck,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500',
            bgLightColor: 'bg-blue-100'
        },
        {
            status: OrderStatus.SHIPPING,
            label: 'Đang giao hàng',
            icon: Truck,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500',
            bgLightColor: 'bg-indigo-100'
        },
        {
            status: OrderStatus.CONFIRMED,
            label: 'Đã xác nhận',
            icon: PackageCheck,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500',
            bgLightColor: 'bg-purple-100'
        },
        {
            status: OrderStatus.COMPLETED,
            label: 'Hoàn thành',
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500',
            bgLightColor: 'bg-green-100'
        }
    ];

    // Add special statuses that aren't in the normal flow
    const specialStatuses = [
        {
            status: OrderStatus.DELIVERY_FAILED,
            label: 'Giao hàng thất bại',
            icon: AlertTriangle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500',
            bgLightColor: 'bg-orange-100'
        },
        {
            status: OrderStatus.CANCELLED,
            label: 'Đã hủy',
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500',
            bgLightColor: 'bg-red-100'
        }
    ];

    // Find index of current status in the flow
    const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);

    // Check if current status is a special status
    const isSpecialStatus = specialStatuses.some(s => s.status === currentStatus);

    // Handle status change click
    const handleStatusClick = (status: OrderStatus) => {
        onStatusChange(status);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                {/* Center modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-6 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Cập nhật trạng thái đơn hàng
                                </h3>

                                <div className="mt-6">
                                    {/* Regular status workflow */}
                                    <div className="relative">
                                        {/* Connection line */}
                                        <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"></div>

                                        {/* Active line based on current status */}
                                        {!isSpecialStatus && currentIndex >= 0 && (
                                            <div
                                                className={`absolute top-7 left-0 h-1 transition-all duration-500 ${statusFlow[currentIndex].bgColor}`}
                                                style={{ width: `${(currentIndex / (statusFlow.length - 1)) * 100}%` }}
                                            ></div>
                                        )}

                                        {/* Status circles */}
                                        <div className="flex justify-between relative z-10">
                                            {statusFlow.map((status, index) => {
                                                // Determine if this status is active, completed, or upcoming
                                                const isActive = status.status === currentStatus;
                                                const isCompleted = !isSpecialStatus && currentIndex > index;
                                                const isClickable = !isSpecialStatus && (isActive || currentIndex + 1 >= index);

                                                // Style based on status
                                                const circleClasses = isActive || isCompleted
                                                    ? `${status.bgColor} text-white dark:text-white border-2 border-white dark:border-gray-800`
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400';

                                                const textClasses = isActive
                                                    ? `font-semibold ${status.color}`
                                                    : isCompleted
                                                        ? 'font-medium text-gray-700 dark:text-gray-300'
                                                        : 'text-gray-500 dark:text-gray-400';

                                                const IconComponent = status.icon;

                                                return (
                                                    <div key={status.status} className="flex flex-col items-center">
                                                        <button
                                                            onClick={() => isClickable && handleStatusClick(status.status)}
                                                            disabled={!isClickable}
                                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                                                                ${circleClasses} ${isClickable ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-70'}`}
                                                        >
                                                            <IconComponent className="w-7 h-7" />
                                                        </button>
                                                        <p className={`mt-2 text-xs ${textClasses}`}>{status.label}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Special statuses */}
                                    <div className="mt-10 border-t pt-6 border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                            Trạng thái đặc biệt
                                        </h4>

                                        <div className="flex justify-center gap-8">
                                            {specialStatuses.map((status) => {
                                                const isActive = status.status === currentStatus;
                                                const IconComponent = status.icon;

                                                return (
                                                    <div key={status.status} className="flex flex-col items-center">
                                                        <button
                                                            onClick={() => handleStatusClick(status.status)}
                                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                                                                ${isActive ? `${status.bgColor} text-white dark:text-white` : `${status.bgLightColor} ${status.color}`} 
                                                                cursor-pointer hover:opacity-90 border-2 border-white dark:border-gray-800`}
                                                        >
                                                            <IconComponent className="w-7 h-7" />
                                                        </button>
                                                        <p className={`mt-2 text-xs ${isActive ? `font-semibold ${status.color}` : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {status.label}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusWorkflowPopup;