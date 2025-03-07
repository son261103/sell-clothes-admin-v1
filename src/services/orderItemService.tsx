import apiConfig from '../config/apiConfig';

import type {
    OrderItemResponse,
    OrderItemRequest,
    OrderItemUpdateRequest,
    BestsellingVariantDTO,
    BestsellingProductDTO,
    ProductSalesDataDTO
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';
import {ORDER_ITEM_ENDPOINTS} from "@/constants/orderItemConstant.tsx";

class OrderItemService {
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

    /**
     * Get all items for a specific order
     */
    async getOrderItems(orderId: number): Promise<ApiResponse<OrderItemResponse[]>> {
        try {
            const response = await apiConfig.get<OrderItemResponse[]>(
                ORDER_ITEM_ENDPOINTS.GET_ORDER_ITEMS(orderId)
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Get a specific order item
     */
    async getOrderItem(orderId: number, itemId: number): Promise<ApiResponse<OrderItemResponse>> {
        try {
            const response = await apiConfig.get<OrderItemResponse>(
                ORDER_ITEM_ENDPOINTS.GET_ORDER_ITEM(orderId, itemId)
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Add an item to an order
     */
    async addOrderItem(orderId: number, item: OrderItemRequest): Promise<ApiResponse<OrderItemResponse>> {
        try {
            const response = await apiConfig.post<OrderItemResponse>(
                ORDER_ITEM_ENDPOINTS.ADD_ITEM(orderId),
                item
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Update an existing order item
     */
    async updateOrderItem(orderId: number, itemId: number, updateData: OrderItemUpdateRequest): Promise<ApiResponse<OrderItemResponse>> {
        try {
            const response = await apiConfig.put<OrderItemResponse>(
                ORDER_ITEM_ENDPOINTS.UPDATE_ITEM(orderId, itemId),
                updateData
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Remove an item from an order
     */
    async removeOrderItem(orderId: number, itemId: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(
                ORDER_ITEM_ENDPOINTS.REMOVE_ITEM(orderId, itemId)
            );
            return OrderItemService.wrapResponse(undefined);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    // Admin Methods

    /**
     * Get bestselling variants (admin)
     */
    async getBestsellingVariants(limit: number = 10): Promise<ApiResponse<BestsellingVariantDTO[]>> {
        try {
            const response = await apiConfig.get<BestsellingVariantDTO[]>(
                `${ORDER_ITEM_ENDPOINTS.BESTSELLING_VARIANTS}?limit=${limit}`
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Get bestselling products (admin)
     */
    async getBestsellingProducts(limit: number = 10): Promise<ApiResponse<BestsellingProductDTO[]>> {
        try {
            const response = await apiConfig.get<BestsellingProductDTO[]>(
                `${ORDER_ITEM_ENDPOINTS.BESTSELLING_PRODUCTS}?limit=${limit}`
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Get sales data for a specific product (admin)
     */
    async getProductSalesData(productId: number): Promise<ApiResponse<ProductSalesDataDTO>> {
        try {
            const response = await apiConfig.get<ProductSalesDataDTO>(
                ORDER_ITEM_ENDPOINTS.PRODUCT_SALES(productId)
            );
            return OrderItemService.wrapResponse(response.data);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }

    /**
     * Restore inventory for a cancelled order (admin)
     */
    async restoreInventory(orderId: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.post(`/api/orders/admin/${orderId}/restore-inventory`);
            return OrderItemService.wrapResponse(undefined);
        } catch (err) {
            throw OrderItemService.createErrorResponse(err);
        }
    }
}

export default new OrderItemService();