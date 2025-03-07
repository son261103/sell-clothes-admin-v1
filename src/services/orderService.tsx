import apiConfig from '../config/apiConfig';
import { ORDER_ENDPOINTS } from '../constants/orderConstant';
import type {
    OrderResponse,
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderSummaryDTO,
    OrderPageRequest,
    OrderStatisticsDTO,
    OrderStatus,
    OrderItemRequest,
    UpdateOrderStatusDTO,
    ApplyShippingDTO,
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class OrderService {
    private static createErrorResponse(err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
            return {
                success: false,
                message: err.response.data.message || err.message,
                errorCode: err.response.data.errorCode
            };
        }
        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
            errorCode: 'UNKNOWN_ERROR'
        };
    }

    private static wrapResponse<T>(data: T): ApiResponse<T> {
        return {
            success: true,
            data,
            message: 'Operation successful'
        };
    }

    // User Methods

    /**
     * Get orders for the current user
     */
    async getMyOrders(
        pageRequest: OrderPageRequest = { page: 0, size: 10, sort: 'createdAt,desc' }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'createdAt,desc');

            // Add filters if provided
            if (pageRequest.filters) {
                Object.entries(pageRequest.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        params.append(key, String(value));
                    }
                });
            }

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.LIST}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Create a new order
     */
    async createOrder(orderData: OrderCreateRequest): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.post<OrderResponse>(ORDER_ENDPOINTS.CREATE, orderData);
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get order details by order ID (for user)
     */
    async getOrderById(id: number): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.get<OrderResponse>(ORDER_ENDPOINTS.VIEW(id));
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Update an existing order
     */
    async updateOrder(id: number, updateData: OrderUpdateRequest): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.put<OrderResponse>(
                ORDER_ENDPOINTS.VIEW(id),
                updateData
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Add an item to an existing order
     */
    async addOrderItem(orderId: number, item: OrderItemRequest): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.post<OrderResponse>(
                ORDER_ENDPOINTS.ADD_ITEM(orderId),
                item
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Remove an item from an order
     */
    async removeOrderItem(orderId: number, itemId: number): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.delete<OrderResponse>(
                ORDER_ENDPOINTS.REMOVE_ITEM(orderId, itemId)
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Confirm an order (user action)
     */
    async confirmOrder(orderId: number): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.post<OrderResponse>(
                ORDER_ENDPOINTS.CONFIRM_ORDER(orderId)
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Cancel an order (user action)
     */
    async cancelOrder(orderId: number, reason?: string): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.post<OrderResponse>(
                ORDER_ENDPOINTS.CANCEL_ORDER(orderId),
                { reason }
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get orders by status (for user)
     */
    async getOrdersByStatus(
        status: OrderStatus,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.BY_STATUS(status)}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    // Admin Methods

    /**
     * Get all orders (admin)
     */
    async getAllOrders(
        pageRequest: OrderPageRequest = { page: 0, size: 10, sort: 'createdAt,desc' }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'createdAt,desc');

            // Add filters if provided
            if (pageRequest.filters) {
                Object.entries(pageRequest.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        params.append(key, String(value));
                    }
                });
            }

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.LIST_ADMIN}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get order details by ID (admin)
     */
    async getOrderByIdAdmin(id: number): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.get<OrderResponse>(ORDER_ENDPOINTS.VIEW_ADMIN(id));
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get orders for a specific user (admin)
     */
    async getUserOrders(
        userId: number,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            // If filters exist, apply them
            if (pageRequest.filters) {
                Object.entries(pageRequest.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        params.append(key, String(value));
                    }
                });
            }

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.USER_ORDERS(userId)}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Update order status (admin)
     */
    async updateOrderStatus(
        orderId: number,
        statusData: UpdateOrderStatusDTO
    ): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.put<OrderResponse>(
                ORDER_ENDPOINTS.UPDATE_STATUS(orderId),
                statusData
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Update order shipping (admin)
     */
    async updateOrderShipping(
        orderId: number,
        shippingData: ApplyShippingDTO
    ): Promise<ApiResponse<OrderResponse>> {
        try {
            const response = await apiConfig.put<OrderResponse>(
                ORDER_ENDPOINTS.UPDATE_SHIPPING(orderId),
                shippingData
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get orders by status (admin)
     */
    async getOrdersByStatusAdmin(
        status: OrderStatus,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.BY_STATUS_ADMIN(status)}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get orders by shipping method (admin)
     */
    async getOrdersByShippingMethod(
        methodId: number,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.BY_SHIPPING_METHOD(methodId)}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Search orders (admin)
     */
    async searchOrdersAdmin(
        keyword: string,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('search', keyword.trim());
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.SEARCH_ADMIN}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Filter orders (admin)
     */
    async filterOrdersAdmin(
        pageRequest: OrderPageRequest = { page: 0, size: 10, filters: {} }
    ): Promise<ApiResponse<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();

            // Add pagination parameters
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            // Add filter parameters
            if (pageRequest.filters) {
                Object.entries(pageRequest.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        params.append(key, String(value));
                    }
                });
            }

            const response = await apiConfig.get<{ content: OrderSummaryDTO[], totalElements: number, totalPages: number }>(
                `${ORDER_ENDPOINTS.FILTER_ADMIN}?${params.toString()}`
            );
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Get order statistics (admin)
     */
    async getOrderStatistics(): Promise<ApiResponse<OrderStatisticsDTO>> {
        try {
            const response = await apiConfig.get<OrderStatisticsDTO>(ORDER_ENDPOINTS.STATISTICS);
            return OrderService.wrapResponse(response.data);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    /**
     * Delete an order (admin)
     */
    async deleteOrder(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(ORDER_ENDPOINTS.DELETE(id));
            return OrderService.wrapResponse(undefined);
        } catch (err) {
            throw OrderService.createErrorResponse(err);
        }
    }

    // Payment-related methods

    // /**
    //  * Confirm COD payment
    //  */
    // async confirmCodPayment(paymentId: number, confirmData: CodConfirmRequest): Promise<ApiResponse<PaymentResponse>> {
    //     try {
    //         const response = await apiConfig.post<PaymentResponse>(
    //             `/api/payments/admin/${paymentId}/confirm-cod`,
    //             confirmData
    //         );
    //         return OrderService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Reject COD payment
    //  */
    // async rejectCodPayment(paymentId: number, rejectionData: CodRejectionRequest): Promise<ApiResponse<PaymentResponse>> {
    //     try {
    //         const response = await apiConfig.post<PaymentResponse>(
    //             `/api/payments/admin/${paymentId}/reject-cod`,
    //             rejectionData
    //         );
    //         return OrderService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Reattempt COD delivery
    //  */
    // async reattemptCodDelivery(paymentId: number): Promise<ApiResponse<PaymentResponse>> {
    //     try {
    //         const response = await apiConfig.post<PaymentResponse>(
    //             `/api/payments/admin/${paymentId}/reattempt-cod`
    //         );
    //         return OrderService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Send OTP for delivery confirmation
    //  */
    // async sendDeliveryConfirmationOtp(orderId: number): Promise<ApiResponse<string>> {
    //     try {
    //         const response = await apiConfig.post<ApiResponse<string>>(
    //             `/api/payments/admin/order/${orderId}/send-otp`
    //         );
    //         return response.data;
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Confirm delivery with OTP
    //  */
    // async confirmDeliveryWithOtp(orderId: number, otpData: OtpConfirmRequest): Promise<ApiResponse<PaymentResponse>> {
    //     try {
    //         const response = await apiConfig.post<PaymentResponse>(
    //             `/api/payments/admin/order/${orderId}/confirm-delivery`,
    //             otpData
    //         );
    //         return OrderService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Complete an order
    //  */
    // async completeOrder(orderId: number): Promise<ApiResponse<PaymentResponse>> {
    //     try {
    //         const response = await apiConfig.post<PaymentResponse>(
    //             `/api/payments/admin/order/${orderId}/complete`
    //         );
    //         return OrderService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Check payment status with payment gateway
    //  */
    // async checkPaymentStatus(transactionId: string): Promise<ApiResponse<string>> {
    //     try {
    //         const response = await apiConfig.get<ApiResponse<string>>(
    //             `/api/payments/admin/status/${transactionId}`
    //         );
    //         return response.data;
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
    //
    // /**
    //  * Cancel a payment
    //  */
    // async cancelPayment(paymentId: number): Promise<ApiResponse<void>> {
    //     try {
    //         const response = await apiConfig.post<ApiResponse<void>>(
    //             `/api/payments/admin/${paymentId}/cancel`
    //         );
    //         return response.data;
    //     } catch (err) {
    //         throw OrderService.createErrorResponse(err);
    //     }
    // }
}

export default new OrderService();