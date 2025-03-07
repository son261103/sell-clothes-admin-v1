// src/components/order/detail/OrderCustomerInfo.tsx
import React from 'react';
import { User } from 'lucide-react';
import { OrderResponse } from '@/types';
import { formatDate } from '@/utils/format.tsx';

interface OrderCustomerInfoProps {
    order: OrderResponse;
}

const OrderCustomerInfo: React.FC<OrderCustomerInfoProps> = ({ order }) => {

    // Use indexing to access properties that might not be in the type definition
    // but exist at runtime
    const anyOrder = order as any;

    // Try to get customer info from multiple possible sources in priority order
    const customerName =
        (anyOrder.user?.fullName || anyOrder.user?.name) ||
        (anyOrder.address?.fullName) ||
        order.userName ||
        'Khách hàng';

    const customerEmail =
        anyOrder.user?.email ||
        order.userEmail ||
        'Chưa có thông tin';

    const customerPhone =
        anyOrder.user?.phone ||
        anyOrder.user?.phoneNumber ||
        (anyOrder.address?.phone || anyOrder.address?.phoneNumber) ||
        order.userPhone ||
        'Chưa có thông tin';

    console.log('Final customer info being displayed:', {
        customerName,
        customerEmail,
        customerPhone
    });

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-secondary">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                <User className="w-4 h-4 text-primary" />
                Thông tin khách hàng
            </h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customerEmail}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">SĐT:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customerPhone}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
                    <span className="text-sm text-primary font-medium">{order.orderCode || `#${order.orderId}`}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt hàng:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ngày cập nhật:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(order.updatedAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderCustomerInfo;