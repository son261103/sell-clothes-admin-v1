// src/components/order/detail/OrderPaymentInfo.tsx
import React, { useMemo } from 'react';
import { CreditCard, Clock, CheckCircle, AlertTriangle, XCircle, RotateCcw, ArrowUpRight } from 'lucide-react';
import { PaymentResponseDTO, PaymentStatus, PaymentMethodType } from '@/types';
import { formatPrice, formatDate } from '@/utils/format.tsx';

interface OrderPaymentInfoProps {
    paymentDetails?: PaymentResponseDTO | null;
    totalAmount: number;
    onUpdateStatus?: () => void;
}

const OrderPaymentInfo: React.FC<OrderPaymentInfoProps> = ({
                                                               paymentDetails,
                                                               totalAmount,
                                                               onUpdateStatus
                                                           }) => {
    // Payment status helpers
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

    const getPaymentStatusBgColor = (status?: PaymentStatus | null): string => {
        if (!status) return 'bg-yellow-100 dark:bg-yellow-900/30';
        switch (status) {
            case PaymentStatus.PENDING: return 'bg-yellow-100 dark:bg-yellow-900/30';
            case PaymentStatus.PROCESSING: return 'bg-blue-100 dark:bg-blue-900/30';
            case PaymentStatus.COMPLETED: return 'bg-green-100 dark:bg-green-900/30';
            case PaymentStatus.FAILED: return 'bg-red-100 dark:bg-red-900/30';
            case PaymentStatus.REFUNDED: return 'bg-blue-100 dark:bg-blue-900/30';
            case PaymentStatus.CANCELLED: return 'bg-gray-100 dark:bg-gray-700';
            default: return 'bg-yellow-100 dark:bg-yellow-900/30';
        }
    };

    const getPaymentStatusIcon = (status?: PaymentStatus | null): JSX.Element => {
        if (!status) return <Clock className="w-4 h-4" />;
        switch (status) {
            case PaymentStatus.PENDING: return <Clock className="w-4 h-4" />;
            case PaymentStatus.PROCESSING: return <Clock className="w-4 h-4" />;
            case PaymentStatus.COMPLETED: return <CheckCircle className="w-4 h-4" />;
            case PaymentStatus.FAILED: return <AlertTriangle className="w-4 h-4" />;
            case PaymentStatus.REFUNDED: return <RotateCcw className="w-4 h-4" />;
            case PaymentStatus.CANCELLED: return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getPaymentMethodIcon = (methodType?: PaymentMethodType | string | null): JSX.Element => {
        if (!methodType) return <CreditCard className="w-4 h-4" />;

        // You can expand this to include more specific icons for different payment methods
        switch (methodType.toUpperCase()) {
            case 'COD':
                return <CreditCard className="w-4 h-4" />;
            case 'BANK_TRANSFER':
                return <CreditCard className="w-4 h-4" />;
            case 'VNPAY':
                return <CreditCard className="w-4 h-4" />;
            case 'MOMO':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <CreditCard className="w-4 h-4" />;
        }
    };

    // Xử lý hiển thị lịch sử thanh toán, sắp xếp theo thời gian mới nhất
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

    // Get display values with fallbacks
    const displayAmount = paymentDetails?.amount || totalAmount;
    const displayMethod = paymentDetails?.methodName || 'Thanh toán khi nhận hàng (COD)';

    // Lấy trạng thái từ lịch sử mới nhất (nếu có) hoặc từ paymentDetails
    const latestHistoryStatus = sortedHistories.length > 0 ? sortedHistories[0].status : null;

    // *** QUAN TRỌNG: Ưu tiên sử dụng trạng thái từ lịch sử mới nhất nếu có
    // Điều này giải quyết vấn đề khi paymentDetails.status không được cập nhật
    // nhưng lịch sử thanh toán đã được cập nhật
    const displayStatus = latestHistoryStatus || paymentDetails?.status || PaymentStatus.PENDING;

    // Log để debug
    console.log('Payment Info - Original status:', paymentDetails?.status);
    console.log('Payment Info - Latest history status:', latestHistoryStatus);
    console.log('Payment Info - Display status (after logic):', displayStatus);
    console.log('Payment Info - All histories:', sortedHistories);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-secondary">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Thông tin thanh toán
                </h3>

                {onUpdateStatus && (
                    <button
                        onClick={onUpdateStatus}
                        className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                        Cập nhật <ArrowUpRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-md ${getPaymentStatusBgColor(displayStatus)} mb-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPaymentStatusColor(displayStatus)} bg-white dark:bg-gray-800`}>
                    {getPaymentStatusIcon(displayStatus)}
                </div>
                <span className={`font-medium ${getPaymentStatusColor(displayStatus)}`}>
                    {getPaymentStatusText(displayStatus)}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phương thức:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                        {getPaymentMethodIcon(paymentDetails?.methodCode)}
                        {displayMethod}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Số tiền:</span>
                    <span className="text-sm text-primary font-medium">{formatPrice(displayAmount)}</span>
                </div>

                {paymentDetails?.transactionCode && (
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mã giao dịch:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{paymentDetails.transactionCode}</span>
                    </div>
                )}

                {paymentDetails?.paymentUrl && (
                    <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Link thanh toán:</span>
                        <a
                            href={paymentDetails.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline truncate max-w-[250px] flex items-center gap-1"
                        >
                            Xem <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                )}

                {paymentDetails?.createdAt && (
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(paymentDetails.createdAt)}</span>
                    </div>
                )}

                {paymentDetails?.updatedAt && (
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Cập nhật cuối:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(paymentDetails.updatedAt)}</span>
                    </div>
                )}

                {sortedHistories.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Lịch sử thanh toán</h4>
                        <div className="space-y-2">
                            {sortedHistories.slice(0, 3).map((history, index) => (
                                <div key={index} className="flex justify-between text-xs">
                                    <span className={getPaymentStatusColor(history.status)}>
                                        {getPaymentStatusText(history.status)}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">{formatDate(history.createdAt)}</span>
                                </div>
                            ))}
                            {sortedHistories.length > 3 && (
                                <div className="text-xs text-center text-primary cursor-pointer hover:underline">
                                    Xem thêm {sortedHistories.length - 3} lịch sử
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderPaymentInfo;