// src/components/order/detail/OrderShippingMethodInfo.tsx
import React from 'react';
import {Truck} from 'lucide-react';
import {ShippingMethodResponse} from '@/types';
import {formatPrice, formatDate} from '@/utils/format.tsx';

interface OrderShippingMethodInfoProps {
    shippingMethod?: ShippingMethodResponse;
    shippingFee?: number;
    deliveryOtp?: string;
    deliveryOtpExpiry?: string;
}

const OrderShippingMethodInfo: React.FC<OrderShippingMethodInfoProps> = ({
                                                                             shippingMethod,
                                                                             shippingFee = 30000,
                                                                             deliveryOtp,
                                                                             deliveryOtpExpiry
                                                                         }) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-secondary">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                <Truck className="w-4 h-4 text-primary"/>
                Phương thức vận chuyển
            </h3>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dịch vụ:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {shippingMethod?.name || 'Giao hàng tiêu chuẩn'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Nhà cung cấp:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shippingMethod?.provider || 'Giao hàng nhanh'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Thời gian dự kiến:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shippingMethod?.estimatedDays || '2-3 ngày'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="text-sm text-primary font-medium">{formatPrice(shippingFee)}</span>
                </div>
            </div>

            {deliveryOtp && (
                <div className="mt-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">OTP giao hàng:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{deliveryOtp}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Hết hạn OTP:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(deliveryOtpExpiry || '')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderShippingMethodInfo;