import apiConfig from '../config/apiConfig';
import { PRODUCT_VARIANT_ENDPOINTS } from '../constants/productVariantsConstant';
import type {
    ProductVariantResponse,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest,
    ProductVariantPageResponse,
    ProductVariantPageRequest,
    ProductVariantHierarchyResponse,
    ProductVariantFilters,
    BulkProductVariantCreateRequest,
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class ProductVariantService {
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

    async getVariantsByProductId(productId: number): Promise<ApiResponse<ProductVariantResponse[]>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_BY_PRODUCT(productId)
            );
            console.log('API Response for getVariantsByProductId:', response.data); // Thêm log
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    // Các phương thức khác giữ nguyên
    async getFilteredVariants(
        pageRequest: ProductVariantPageRequest = { page: 0, size: 10, sort: 'variantId,desc' },
        filters: ProductVariantFilters = {}
    ): Promise<ApiResponse<ProductVariantPageResponse>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'variantId,desc');
            if (filters.productId !== undefined) params.append('productId', String(filters.productId));
            if (filters.size !== undefined) params.append('size', filters.size);
            if (filters.color !== undefined) params.append('color', filters.color);
            if (filters.status !== undefined) params.append('status', String(filters.status));
            const response = await apiConfig.get<ProductVariantPageResponse>(
                `${PRODUCT_VARIANT_ENDPOINTS.GET_FILTERED}?${params.toString()}`
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getVariantHierarchy(productId: number): Promise<ApiResponse<ProductVariantHierarchyResponse>> {
        try {
            const response = await apiConfig.get<ProductVariantHierarchyResponse>(
                PRODUCT_VARIANT_ENDPOINTS.GET_HIERARCHY(productId)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async createVariant(variantData: ProductVariantCreateRequest, imageFile?: File): Promise<ApiResponse<ProductVariantResponse>> {
        try {
            const formData = new FormData();
            formData.append('variant', JSON.stringify(variantData));
            if (imageFile) formData.append('image', imageFile);
            const response = await apiConfig.post<ProductVariantResponse>(
                PRODUCT_VARIANT_ENDPOINTS.CREATE,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async bulkCreateVariants(bulkData: BulkProductVariantCreateRequest, colorImages: Record<string, File>): Promise<ApiResponse<ProductVariantResponse[]>> {
        try {
            const formData = new FormData();
            formData.append('variants', JSON.stringify(bulkData));
            Object.entries(colorImages).forEach(([color, file]) => formData.append(color, file));
            const response = await apiConfig.post<ProductVariantResponse[]>(
                PRODUCT_VARIANT_ENDPOINTS.BULK_CREATE,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async updateVariant(id: number, variantData: ProductVariantUpdateRequest, imageFile?: File): Promise<ApiResponse<ProductVariantResponse>> {
        try {
            const formData = new FormData();
            formData.append('variant', JSON.stringify(variantData));
            if (imageFile) formData.append('image', imageFile);
            const response = await apiConfig.put<ProductVariantResponse>(
                PRODUCT_VARIANT_ENDPOINTS.EDIT(id),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async deleteVariant(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(PRODUCT_VARIANT_ENDPOINTS.DELETE(id));
            return ProductVariantService.wrapResponse(undefined);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getVariantById(id: number): Promise<ApiResponse<ProductVariantResponse>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse>(
                PRODUCT_VARIANT_ENDPOINTS.VIEW(id)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getVariantBySku(sku: string): Promise<ApiResponse<ProductVariantResponse>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse>(
                PRODUCT_VARIANT_ENDPOINTS.GET_BY_SKU(sku)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getActiveVariantsByProductId(productId: number): Promise<ApiResponse<ProductVariantResponse[]>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_ACTIVE_BY_PRODUCT(productId)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async toggleVariantStatus(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.patch(PRODUCT_VARIANT_ENDPOINTS.TOGGLE_STATUS(id));
            return ProductVariantService.wrapResponse(undefined);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async updateStockQuantity(id: number, quantity: number): Promise<ApiResponse<ProductVariantResponse>> {
        try {
            const response = await apiConfig.patch<ProductVariantResponse>(
                PRODUCT_VARIANT_ENDPOINTS.UPDATE_STOCK(id),
                null,
                { params: { quantity } }
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getLowStockVariants(): Promise<ApiResponse<ProductVariantResponse[]>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_LOW_STOCK
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getOutOfStockVariants(): Promise<ApiResponse<ProductVariantResponse[]>> {
        try {
            const response = await apiConfig.get<ProductVariantResponse[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_OUT_OF_STOCK
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async checkVariantAvailability(productId: number, size: string, color: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<boolean>(
                PRODUCT_VARIANT_ENDPOINTS.CHECK_AVAILABILITY,
                { params: { productId, size, color } }
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getAvailableSizes(productId: number): Promise<ApiResponse<string[]>> {
        try {
            const response = await apiConfig.get<string[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_AVAILABLE_SIZES(productId)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }

    async getAvailableColors(productId: number): Promise<ApiResponse<string[]>> {
        try {
            const response = await apiConfig.get<string[]>(
                PRODUCT_VARIANT_ENDPOINTS.GET_AVAILABLE_COLORS(productId)
            );
            return ProductVariantService.wrapResponse(response.data);
        } catch (err) {
            throw ProductVariantService.createErrorResponse(err);
        }
    }
}

export default new ProductVariantService();