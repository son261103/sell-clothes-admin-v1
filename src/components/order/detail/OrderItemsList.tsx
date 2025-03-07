// src/components/order/detail/OrderItemsList.tsx
import React, { useMemo } from 'react';
import { Package2 } from 'lucide-react';
import { OrderItemResponse } from '@/types';

interface OrderItemsListProps {
    orderItems: (OrderItemResponse | null | any)[];
    totalItems?: number | {
        count: number;
        totalQuantity: number;
        totalValue: number;
        formattedTotalValue: string;
        averagePrice?: number;
        formattedAveragePrice?: string;
    };
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ orderItems, totalItems }) => {
    console.log('OrderItemsList component rendering');
    console.log('OrderItemsList received orderItems:', orderItems);
    console.log('OrderItemsList received totalItems:', totalItems);

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

    // Get product image with fallback
    const getProductImage = (item: any): string => {
        return item.productImage || item.image || '/placeholder-product.png';
    };

    // Filter out null items and ensure all required fields
    const validItems = useMemo(() => {
        if (!orderItems || !Array.isArray(orderItems)) {
            console.log('orderItems is not an array');
            return [];
        }

        console.log('Processing orderItems:', orderItems);

        return orderItems
            .filter(Boolean)
            .map((item, index) => {
                if (!item) return null;

                const formattedItem = {
                    // Ensure all required fields have valid values
                    orderItemId: item.orderItemId || item.id || index + 1,
                    orderId: item.orderId || 0,
                    productVariantId: item.productVariantId || item.variantId || 0,
                    productName: item.productName || 'Sản phẩm không tên',
                    variantName: item.variantName ||
                        (item.variantSize && item.variantColor ? `${item.variantSize}, ${item.variantColor}` : 'Mặc định'),
                    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
                    price: typeof item.price === 'number' ? item.price :
                        typeof item.unitPrice === 'number' ? item.unitPrice :
                            item.subtotal && item.quantity ? item.subtotal / item.quantity :
                                1000000, // Fallback price
                    subtotal: typeof item.subtotal === 'number' ? item.subtotal :
                        typeof item.totalPrice === 'number' ? item.totalPrice :
                            typeof item.price === 'number' && typeof item.quantity === 'number' ?
                                item.price * item.quantity :
                                2000000, // Fallback subtotal
                    productImage: item.productImage || item.image || null
                };

                console.log(`Processed item ${index}:`, formattedItem);
                return formattedItem;
            })
            .filter(Boolean) as OrderItemResponse[];
    }, [orderItems]);

    // Calculate values with error checking
    const itemsData = useMemo(() => {
        try {
            const itemCount = totalItems
                ? (typeof totalItems === 'number'
                    ? totalItems
                    : totalItems.count || totalItems.totalQuantity || 0)
                : validItems.length;

            const totalQuantity = totalItems && typeof totalItems === 'object' && 'totalQuantity' in totalItems
                ? totalItems.totalQuantity
                : validItems.reduce((sum: number, item: OrderItemResponse) => {
                    return sum + (typeof item.quantity === 'number' ? item.quantity : 0);
                }, 0);

            const totalValue = totalItems && typeof totalItems === 'object' && 'totalValue' in totalItems
                ? {
                    raw: totalItems.totalValue,
                    formatted: totalItems.formattedTotalValue || formatPrice(totalItems.totalValue)
                }
                : {
                    raw: validItems.reduce((sum: number, item: OrderItemResponse) => {
                        return sum + (typeof item.subtotal === 'number' ? item.subtotal : 0);
                    }, 0),
                    formatted: formatPrice(validItems.reduce((sum: number, item: OrderItemResponse) => {
                        return sum + (typeof item.subtotal === 'number' ? item.subtotal : 0);
                    }, 0))
                };

            return {
                count: itemCount,
                totalQuantity,
                totalValue
            };
        } catch (error) {
            console.error('Error calculating item data:', error);
            return {
                count: validItems.length,
                totalQuantity: 0,
                totalValue: {
                    raw: 0,
                    formatted: '0 ₫'
                }
            };
        }
    }, [validItems, totalItems, formatPrice]);

    // Check for empty state
    if (!validItems.length) {
        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-white dark:bg-secondary">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                    <Package2 className="w-4 h-4 text-primary" />
                    Sản phẩm
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic p-4 text-center">Không có thông tin sản phẩm</p>
            </div>
        );
    }

    console.log('OrderItemsList: Rendering with valid items count:', validItems.length);
    console.log('OrderItemsList: Item data summary:', itemsData);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-white dark:bg-secondary">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1">
                    <Package2 className="w-4 h-4 text-primary" />
                    Sản phẩm ({itemsData.count})
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Tổng số lượng: <span className="font-medium text-gray-700 dark:text-gray-300">{itemsData.totalQuantity}</span>
                </div>
            </div>

            <div className="space-y-4 mt-4">
                {validItems.map((item) => (
                    <div key={`order-item-${item.orderItemId}`} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                            <img
                                src={getProductImage(item)}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-product.png';
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.productName || 'Sản phẩm'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Biến thể: <span className="text-gray-700 dark:text-gray-300">{item.variantName || 'Mặc định'}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Mã sản phẩm: <span className="text-gray-700 dark:text-gray-300">ID-{item.productVariantId || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(item.price)} x {item.quantity}</div>
                            <div className="text-sm font-medium text-primary mt-1">{formatPrice(item.subtotal)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderItemsList;