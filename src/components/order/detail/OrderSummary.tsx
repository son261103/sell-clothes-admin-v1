import React, { useEffect } from 'react';

interface OrderSummaryProps {
    subtotal: number;      // Tổng giá trị sản phẩm (tổng của total_price từ các item)
    shippingFee: number;   // Phí vận chuyển
    discount: number;      // Giảm giá
    finalAmount: number;   // Tổng thanh toán (subtotal + shippingFee - discount)
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
                                                       subtotal,
                                                       shippingFee,
                                                       discount,
                                                       finalAmount
                                                   }) => {
    // Format price with error handling
    const formatPrice = (price: number | null | undefined): string => {
        if (price === null || price === undefined || isNaN(price)) {
            console.log('Invalid price detected:', price);
            return '0 ₫';
        }
        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        } catch (error) {
            console.error('Error formatting price:', error);
            return price.toLocaleString() + ' ₫';
        }
    };

    // Debugging: Log detailed breakdown of props
    useEffect(() => {
        console.log('OrderSummary Props (detailed):', {
            subtotal: {
                value: subtotal,
                type: typeof subtotal,
                isNaN: isNaN(Number(subtotal)),
                formatted: formatPrice(subtotal)
            },
            shippingFee: {
                value: shippingFee,
                type: typeof shippingFee,
                isNaN: isNaN(Number(shippingFee)),
                formatted: formatPrice(shippingFee)
            },
            discount: {
                value: discount,
                type: typeof discount,
                isNaN: isNaN(Number(discount)),
                formatted: formatPrice(discount)
            },
            finalAmount: {
                value: finalAmount,
                type: typeof finalAmount,
                isNaN: isNaN(Number(finalAmount)),
                formatted: formatPrice(finalAmount)
            },
            calculatedTotal: subtotal + shippingFee - discount
        });
    }, [subtotal, shippingFee, discount, finalAmount]);

    // Use calculated total if finalAmount is not valid
    const displayTotal = (!finalAmount || isNaN(finalAmount))
        ? (subtotal + shippingFee - discount)
        : finalAmount;

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Tổng hợp đơn hàng</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tạm tính:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatPrice(shippingFee)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Giảm giá:</span>
                        <span className="text-sm text-red-600 dark:text-red-400">-{formatPrice(discount)}</span>
                    </div>
                )}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between">
                        <span className="text-base font-medium text-gray-900 dark:text-gray-100">Tổng thanh toán:</span>
                        <span className="text-base font-medium text-primary">{formatPrice(displayTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;