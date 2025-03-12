import apiConfig from '../config/apiConfig';
import { COUPON_ENDPOINTS } from '../constants/orderCouponConstant.tsx';
import type {
    CouponResponseDTO,
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponValidationDTO,
    CouponPageRequest,
    CouponStatisticsDTO,
    CouponFilters, OrderWithCouponDTO, CouponDTO
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class CouponService {
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

    // Admin Methods

    /**
     * Get all coupons with pagination
     */
    async getAllCoupons(
        pageRequest: CouponPageRequest = { page: 0, size: 10, sort: 'code,asc' }
    ): Promise<ApiResponse<{ content: CouponResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'code,asc');

            const response = await apiConfig.get<{ content: CouponResponseDTO[], totalElements: number, totalPages: number }>(
                `${COUPON_ENDPOINTS.LIST}?${params.toString()}`
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Search coupons with filters
     */
    async searchCoupons(
        filters: CouponFilters = {},
        pageRequest: CouponPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<{ content: CouponResponseDTO[], totalElements: number, totalPages: number }>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            // Add filter parameters
            if (filters.code) params.append('code', filters.code);
            if (filters.status !== undefined) params.append('status', String(filters.status));
            if (filters.isExpired !== undefined) params.append('isExpired', String(filters.isExpired));
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiConfig.get<{ content: CouponResponseDTO[], totalElements: number, totalPages: number }>(
                `${COUPON_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get coupon by ID
     */
    async getCouponById(couponId: number): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO>(
                COUPON_ENDPOINTS.VIEW(couponId)
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get coupon by code (admin)
     */
    async getCouponByCode(code: string): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO>(
                COUPON_ENDPOINTS.VIEW_BY_CODE(code)
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Create a new coupon
     */
    async createCoupon(couponData: CouponCreateDTO): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.post<CouponResponseDTO>(
                COUPON_ENDPOINTS.CREATE,
                couponData
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Update an existing coupon
     */
    async updateCoupon(
        couponId: number,
        updateData: CouponUpdateDTO
    ): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.put<CouponResponseDTO>(
                COUPON_ENDPOINTS.UPDATE(couponId),
                updateData
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Delete a coupon
     */
    async deleteCoupon(couponId: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(COUPON_ENDPOINTS.DELETE(couponId));
            return CouponService.wrapResponse(undefined);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Toggle coupon status (activate/deactivate)
     */
    async toggleCouponStatus(couponId: number): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.put<CouponResponseDTO>(
                COUPON_ENDPOINTS.TOGGLE(couponId)
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get all valid coupons (admin)
     */
    async getValidCoupons(): Promise<ApiResponse<CouponResponseDTO[]>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO[]>(
                COUPON_ENDPOINTS.VALID_COUPONS
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Validate a coupon (admin)
     */
    async validateCoupon(
        code: string,
        orderAmount: number
    ): Promise<ApiResponse<CouponValidationDTO>> {
        try {
            const params = new URLSearchParams();
            params.append('code', code);
            params.append('orderAmount', String(orderAmount));

            const response = await apiConfig.get<CouponValidationDTO>(
                `${COUPON_ENDPOINTS.ADMIN_VALIDATE}?${params.toString()}`
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get coupon statistics
     */
    async getCouponStatistics(): Promise<ApiResponse<CouponStatisticsDTO>> {
        try {
            const response = await apiConfig.get<CouponStatisticsDTO>(
                COUPON_ENDPOINTS.STATISTICS
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get public coupons
     */
    async getPublicCoupons(): Promise<ApiResponse<CouponResponseDTO[]>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO[]>(
                COUPON_ENDPOINTS.PUBLIC_COUPONS
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    // Client Methods

    /**
     * Get available coupons for client
     */
    async getAvailableCoupons(): Promise<ApiResponse<CouponResponseDTO[]>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO[]>(
                COUPON_ENDPOINTS.CLIENT_LIST
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Validate a coupon (client)
     */
    async validateClientCoupon(
        code: string,
        orderAmount: number
    ): Promise<ApiResponse<CouponValidationDTO>> {
        try {
            const params = new URLSearchParams();
            params.append('code', code);
            params.append('orderAmount', String(orderAmount));

            const response = await apiConfig.get<CouponValidationDTO>(
                `${COUPON_ENDPOINTS.CLIENT_VALIDATE}?${params.toString()}`
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get coupon details by code (client)
     */
    async getCouponDetailsByCode(code: string): Promise<ApiResponse<CouponResponseDTO>> {
        try {
            const response = await apiConfig.get<CouponResponseDTO>(
                COUPON_ENDPOINTS.CLIENT_VIEW(code)
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Quick check if coupon exists
     */
    async checkCouponExists(code: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<ApiResponse<boolean>>(
                COUPON_ENDPOINTS.CLIENT_CHECK(code)
            );
            return response.data;
        } catch (err) {
            return {
                success: false,
                data: false,
                message: err instanceof Error ? err.message : 'Coupon not found'
            };
        }
    }

    // Add these methods to your existing CouponService class

    /**
     * Apply a coupon to an order
     */
    async applyCouponToOrder(
        orderId: number,
        couponCode: string
    ): Promise<ApiResponse<OrderWithCouponDTO>> {
        try {
            const response = await apiConfig.post<OrderWithCouponDTO>(
                COUPON_ENDPOINTS.UPDATE_ORDER_COUPON(orderId),
                { couponCode }
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Remove a coupon from an order
     */
    async removeCouponFromOrder(
        orderId: number,
        couponCode: string
    ): Promise<ApiResponse<OrderWithCouponDTO>> {
        try {
            const response = await apiConfig.delete<OrderWithCouponDTO>(
                `${COUPON_ENDPOINTS.UPDATE_ORDER_COUPON(orderId)}?code=${couponCode}`
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }

    /**
     * Get coupons for an order
     */
    async getOrderCoupons(
        orderId: number
    ): Promise<ApiResponse<CouponDTO[]>> {
        try {
            const response = await apiConfig.get<CouponDTO[]>(
                COUPON_ENDPOINTS.ORDER_COUPONS(orderId)
            );
            return CouponService.wrapResponse(response.data);
        } catch (err) {
            throw CouponService.createErrorResponse(err);
        }
    }
}

export default new CouponService();