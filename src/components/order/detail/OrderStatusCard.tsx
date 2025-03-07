// src/components/order/detail/OrderStatusCard.tsx
import React, { useMemo } from 'react';
import { Calendar, CreditCard, Clock, Truck, CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { OrderStatus, PaymentStatus, PaymentResponseDTO } from '@/types';
import { formatDate } from '../../../utils/format';

interface OrderStatusCardProps {
    orderStatus: OrderStatus;
    paymentStatus?: PaymentStatus | null;
    paymentDetails?: PaymentResponseDTO | null; // Thêm paymentDetails để truy cập lịch sử thanh toán
    createdAt: string;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
                                                             orderStatus,
                                                             paymentStatus,
                                                             paymentDetails,
                                                             createdAt
                                                         }) => {
    // Xử lý lịch sử thanh toán, sắp xếp theo thời gian mới nhất
    const sortedHistories = useMemo(() => {
        if (!paymentDetails?.histories || !Array.isArray(paymentDetails.histories)) {
            return [];
        }

        return [...paymentDetails.histories].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
        });
    }, [paymentDetails?.histories]);

    // Lấy trạng thái thanh toán mới nhất từ lịch sử (nếu có)
    const latestHistoryStatus = sortedHistories.length > 0 ? sortedHistories[0].status : null;

    // Ưu tiên sử dụng trạng thái từ lịch sử mới nhất nếu có
    const displayPaymentStatus = latestHistoryStatus || paymentStatus || PaymentStatus.PENDING;

    // Status color helpers from original file
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

    const getStatusText = (status?: OrderStatus): string => {
        if (!status) return "Chờ xử lý";
        switch (status) {
            case OrderStatus.PENDING: return "Chờ xử lý";
            case OrderStatus.PROCESSING: return "Đang xử lý";
            case OrderStatus.SHIPPING: return "Đang giao hàng";
            case OrderStatus.CONFIRMED: return "Đã xác nhận";
            case OrderStatus.COMPLETED: return "Hoàn thành";
            case OrderStatus.DELIVERY_FAILED: return "Giao hàng thất bại";
            case OrderStatus.CANCELLED: return "Đã hủy";
            default: return "Chờ xử lý";
        }
    };

    const getPaymentStatusText = (status?: PaymentStatus | null): string => {
        if (!status) return "Chờ thanh toán";
        switch (status) {
            case PaymentStatus.PENDING: return "Chờ thanh toán";
            case PaymentStatus.PROCESSING: return "Đang xử lý";
            case PaymentStatus.COMPLETED: return "Đã thanh toán";
            case PaymentStatus.FAILED: return "Thanh toán thất bại";
            case PaymentStatus.REFUNDED: return "Đã hoàn tiền";
            case PaymentStatus.CANCELLED: return "Đã hủy thanh toán";
            default: return "Chờ thanh toán";
        }
    };

    const getPaymentStatusColor = (status?: PaymentStatus | null): string => {
        if (!status) return 'text-yellow-600 dark:text-yellow-400';
        switch (status) {
            case PaymentStatus.PENDING: return 'text-yellow-600 dark:text-yellow-400';
            case PaymentStatus.PROCESSING: return 'text-blue-600 dark:text-blue-400';
            case PaymentStatus.COMPLETED: return 'text-green-600 dark:text-green-400';
            case PaymentStatus.FAILED: return 'text-red-600 dark:text-red-400';
            case PaymentStatus.REFUNDED: return 'text-blue-600 dark:text-blue-400';
            case PaymentStatus.CANCELLED: return 'text-gray-600 dark:text-gray-400';
            default: return 'text-yellow-600 dark:text-yellow-400';
        }
    };

    const getPaymentStatusIcon = (status?: PaymentStatus | null): JSX.Element => {
        if (!status) return <CreditCard className="w-5 h-5" />;
        switch (status) {
            case PaymentStatus.PENDING: return <Clock className="w-5 h-5" />;
            case PaymentStatus.PROCESSING: return <Clock className="w-5 h-5" />;
            case PaymentStatus.COMPLETED: return <CheckCircle className="w-5 h-5" />;
            case PaymentStatus.FAILED: return <AlertTriangle className="w-5 h-5" />;
            case PaymentStatus.REFUNDED: return <RotateCcw className="w-5 h-5" />;
            case PaymentStatus.CANCELLED: return <XCircle className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    return (
        <div className={`${getStatusBgColor(orderStatus)} p-4 rounded-lg mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(orderStatus)} bg-white dark:bg-gray-800`}>
                        {getStatusIcon(orderStatus)}
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">Trạng thái đơn hàng</div>
                        <div className={`text-lg font-medium ${getStatusColor(orderStatus)}`}>{getStatusText(orderStatus)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 ${getPaymentStatusColor(displayPaymentStatus)}`}>
                        {getPaymentStatusIcon(displayPaymentStatus)}
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">Trạng thái thanh toán</div>
                        <div className={`font-medium ${getPaymentStatusColor(displayPaymentStatus)}`}>
                            {getPaymentStatusText(displayPaymentStatus)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 text-primary">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">Ngày tạo đơn</div>
                        <div className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(createdAt)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusCard;