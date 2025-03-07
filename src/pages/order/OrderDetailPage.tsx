import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderFinder, useCurrentOrder, useOrders } from '../../hooks/orderHooks';
import { useOrderItems } from '../../hooks/orderItemHooks';
import { usePaymentFinder } from '../../hooks/paymentHooks';
import { OrderStatus, OrderItemResponse, OrderResponse, PaymentStatus } from '@/types';
import paymentService from '../../services/paymentService'; // Import payment service

// Import subcomponents
import OrderDetailHeader from '../../components/order/detail/OrderDetailHeader';
import OrderStatusCard from '../../components/order/detail/OrderStatusCard';
import OrderCustomerInfo from '../../components/order/detail/OrderCustomerInfo';
import OrderShippingInfo from '../../components/order/detail/OrderShippingInfo';
import OrderPaymentInfo from '../../components/order/detail/OrderPaymentInfo';
import OrderShippingMethodInfo from '../../components/order/detail/OrderShippingMethodInfo';
import OrderNotesSection from '../../components/order/detail/OrderNotesSection';
import OrderItemsList from '../../components/order/detail/OrderItemsList';
import OrderSummary from '../../components/order/detail/OrderSummary';
import OrderStatusWorkflowPopup from '../../components/order/order-list/OrderStatusWorkflowPopup';
import PaymentStatusWorkflowPopup from '../../components/order/detail/PaymentStatusWorkflowPopup';
import LoadingState from '../../components/order/detail/LoadingState';
import ErrorState from '../../components/order/detail/ErrorState';

interface ExtendedOrderResponse extends OrderResponse {
    orderItems?: OrderItemResponse[];
}

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const initialFetchCompleted = useRef<boolean>(false);
    const dataLoaded = useRef<boolean>(false);
    const itemsFetched = useRef<boolean>(false);

    const parsedId = id ? parseInt(id, 10) : 0;
    const orderId = isNaN(parsedId) ? 0 : parsedId;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showStatusWorkflow, setShowStatusWorkflow] = useState<boolean>(false);
    const [showPaymentStatusWorkflow, setShowPaymentStatusWorkflow] = useState<boolean>(false);
    const [orderItemsData, setOrderItemsData] = useState<OrderItemResponse[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);

    const { fetchOrderByIdAdmin } = useOrderFinder(orderId);
    const { currentOrder: baseCurrentOrder, paymentDetails, clearCurrentOrder } = useCurrentOrder();
    const { updateOrderStatus } = useOrders();
    const { fetchOrderPayment } = usePaymentFinder();
    const { fetchOrderItems, orderItems, formattedOrderItems } = useOrderItems();

    const currentOrder = baseCurrentOrder as ExtendedOrderResponse | null;

    const mapOrderItems = useCallback((items: OrderItemResponse[]): OrderItemResponse[] => {
        if (!items || !Array.isArray(items)) return [];

        return items.map((item: OrderItemResponse, index: number) => {
            console.log('Processing order item:', item);

            const price = typeof item.price === 'number' ? item.price : 1800000;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const subtotal = typeof item.subtotal === 'number' ? item.subtotal : price * quantity;

            return {
                orderItemId: item.orderItemId || index + 1,
                orderId: item.orderId || orderId,
                productVariantId: item.productVariantId || 0,
                productName: item.productName || 'Sản phẩm không tên',
                variantName: item.variantName || 'Mặc định',
                quantity,
                price,
                subtotal,
                productImage: item.productImage || '/placeholder-product.png'
            };
        });
    }, [orderId]);

    const fetchOrderData = useCallback(async () => {
        if (orderId <= 0) {
            setIsError(true);
            setErrorMessage(`ID đơn hàng không hợp lệ: ${id}`);
            setIsLoading(false);
            return;
        }

        if (initialFetchCompleted.current) return;

        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage(null);

            console.log('Fetching order data for ID:', orderId);
            const orderSuccess = await fetchOrderByIdAdmin(orderId);
            console.log('Order fetch result:', orderSuccess);

            if (!orderSuccess) {
                throw new Error(`Không thể tải thông tin đơn hàng #${orderId}`);
            }

            await fetchOrderPayment(orderId);

            dataLoaded.current = true;
            initialFetchCompleted.current = true;
        } catch (error) {
            console.error('Error fetching order data:', error);
            setIsError(true);
            setErrorMessage(error instanceof Error ? error.message : `Đã xảy ra lỗi khi tải thông tin đơn hàng #${orderId}`);
        } finally {
            setIsLoading(false);
        }
    }, [orderId, id, fetchOrderByIdAdmin, fetchOrderPayment]);

    const fetchOrderItemsData = useCallback(async () => {
        if (orderId <= 0 || itemsFetched.current) return;

        try {
            setIsLoadingItems(true);
            console.log('Fetching order items for order ID:', orderId);

            if (currentOrder?.orderItems && Array.isArray(currentOrder.orderItems) && currentOrder.orderItems.length > 0) {
                const mappedItems = mapOrderItems(currentOrder.orderItems);
                setOrderItemsData(mappedItems);
                itemsFetched.current = true;
                setIsLoadingItems(false);
                return;
            }

            const success = await fetchOrderItems(orderId);
            console.log('Order items fetch result:', success);

            if (success && orderItems && orderItems.length > 0) {
                setOrderItemsData(mapOrderItems(orderItems));
                itemsFetched.current = true;
            }
        } catch (error) {
            console.error('Error fetching order items:', error);
        } finally {
            setIsLoadingItems(false);
        }
    }, [orderId, fetchOrderItems, orderItems, currentOrder, mapOrderItems]);

    useEffect(() => {
        if (!initialFetchCompleted.current) {
            fetchOrderData();
        }
        return () => clearCurrentOrder();
    }, [fetchOrderData, clearCurrentOrder]);

    useEffect(() => {
        if (dataLoaded.current && !itemsFetched.current && orderId > 0 && currentOrder) {
            fetchOrderItemsData();
        }
    }, [currentOrder, fetchOrderItemsData, orderId]);

    useEffect(() => {
        if (!isLoading && !currentOrder && dataLoaded.current && !isError) {
            setIsError(true);
            setErrorMessage(`Không tìm thấy thông tin đơn hàng #${orderId}`);
        }
    }, [isLoading, currentOrder, isError, orderId]);

    const handleBack = () => navigate(-1);
    const handleRetry = () => {
        initialFetchCompleted.current = false;
        dataLoaded.current = false;
        itemsFetched.current = false;
        fetchOrderData();
    };
    const handlePrint = () => window.print();
    const handleEditOrder = () => currentOrder && navigate(`/admin/orders/edit/${currentOrder.orderId}`);
    const handleOpenStatusWorkflow = () => setShowStatusWorkflow(true);
    const handleOpenPaymentStatusWorkflow = () => setShowPaymentStatusWorkflow(true);

    const handleStatusChange = useCallback(async (newStatus: OrderStatus) => {
        if (!currentOrder) return;

        const statusData = { status: newStatus, note: `Status changed to ${newStatus} from order detail page` };
        try {
            setIsLoading(true);
            const success = await updateOrderStatus(currentOrder.orderId, statusData);
            if (success) {
                initialFetchCompleted.current = false;
                itemsFetched.current = false;
                await fetchOrderData();
            } else {
                setErrorMessage("Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setErrorMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật trạng thái");
        } finally {
            setIsLoading(false);
            setShowStatusWorkflow(false);
        }
    }, [currentOrder, updateOrderStatus, fetchOrderData]);

    const handlePaymentStatusChange = useCallback(async (newStatus: PaymentStatus) => {
        if (!currentOrder || !paymentDetails || !paymentDetails.paymentId) {
            setErrorMessage("Không tìm thấy thông tin thanh toán");
            setShowPaymentStatusWorkflow(false);
            return;
        }

        try {
            setIsLoading(true);
            const paymentId = paymentDetails.paymentId;
            const methodCode = paymentDetails.methodCode || '';

            console.log('Cập nhật trạng thái thanh toán:', {
                paymentId,
                from: paymentDetails.status,
                to: newStatus,
                methodCode
            });

            let result;

            // Sử dụng payment service thay vì gọi trực tiếp fetch API
            if (newStatus === PaymentStatus.COMPLETED && methodCode.toUpperCase() === 'COD') {
                // Xác nhận thanh toán COD
                result = await paymentService.confirmCodPayment(paymentId, {
                    note: "Thanh toán COD đã được xác nhận từ giao diện quản trị"
                });
            } else if (newStatus === PaymentStatus.CANCELLED) {
                // Hủy thanh toán
                result = await paymentService.cancelPayment(paymentId);
            } else if (newStatus === PaymentStatus.REFUNDED) {
                // Hoàn tiền
                result = await paymentService.refundPayment(paymentId, {
                    reason: "Hoàn tiền từ giao diện quản trị",
                    amount: paymentDetails.amount
                });
            } else {
                // Cập nhật trạng thái thanh toán thông thường
                result = await paymentService.updatePaymentStatus(paymentId, {
                    status: newStatus,
                    note: `Cập nhật trạng thái thanh toán sang ${newStatus} từ trang chi tiết đơn hàng`
                });
            }

            if (result && result.success) {
                // Làm mới dữ liệu đơn hàng để cập nhật trạng thái thanh toán
                initialFetchCompleted.current = false;
                await fetchOrderData();
                setErrorMessage(null);
            } else {
                setErrorMessage(`Không thể cập nhật trạng thái thanh toán sang ${newStatus}. ${result?.message || 'Vui lòng kiểm tra quyền truy cập.'}`);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
            const errorMessage = error && typeof error === 'object' && 'message' in error
                ? (error.message as string)
                : "Đã xảy ra lỗi khi cập nhật trạng thái thanh toán";
            setErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
            setShowPaymentStatusWorkflow(false);
        }
    }, [currentOrder, paymentDetails, fetchOrderData]);

    const displayOrderCode = currentOrder?.orderCode ? `#${currentOrder.orderCode}` : orderId > 0 ? `#${orderId}` : '';

    const getItemsToDisplay = useCallback((): OrderItemResponse[] => {
        if (orderItemsData.length > 0) return orderItemsData;
        if (currentOrder?.orderItems && Array.isArray(currentOrder.orderItems)) {
            return mapOrderItems(currentOrder.orderItems);
        }
        if (formattedOrderItems && formattedOrderItems.length > 0) return formattedOrderItems as OrderItemResponse[];
        if (orderItems && orderItems.length > 0) return orderItems;
        return [];
    }, [orderItemsData, currentOrder, formattedOrderItems, orderItems, mapOrderItems]);

    // Calculate values correctly
    const calculateItemsTotal = useCallback(() => {
        const items = getItemsToDisplay();
        console.log('Calculating items total from:', items);

        if (!items || items.length === 0) {
            return 0;
        }

        return items.reduce((sum: number, item: OrderItemResponse) => {
            const itemSubtotal = typeof item.subtotal === 'number' ? item.subtotal :
                (typeof item.price === 'number' && typeof item.quantity === 'number'
                    ? item.price * item.quantity : 0);

            console.log(`Item ${item.orderItemId}: price=${item.price}, qty=${item.quantity}, subtotal=${itemSubtotal}`);
            return sum + itemSubtotal;
        }, 0);
    }, [getItemsToDisplay]);

    const items = getItemsToDisplay();
    const hasItems = items.length > 0;

    // Calculate values correctly
    const itemsSubtotal = calculateItemsTotal();
    console.log('Calculated itemsSubtotal:', itemsSubtotal);

    // Get other values with proper fallbacks
    const shippingFee = typeof currentOrder?.shippingFee === 'number' ? currentOrder.shippingFee : 0;
    const discount = typeof currentOrder?.discount === 'number' ? currentOrder.discount : 0;

    // Get final amount or calculate it if not available
    let finalAmount = typeof currentOrder?.finalAmount === 'number' ? currentOrder.finalAmount : 0;

    // If finalAmount is still 0 or invalid, calculate it
    if (!finalAmount || isNaN(finalAmount)) {
        finalAmount = itemsSubtotal + shippingFee - discount;
        console.log('Calculated finalAmount:', finalAmount);
    }

    // Log all values for debugging
    console.log('Order totals:', {
        itemsSubtotal,
        shippingFee,
        discount,
        finalAmount,
        currentOrderFinalAmount: currentOrder?.finalAmount
    });

    if (isLoading) return <LoadingState message="Đang tải thông tin đơn hàng..." />;
    if (isError) return <ErrorState errorMessage={errorMessage || "Không tìm thấy thông tin đơn hàng"} onRetry={handleRetry} onBack={handleBack} />;
    if (!currentOrder) return <ErrorState errorMessage="Không tìm thấy thông tin đơn hàng" onRetry={handleRetry} onBack={handleBack} />;

    return (
        <div className="space-y-6">
            <OrderDetailHeader
                orderCode={displayOrderCode}
                order={currentOrder}
                onBack={handleBack}
                onPrint={handlePrint}
                onEdit={handleEditOrder}
                onStatusChange={handleOpenStatusWorkflow}
            />
            <OrderStatusCard
                orderStatus={currentOrder.status}
                paymentDetails={paymentDetails}
                paymentStatus={paymentDetails?.status}
                createdAt={currentOrder.createdAt}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <OrderCustomerInfo order={currentOrder} />
                <OrderShippingInfo order={currentOrder} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <OrderPaymentInfo
                    paymentDetails={paymentDetails}
                    totalAmount={finalAmount}
                    onUpdateStatus={handleOpenPaymentStatusWorkflow}
                />
                <OrderShippingMethodInfo
                    shippingMethod={currentOrder.shippingMethod}
                    shippingFee={shippingFee}
                    deliveryOtp={currentOrder.deliveryOtp}
                    deliveryOtpExpiry={currentOrder.deliveryOtpExpiry}
                />
            </div>
            {currentOrder.note && <OrderNotesSection note={currentOrder.note} />}
            {isLoadingItems ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 bg-white dark:bg-secondary">
                    <p className="text-center text-gray-500 dark:text-gray-400">Đang tải thông tin sản phẩm...</p>
                </div>
            ) : hasItems ? (
                <OrderItemsList
                    orderItems={items}
                    totalItems={{
                        count: items.length,
                        totalQuantity: items.reduce((sum: number, item: OrderItemResponse) => sum + (item.quantity || 0), 0),
                        totalValue: itemsSubtotal,
                        formattedTotalValue: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemsSubtotal)
                    }}
                />
            ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 bg-white dark:bg-secondary">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Sản phẩm</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">Không có thông tin sản phẩm cho đơn hàng này</p>
                </div>
            )}
            <OrderSummary
                subtotal={itemsSubtotal}
                shippingFee={shippingFee}
                discount={discount}
                finalAmount={finalAmount}
            />
            <OrderStatusWorkflowPopup
                isOpen={showStatusWorkflow}
                currentStatus={currentOrder.status}
                onClose={() => setShowStatusWorkflow(false)}
                onStatusChange={handleStatusChange}
            />
            <PaymentStatusWorkflowPopup
                isOpen={showPaymentStatusWorkflow}
                currentStatus={paymentDetails?.status}
                onClose={() => setShowPaymentStatusWorkflow(false)}
                onStatusChange={handlePaymentStatusChange}
            />
        </div>
    );
};

export default OrderDetailPage;