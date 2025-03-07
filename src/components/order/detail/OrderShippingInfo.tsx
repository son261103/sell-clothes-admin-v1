// src/components/order/detail/OrderShippingInfo.tsx
import React from 'react';
import { Home } from 'lucide-react';
import { OrderResponse } from '@/types';

interface OrderShippingInfoProps {
    order: OrderResponse;
}

const OrderShippingInfo: React.FC<OrderShippingInfoProps> = ({ order }) => {
    // Get shipping address from order
    const shippingAddress = order.shippingAddress;

    // Also try to get address from runtime property that might exist
    const anyOrder = order as any;
    const runtimeAddress = anyOrder.address;
    const runtimeUser = anyOrder.user;

    // Early return if no shipping address
    if (!shippingAddress && !runtimeAddress) {
        console.log('No shipping address found in order');
        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-secondary">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                    <Home className="w-4 h-4 text-primary" />
                    Địa chỉ giao hàng
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Chưa có thông tin địa chỉ giao hàng</p>
            </div>
        );
    }

    // Use whatever address object is available
    const addressToUse = shippingAddress || runtimeAddress || {};

    // Extract recipient name from multiple possible sources
    const recipientName = addressToUse.fullName ||
        (runtimeUser && runtimeUser.fullName) ||
        (runtimeUser && runtimeUser.name) ||
        order.userName ||
        'Chưa có thông tin';

    // Extract phone from multiple possible sources
    const recipientPhone = addressToUse.phone ||
        (runtimeUser && runtimeUser.phone) ||
        order.userPhone ||
        'Chưa có thông tin';

    // Construct the full address string
    const addressComponents = [
        addressToUse.address || addressToUse.addressLine,
        addressToUse.ward,
        addressToUse.district,
        addressToUse.province || addressToUse.city,
    ].filter(Boolean);

    const fullAddressDisplay = addressComponents.length > 0
        ? addressComponents.join(', ')
        : 'Chưa có thông tin';

    console.log('Final address display:', {
        fullName: recipientName,
        phone: recipientPhone,
        fullAddress: fullAddressDisplay,
        isDefault: addressToUse.isDefault
    });

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-secondary">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                <Home className="w-4 h-4 text-primary" />
                Địa chỉ giao hàng
            </h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Người nhận:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {recipientName}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {recipientPhone}
                    </span>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 text-right ml-4">
                        {fullAddressDisplay}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mặc định:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {addressToUse.isDefault ? 'Có' : 'Không'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderShippingInfo;