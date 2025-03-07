// src/components/order/detail/OrderDetailHeader.tsx
import React from 'react';
import { ShoppingBag, ArrowLeft, Printer, Edit, Clock, Truck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { OrderResponse, OrderStatus } from '@/types';

interface OrderDetailHeaderProps {
    orderCode: string;
    order: OrderResponse;
    onBack: () => void;
    onPrint: () => void;
    onEdit: () => void;
    onStatusChange: () => void;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
                                                                 orderCode,
                                                                 order,
                                                                 onBack,
                                                                 onPrint,
                                                                 onEdit,
                                                                 onStatusChange
                                                             }) => {
    // Status color helpers
    const getStatusColor = (status?: OrderStatus): string => {
        if (!status) return 'text-gray-600 dark:text-gray-400';
        switch (status) {
            case OrderStatus.PENDING: return 'text-yellow-600 dark:text-yellow-400';
            case OrderStatus.PROCESSING: return 'text-blue-600 dark:text-blue-400';
            case OrderStatus.SHIPPING: return 'text-indigo-600 dark:text-indigo-400';
            case OrderStatus.CONFIRMED: return 'text-purple-600 dark:text-purple-400';
            case OrderStatus.COMPLETED: return 'text-green-600 dark:text-green-400';
            case OrderStatus.DELIVERY_FAILED: return 'text-orange-600 dark:text-orange-400';
            case OrderStatus.CANCELLED: return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusBgColor = (status?: OrderStatus): string => {
        if (!status) return 'bg-gray-100 dark:bg-gray-700';
        switch (status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 dark:bg-yellow-900/30';
            case OrderStatus.PROCESSING: return 'bg-blue-100 dark:bg-blue-900/30';
            case OrderStatus.SHIPPING: return 'bg-indigo-100 dark:bg-indigo-900/30';
            case OrderStatus.CONFIRMED: return 'bg-purple-100 dark:bg-purple-900/30';
            case OrderStatus.COMPLETED: return 'bg-green-100 dark:bg-green-900/30';
            case OrderStatus.DELIVERY_FAILED: return 'bg-orange-100 dark:bg-orange-900/30';
            case OrderStatus.CANCELLED: return 'bg-red-100 dark:bg-red-900/30';
            default: return 'bg-gray-100 dark:bg-gray-700';
        }
    };

    const getStatusIcon = (status?: OrderStatus): JSX.Element => {
        if (!status) return <Clock className="w-5 h-5" />;
        switch (status) {
            case OrderStatus.PENDING: return <Clock className="w-5 h-5" />;
            case OrderStatus.PROCESSING: return <Clock className="w-5 h-5" />;
            case OrderStatus.SHIPPING: return <Truck className="w-5 h-5" />;
            case OrderStatus.CONFIRMED: return <CheckCircle className="w-5 h-5" />;
            case OrderStatus.COMPLETED: return <CheckCircle className="w-5 h-5" />;
            case OrderStatus.DELIVERY_FAILED: return <AlertTriangle className="w-5 h-5" />;
            case OrderStatus.CANCELLED: return <XCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b" data-aos="fade-down">
            <div>
                <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    Chi tiết đơn hàng {orderCode}
                </h1>
                <p className="text-sm text-secondary dark:text-highlight">
                    Xem thông tin chi tiết đơn hàng
                </p>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                </button>
                <button
                    onClick={onPrint}
                    className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 items-center gap-1.5"
                >
                    <Printer className="w-4 h-4" />
                    <span>In</span>
                </button>
                <button
                    onClick={onEdit}
                    className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 items-center gap-1.5"
                >
                    <Edit className="w-4 h-4" />
                    <span>Sửa</span>
                </button>
                <button
                    onClick={onStatusChange}
                    className={`inline-flex justify-center h-9 px-3 text-sm rounded-md ${getStatusBgColor(order.status)} ${getStatusColor(order.status)} hover:opacity-80 items-center gap-1.5`}
                >
                    {getStatusIcon(order.status)}
                    <span>Cập nhật trạng thái</span>
                </button>
            </div>
        </div>
    );
};

export default OrderDetailHeader;