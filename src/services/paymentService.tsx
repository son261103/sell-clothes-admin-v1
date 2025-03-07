import apiConfig from '../config/apiConfig';
import { PAYMENT_ENDPOINTS } from '../constants/paymentConstant';
import type {
    PaymentResponseDTO,
    PaymentCreateDTO,
    PaymentUpdateDTO,
    PaymentMethodResponseDTO,
    PaymentMethodCreateDTO,
    PaymentMethodUpdateDTO,
    PaymentHistoryResponseDTO,
    PaymentStatsResponseDTO,
    PaymentFilterRequestDTO,
    PaymentPageRequestDTO,
    CodConfirmRequestDTO,
    CodRejectionRequestDTO,
    OtpConfirmRequestDTO,
    RefundRequestDTO,
    PaymentStatus,
    PaymentMethodType
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class PaymentService {
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

    // PAYMENT OPERATIONS

    /**
     * Get paginated list of payments
     */
    async getPayments(
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10, sort: 'createdAt,desc' }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
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

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.LIST}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.get<PaymentResponseDTO>(PAYMENT_ENDPOINTS.VIEW(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment for specific order
     */
    async getOrderPayment(orderId: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.get<PaymentResponseDTO>(PAYMENT_ENDPOINTS.ORDER_PAYMENT(orderId));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Create new payment
     */
    async createPayment(paymentData: PaymentCreateDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(PAYMENT_ENDPOINTS.CREATE, paymentData);
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Create payment for specific order
     */
    async createPaymentForOrder(orderId: number, paymentData: PaymentCreateDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.CREATE_FOR_ORDER(orderId),
                paymentData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Update payment
     */
    async updatePayment(id: number, updateData: PaymentUpdateDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.put<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.UPDATE(id),
                updateData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Xác nhận thanh toán
     * Phương thức này sẽ được tùy chỉnh lại để dùng endpoint đúng
     */
    async confirmPayment(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            // Xác định xem đây có phải là thanh toán COD không
            const paymentInfo = await this.getPaymentById(id);

            if (paymentInfo.success && paymentInfo.data) {
                const paymentMethod = paymentInfo.data.methodCode || '';

                // Nếu là thanh toán COD, dùng API xác nhận COD
                if (paymentMethod.toUpperCase() === 'COD') {
                    const response = await apiConfig.post<PaymentResponseDTO>(
                        PAYMENT_ENDPOINTS.CONFIRM_COD(id),
                        { note: "Thanh toán COD đã được xác nhận từ giao diện quản trị" }
                    );
                    return PaymentService.wrapResponse(response.data);
                }
                // Nếu không phải COD, dùng API update status
                else {
                    const response = await apiConfig.put<PaymentResponseDTO>(
                        PAYMENT_ENDPOINTS.ADMIN.UPDATE_STATUS(id),
                        { status: "COMPLETED" }
                    );
                    return PaymentService.wrapResponse(response.data);
                }
            } else {
                throw new Error("Không thể lấy thông tin thanh toán");
            }
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Cancel payment
     */
    async cancelPayment(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(PAYMENT_ENDPOINTS.CANCEL(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(id: number, refundData: RefundRequestDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.REFUND(id),
                refundData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Verify transaction by transaction code
     */
    async verifyTransaction(transactionCode: string): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.get<PaymentResponseDTO>(PAYMENT_ENDPOINTS.VERIFY(transactionCode));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(id: number): Promise<ApiResponse<PaymentStatus>> {
        try {
            const response = await apiConfig.get<PaymentStatus>(PAYMENT_ENDPOINTS.CHECK_STATUS(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment histories
     */
    async getPaymentHistories(id: number): Promise<ApiResponse<PaymentHistoryResponseDTO[]>> {
        try {
            const response = await apiConfig.get<PaymentHistoryResponseDTO[]>(PAYMENT_ENDPOINTS.HISTORIES(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    // COD PAYMENT OPERATIONS

    /**
     * Confirm COD payment
     */
    async confirmCodPayment(id: number, confirmData: CodConfirmRequestDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.CONFIRM_COD(id),
                confirmData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Reject COD payment
     */
    async rejectCodPayment(id: number, rejectionData: CodRejectionRequestDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.REJECT_COD(id),
                rejectionData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Reattempt COD delivery
     */
    async reattemptCodDelivery(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(PAYMENT_ENDPOINTS.REATTEMPT_COD(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    // OTP OPERATIONS

    /**
     * Send OTP for delivery confirmation
     */
    async sendDeliveryConfirmationOtp(orderId: number): Promise<ApiResponse<string>> {
        try {
            const response = await apiConfig.post<ApiResponse<string>>(PAYMENT_ENDPOINTS.SEND_OTP(orderId));
            return response.data;
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Confirm delivery with OTP
     */
    async confirmDeliveryWithOtp(orderId: number, otpData: OtpConfirmRequestDTO): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.CONFIRM_OTP(orderId),
                otpData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    // PAYMENT METHOD OPERATIONS

    /**
     * Get all payment methods
     */
    async getPaymentMethods(): Promise<ApiResponse<PaymentMethodResponseDTO[]>> {
        try {
            const response = await apiConfig.get<PaymentMethodResponseDTO[]>(PAYMENT_ENDPOINTS.METHODS.LIST);
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get active payment methods
     */
    async getActivePaymentMethods(): Promise<ApiResponse<PaymentMethodResponseDTO[]>> {
        try {
            const response = await apiConfig.get<PaymentMethodResponseDTO[]>(PAYMENT_ENDPOINTS.METHODS.GET_ACTIVE);
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment method by ID
     */
    async getPaymentMethodById(id: number): Promise<ApiResponse<PaymentMethodResponseDTO>> {
        try {
            const response = await apiConfig.get<PaymentMethodResponseDTO>(PAYMENT_ENDPOINTS.METHODS.VIEW(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment methods by type
     */
    async getPaymentMethodsByType(type: PaymentMethodType): Promise<ApiResponse<PaymentMethodResponseDTO[]>> {
        try {
            const response = await apiConfig.get<PaymentMethodResponseDTO[]>(PAYMENT_ENDPOINTS.METHODS.BY_TYPE(type));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Create payment method
     */
    async createPaymentMethod(methodData: PaymentMethodCreateDTO): Promise<ApiResponse<PaymentMethodResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentMethodResponseDTO>(
                PAYMENT_ENDPOINTS.METHODS.CREATE,
                methodData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Update payment method
     */
    async updatePaymentMethod(id: number, updateData: PaymentMethodUpdateDTO): Promise<ApiResponse<PaymentMethodResponseDTO>> {
        try {
            const response = await apiConfig.put<PaymentMethodResponseDTO>(
                PAYMENT_ENDPOINTS.METHODS.UPDATE(id),
                updateData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Delete payment method
     */
    async deletePaymentMethod(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(PAYMENT_ENDPOINTS.METHODS.DELETE(id));
            return PaymentService.wrapResponse(undefined);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Toggle payment method status
     */
    async togglePaymentMethodStatus(id: number): Promise<ApiResponse<PaymentMethodResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentMethodResponseDTO>(
                PAYMENT_ENDPOINTS.ADMIN.METHODS.TOGGLE_STATUS(id)
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    // ADMIN OPERATIONS

    /**
     * Get admin payments (with more detailed information)
     */
    async getAdminPayments(
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10, sort: 'createdAt,desc' }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
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

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.ADMIN.LIST}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Update payment status (admin)
     */
    async updatePaymentStatus(
        id: number,
        statusData: { status: PaymentStatus; note?: string }
    ): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.put<PaymentResponseDTO>(
                PAYMENT_ENDPOINTS.ADMIN.UPDATE_STATUS(id),
                statusData
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Complete payment (admin)
     */
    async completePayment(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
        try {
            const response = await apiConfig.post<PaymentResponseDTO>(PAYMENT_ENDPOINTS.ADMIN.COMPLETE(id));
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(): Promise<ApiResponse<PaymentStatsResponseDTO>> {
        try {
            const response = await apiConfig.get<PaymentStatsResponseDTO>(PAYMENT_ENDPOINTS.ADMIN.STATS);
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Export payments
     */
    async exportPayments(
        filters?: PaymentFilterRequestDTO
    ): Promise<ApiResponse<Blob>> {
        try {
            const params = new URLSearchParams();

            // Add filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        params.append(key, String(value));
                    }
                });
            }

            const response = await apiConfig.get(
                `${PAYMENT_ENDPOINTS.ADMIN.EXPORT}?${params.toString()}`,
                { responseType: 'blob' }
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Filter payments
     */
    async filterPayments(
        filters: PaymentFilterRequestDTO,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            // Add filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.FILTER}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Search payments
     */
    async searchPayments(
        keyword: string,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('search', keyword.trim());
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payments by date range
     */
    async getPaymentsByDateRange(
        startDate: string,
        endDate: string,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('startDate', startDate);
            params.append('endDate', endDate);
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.ADMIN.BY_DATE_RANGE}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payments by status
     */
    async getPaymentsByStatus(
        status: PaymentStatus,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.ADMIN.BY_STATUS(status)}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }

    /**
     * Get payments by method
     */
    async getPaymentsByMethod(
        methodId: number,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<{ content: PaymentResponseDTO[], totalElements: number, totalPages: number }>(
                `${PAYMENT_ENDPOINTS.ADMIN.BY_METHOD(methodId)}?${params.toString()}`
            );
            return PaymentService.wrapResponse(response.data);
        } catch (err) {
            throw PaymentService.createErrorResponse(err);
        }
    }
}

export default new PaymentService();