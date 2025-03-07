import React from 'react';
import { OrderSummaryDTO, OrderStatus } from '@/types';
import { formatPrice } from '@/utils/format';
import OrderActionButtons from './OrderActionButtons';

interface OrderMobileViewProps {
    order: OrderSummaryDTO;
    onView: (order: OrderSummaryDTO) => void;
    onDelete: (order: OrderSummaryDTO) => void;
    onStatusChange: (id: number, newStatus: OrderStatus) => void;
    refreshKey: number;
    getStatusBadgeClass: (status: OrderStatus) => string;
    getStatusIcon: (status: OrderStatus) => JSX.Element;
    getStatusText: (status: OrderStatus) => string;
    formatDate: (dateString: string) => string;
}

const OrderMobileView: React.FC<OrderMobileViewProps> = ({
                                                             order,
                                                             onView,
                                                             onDelete,
                                                             onStatusChange,
                                                             refreshKey,
                                                             getStatusBadgeClass,
                                                             getStatusIcon,
                                                             getStatusText,
                                                             formatDate
                                                         }) => {
    return (
        <div key={`${order.orderId}-${refreshKey}`} className="p-4 bg-white dark:bg-secondary">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            #{order.orderCode}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-textDark dark:text-textLight mt-1">
                        {order.userName}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.userEmail}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                        {formatPrice(order.finalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.itemCount} sản phẩm
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-3">
                <span className={getStatusBadgeClass(order.status)}>
                    <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                    </div>
                </span>

                <OrderActionButtons
                    order={order}
                    onView={onView}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            </div>
        </div>
    );
};

export default OrderMobileView;