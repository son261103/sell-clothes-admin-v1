import apiConfig from '../config/apiConfig';
import { PRODUCT_ENDPOINTS } from '../constants/productConstant';
import type {
    ProductResponse,
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductPageResponse,
    ProductPageRequest,
    ProductHierarchyResponse,
    ProductFilters
} from '../types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class ProductService {
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

    async getAllProducts(
        pageRequest: ProductPageRequest = { page: 0, size: 10, sort: 'productId,desc' },
        filters: ProductFilters = {}
    ): Promise<ApiResponse<ProductPageResponse>> {
        try {
            const params = new URLSearchParams();

            // Pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'productId,desc');

            // Filter params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    if (key === 'search' && typeof value === 'string') {
                        params.append('search', value.trim());
                    } else if (key === 'status' && typeof value === 'boolean') {
                        params.append('status', String(value));
                    } else if (key === 'categoryId' && typeof value === 'number') {
                        params.append('categoryId', String(value));
                    } else if (key === 'brandId' && typeof value === 'number') {
                        params.append('brandId', String(value));
                    } else if (key === 'minPrice' && typeof value === 'number') {
                        params.append('minPrice', String(value));
                    } else if (key === 'maxPrice' && typeof value === 'number') {
                        params.append('maxPrice', String(value));
                    } else if (key === 'sortBy') {
                        params.append('sortBy', String(value));
                    } else if (key === 'sortDirection') {
                        params.append('sortDirection', String(value));
                    }
                }
            });

            const response = await apiConfig.get<ProductPageResponse>(
                `${PRODUCT_ENDPOINTS.LIST}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductHierarchy(): Promise<ApiResponse<ProductHierarchyResponse>> {
        try {
            const response = await apiConfig.get<ProductHierarchyResponse>(PRODUCT_ENDPOINTS.HIERARCHY);
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async createProduct(productData: ProductCreateRequest, thumbnailFile?: File): Promise<ApiResponse<ProductResponse>> {
        try {
            const formData = new FormData();
            formData.append('product', JSON.stringify(productData));
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            const response = await apiConfig.post<ProductResponse>(
                PRODUCT_ENDPOINTS.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async updateProduct(id: number, productData: ProductUpdateRequest, thumbnailFile?: File): Promise<ApiResponse<ProductResponse>> {
        try {
            const formData = new FormData();
            formData.append('product', JSON.stringify(productData));
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            const response = await apiConfig.put<ProductResponse>(
                PRODUCT_ENDPOINTS.EDIT(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async deleteProduct(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(PRODUCT_ENDPOINTS.DELETE(id));
            return ProductService.wrapResponse(undefined);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductById(id: number): Promise<ApiResponse<ProductResponse>> {
        try {
            const response = await apiConfig.get<ProductResponse>(PRODUCT_ENDPOINTS.VIEW(id));
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductBySlug(slug: string): Promise<ApiResponse<ProductResponse>> {
        try {
            const response = await apiConfig.get<ProductResponse>(PRODUCT_ENDPOINTS.VIEW_BY_SLUG(slug));
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductsByCategory(categoryId: number): Promise<ApiResponse<ProductResponse[]>> {
        try {
            const response = await apiConfig.get<ProductResponse[]>(PRODUCT_ENDPOINTS.BY_CATEGORY(categoryId));
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductsByBrand(brandId: number): Promise<ApiResponse<ProductResponse[]>> {
        try {
            const response = await apiConfig.get<ProductResponse[]>(PRODUCT_ENDPOINTS.BY_BRAND(brandId));
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async toggleProductStatus(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.patch(PRODUCT_ENDPOINTS.TOGGLE_STATUS(id));
            return ProductService.wrapResponse(undefined);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async searchProducts(
        keyword?: string,
        minPrice?: number,
        maxPrice?: number,
        categoryId?: number,
        brandId?: number,
        status?: boolean,
        pageRequest: ProductPageRequest = { page: 0, size: 10 }
    ): Promise<ApiResponse<ProductPageResponse>> {
        try {
            const params = new URLSearchParams();

            // Add search parameters
            if (keyword) params.append('keyword', keyword.trim());
            if (minPrice !== undefined) params.append('minPrice', String(minPrice));
            if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice));
            if (categoryId !== undefined) params.append('categoryId', String(categoryId));
            if (brandId !== undefined) params.append('brandId', String(brandId));
            if (status !== undefined) params.append('status', String(status));

            // Add pagination parameters
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<ProductPageResponse>(
                `${PRODUCT_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getProductsOnSale(pageRequest: ProductPageRequest = { page: 0, size: 10 }): Promise<ApiResponse<ProductPageResponse>> {
        try {
            const params = new URLSearchParams();
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<ProductPageResponse>(
                `${PRODUCT_ENDPOINTS.SALE}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getLatestProducts(limit: number = 10, pageRequest: ProductPageRequest = { page: 0, size: 10 }): Promise<ApiResponse<ProductPageResponse>> {
        try {
            const params = new URLSearchParams();
            params.append('limit', String(limit));
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            if (pageRequest.sort) params.append('sort', pageRequest.sort);

            const response = await apiConfig.get<ProductPageResponse>(
                `${PRODUCT_ENDPOINTS.LATEST}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<ProductResponse[]>> {
        try {
            const params = new URLSearchParams();
            params.append('limit', String(limit));

            const response = await apiConfig.get<ProductResponse[]>(
                `${PRODUCT_ENDPOINTS.FEATURED}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }

    async getRelatedProducts(productId: number, limit: number = 4): Promise<ApiResponse<ProductResponse[]>> {
        try {
            const params = new URLSearchParams();
            params.append('limit', String(limit));

            const response = await apiConfig.get<ProductResponse[]>(
                `${PRODUCT_ENDPOINTS.RELATED(productId)}?${params.toString()}`
            );
            return ProductService.wrapResponse(response.data);
        } catch (err) {
            throw ProductService.createErrorResponse(err);
        }
    }
}

export default new ProductService();