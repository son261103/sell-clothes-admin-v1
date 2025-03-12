import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Truck, PackageCheck, AlertTriangle, XSquare } from 'lucide-react';
import { OrderSummaryDTO, OrderStatus, PaymentStatus, PageResponse } from '@/types';
import Pagination from '../common/Pagination';
import { formatPrice } from '@/utils/format';

// Components
import OrderActionButtons from './order-list/OrderActionButtons.tsx';
import OrderLoading from './order-list/OrderLoading.tsx';
import OrderEmptyState from './order-list/OrderEmptyState.tsx';

// Extended type that adds missing properties to the OrderSummaryDTO
interface ExtendedOrderSummaryDTO extends Omit<OrderSummaryDTO, 'totalItems'> {
    totalItems: number;
    userPhone?: string;
}

// Define a type for the response that includes our extended DTO
type OrderPageResponseExtended = PageResponse<ExtendedOrderSummaryDTO>;

interface OrderDataTableProps {
    orders: OrderPageResponseExtended;
    onDeleteOrder: (id: number) => void;
    onViewOrder: (order: OrderSummaryDTO) => void;
    onStatusChange: (id: number, newStatus: OrderStatus) => void;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    forceRefresh?: number;
}

const OrderDataTable: React.FC<OrderDataTableProps> = ({
                                                           orders,
                                                           onDeleteOrder,
                                                           onViewOrder,
                                                           onStatusChange,
                                                           isLoading,
                                                           onRefresh,
                                                           isMobileView,
                                                           onPageChange,
                                                           onPageSizeChange,
                                                           forceRefresh = 0
                                                       }) => {
    const [localRefreshCounter, setLocalRefreshCounter] = useState(0);
    const [hasReceivedData, setHasReceivedData] = useState(false);

    // Debug logging
    useEffect(() => {
        if (orders?.content?.length > 0) {
            console.log('Received order data sample:', orders.content[0]);
        }
    }, [orders]);

    useEffect(() => {
        setLocalRefreshCounter(prev => prev + 1);

        // Track if we've received valid data
        if (orders && orders.content && orders.content.length > 0) {
            setHasReceivedData(true);
        }
    }, [orders, forceRefresh]);

    const handleDeleteClick = (order: ExtendedOrderSummaryDTO) => {
        onDeleteOrder(order.orderId);
    };

    const getStatusBadgeClass = (status: OrderStatus): string => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";

        switch (status) {
            case OrderStatus.PENDING:
                return `${baseClasses} text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400`;
            case OrderStatus.PROCESSING:
                return `${baseClasses} text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400`;
            case OrderStatus.SHIPPING:
                return `${baseClasses} text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400`;
            case OrderStatus.CONFIRMED:
                return `${baseClasses} text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400`;
            case OrderStatus.COMPLETED:
                return `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`;
            case OrderStatus.DELIVERY_FAILED:
                return `${baseClasses} text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400`;
            case OrderStatus.CANCELLED:
                return `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400`;
        }
    };

    const getPaymentStatusBadgeClass = (status?: PaymentStatus): string => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";

        if (!status) return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400`;

        switch (status) {
            case PaymentStatus.PENDING:
                return `${baseClasses} text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400`;
            case PaymentStatus.COMPLETED:
                return `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`;
            case PaymentStatus.FAILED:
                return `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400`;
        }
    };

    const getStatusIcon = (status: OrderStatus): JSX.Element => {
        switch (status) {
            case OrderStatus.PENDING:
                return <Clock className="w-3 h-3" />;
            case OrderStatus.PROCESSING:
                return <CheckCircle className="w-3 h-3" />;
            case OrderStatus.SHIPPING:
                return <Truck className="w-3 h-3" />;
            case OrderStatus.CONFIRMED:
                return <PackageCheck className="w-3 h-3" />;
            case OrderStatus.COMPLETED:
                return <CheckCircle className="w-3 h-3" />;
            case OrderStatus.DELIVERY_FAILED:
                return <AlertTriangle className="w-3 h-3" />;
            case OrderStatus.CANCELLED:
                return <XSquare className="w-3 h-3" />;
            default:
                return <XCircle className="w-3 h-3" />;
        }
    };

    const getStatusText = (status: OrderStatus): string => {
        switch (status) {
            case OrderStatus.PENDING:
                return "Chờ xử lý";
            case OrderStatus.PROCESSING:
                return "Đang xử lý";
            case OrderStatus.SHIPPING:
                return "Đang giao hàng";
            case OrderStatus.CONFIRMED:
                return "Đã xác nhận";
            case OrderStatus.COMPLETED:
                return "Hoàn thành";
            case OrderStatus.DELIVERY_FAILED:
                return "Giao hàng thất bại";
            case OrderStatus.CANCELLED:
                return "Đã hủy";
            default:
                return "Không xác định";
        }
    };

    const getPaymentStatusText = (status?: PaymentStatus): string => {
        if (!status) return "Không xác định";

        switch (status) {
            case PaymentStatus.PENDING:
                return "Chờ thanh toán";
            case PaymentStatus.COMPLETED:
                return "Đã thanh toán";
            case PaymentStatus.FAILED:
                return "Thanh toán thất bại";
            default:
                return "Không xác định";
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    // Format username with fallback
    const formatUsername = (order: ExtendedOrderSummaryDTO): string => {
        if (order.userName && order.userName !== 'Khách hàng') {
            return order.userName;
        }
        return 'Khách hàng';
    };

    // Format email with fallback
    const formatEmail = (order: ExtendedOrderSummaryDTO): string => {
        if (order.userEmail && order.userEmail !== 'Không có email') {
            return order.userEmail;
        }
        return 'Không có email';
    };

    // Format phone with fallback
    const formatPhone = (order: ExtendedOrderSummaryDTO): string => {
        if (order.userPhone && order.userPhone !== '') {
            return order.userPhone;
        }
        return 'Không có SĐT';
    };

    // Get product count text
    const getProductCountText = (order: ExtendedOrderSummaryDTO): string => {
        if (order.totalItems > 0) {
            return `${order.totalItems} sản phẩm`;
        } else if (order.itemCount > 0) {
            return `${order.itemCount} sản phẩm`;
        }
        return "0 sản phẩm";
    };

    // If we're loading and have never received data, show the loading component
    if (isLoading && !hasReceivedData) {
        return <OrderLoading />;
    }

    // Check if we have valid data to display
    const hasContent = orders && orders.content && orders.content.length > 0;

    // If we don't have content (either loading or empty), show appropriate component
    if (!hasContent) {
        // If loading but we previously had data, show loading overlay within existing content
        // Otherwise, show empty state
        return <OrderEmptyState onRefresh={onRefresh} />;
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.content.map((order) => (
                        <div key={`${order.orderId}-${localRefreshCounter}`} className="p-4 bg-white dark:bg-secondary">
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
                                        {formatUsername(order)}
                                    </h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatEmail(order)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatPhone(order)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-primary">
                                        {formatPrice(order.finalAmount)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {getProductCountText(order)}
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
                                    onView={() => onViewOrder(order)}
                                    onDelete={() => handleDeleteClick(order)}
                                    onStatusChange={onStatusChange}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={orders.number}
                        totalPages={orders.totalPages}
                        onPageChange={onPageChange}
                        pageSize={orders.size}
                        totalElements={orders.totalElements}
                        onPageSizeChange={onPageSizeChange}
                    />
                </div>

                {/* Loading Overlay */}
                {isLoading && <OrderLoading type="overlay" />}
            </div>
        );
    }

    return (
        <div className="relative bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="w-16 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700 rounded-tl-xl">ID</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-left border-r border-gray-200 dark:border-gray-700">Mã đơn hàng</th>
                        <th className="w-48 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-left border-r border-gray-200 dark:border-gray-700">Thông tin khách hàng</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Ngày tạo</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-right border-r border-gray-200 dark:border-gray-700">Tổng tiền</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Số lượng</th>
                        <th className="w-36 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Trạng thái</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center rounded-tr-xl">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.content.map((order) => (
                        <tr
                            key={`${order.orderId}-${localRefreshCounter}`}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                                        transition-colors duration-200 border-b border-gray-200
                                        dark:border-gray-700"
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-textDark dark:text-textLight text-center">
                                    {order.orderId}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-textDark dark:text-textLight">
                                    {order.orderCode ? `ORD-${order.orderCode}` : `ORD-${order.orderId}`}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-medium text-textDark dark:text-textLight">
                                        {formatUsername(order)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatEmail(order)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatPhone(order)}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                                    {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-primary text-right">
                                    {typeof order.totalAmount === 'number' ? formatPrice(order.totalAmount) :
                                        typeof order.finalAmount === 'number' ? formatPrice(order.finalAmount) : 'N/A'}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-center">
                                    {getProductCountText(order)}
                                </div>
                            </td>
                            <td className="py-1 px-1 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col items-center gap-1">
                                    <span className={getStatusBadgeClass(order.status)}>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(order.status)}
                                            <span>{getStatusText(order.status)}</span>
                                        </div>
                                    </span>
                                    {order.paymentStatus && (
                                        <span className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                                            {getPaymentStatusText(order.paymentStatus)}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex justify-center">
                                    <OrderActionButtons
                                        order={order}
                                        onView={() => onViewOrder(order)}
                                        onDelete={() => handleDeleteClick(order)}
                                        onStatusChange={onStatusChange}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                    currentPage={orders.number || 0}
                    totalPages={orders.totalPages || 1}
                    onPageChange={onPageChange}
                    pageSize={orders.size || 10}
                    totalElements={orders.totalElements || 0}
                    onPageSizeChange={onPageSizeChange}
                />
            </div>

            {/* Loading Overlay */}
            {isLoading && <OrderLoading type="overlay" />}
        </div>
    );
};

export default OrderDataTable;