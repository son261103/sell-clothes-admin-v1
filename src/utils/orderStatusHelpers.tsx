import {
    Clock,
    CheckCircle,
    Truck,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@/types';

// Order Status helpers
export const getStatusColor = (status?: OrderStatus): string => {
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

export const getStatusBgColor = (status?: OrderStatus): string => {
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

export const getStatusIcon = (status?: OrderStatus): JSX.Element => {
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

export const getStatusText = (status?: OrderStatus): string => {
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

// Payment Status helpers
export const getPaymentStatusText = (status?: PaymentStatus): string => {
    if (!status) return "Chờ thanh toán";
    switch (status) {
        case PaymentStatus.PENDING: return "Chờ thanh toán";
        case PaymentStatus.COMPLETED: return "Đã thanh toán";
        case PaymentStatus.FAILED: return "Thanh toán thất bại";
        case PaymentStatus.REFUNDED: return "Đã hoàn tiền";
        case PaymentStatus.CANCELLED: return "Đã hủy thanh toán";
        default: return "Chờ thanh toán";
    }
};

export const getPaymentStatusColor = (status?: PaymentStatus): string => {
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