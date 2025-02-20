import apiConfig from '../config/apiConfig';
import { CATEGORY_ENDPOINTS } from '../constants/categoryConstant';
import {
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
    CategoryHierarchyResponse,
    CategoryPageRequest,
    CategoryPageResponse,
    CategoryFilters
} from '../types';
import { AxiosError } from 'axios';
import { ApiResponse, ErrorResponse } from '../types';

class CategoryService {
    private static createErrorResponse(err: unknown): ErrorResponse {
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

    // Parent Category Methods
    async getAllParentCategories(
        pageRequest: CategoryPageRequest = { page: 0, size: 10, sort: 'categoryId,desc' },
        filters: CategoryFilters = {}
    ): Promise<ApiResponse<CategoryPageResponse>> {
        try {
            const params = new URLSearchParams();

            // Pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'categoryId,desc');

            // Filter params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    switch (key) {
                        case 'search':
                            if (typeof value === 'string' && value.trim()) {
                                params.append('search', value.trim());
                            }
                            break;
                        case 'status':
                            params.append('status', String(value));
                            break;
                        case 'sortBy':
                            params.append('sortBy', String(value));
                            break;
                        case 'sortDirection':
                            params.append('sortDirection', String(value));
                            break;
                    }
                }
            });

            console.debug('[CategoryService] Request URL:', `${CATEGORY_ENDPOINTS.PARENT.LIST}?${params.toString()}`);
            console.debug('[CategoryService] Applied filters:', filters);

            const response = await apiConfig.get<CategoryPageResponse>(
                `${CATEGORY_ENDPOINTS.PARENT.LIST}?${params.toString()}`
            );

            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            console.error('[CategoryService] Error in getAllParentCategories:', err);
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getAllActiveParentCategories(): Promise<ApiResponse<CategoryResponse[]>> {
        try {
            const response = await apiConfig.get<CategoryResponse[]>(CATEGORY_ENDPOINTS.PARENT.LIST_ACTIVE);
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getParentCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.get<CategoryResponse>(CATEGORY_ENDPOINTS.PARENT.VIEW(id));
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async createParentCategory(categoryData: CategoryCreateRequest): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.post<CategoryResponse>(
                CATEGORY_ENDPOINTS.PARENT.CREATE,
                categoryData
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async updateParentCategory(
        id: number,
        categoryData: CategoryUpdateRequest
    ): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.put<CategoryResponse>(
                CATEGORY_ENDPOINTS.PARENT.EDIT(id),
                categoryData
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async toggleParentCategoryStatus(id: number): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.put<CategoryResponse>(
                CATEGORY_ENDPOINTS.PARENT.TOGGLE_STATUS(id)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async deleteParentCategory(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(CATEGORY_ENDPOINTS.PARENT.DELETE(id));
            return CategoryService.wrapResponse(undefined);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getParentCategoryHierarchy(id: number): Promise<ApiResponse<CategoryHierarchyResponse>> {
        try {
            const response = await apiConfig.get<CategoryHierarchyResponse>(
                CATEGORY_ENDPOINTS.PARENT.GET_HIERARCHY(id)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getParentCategoryByName(name: string): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.get<CategoryResponse>(
                CATEGORY_ENDPOINTS.PARENT.GET_BY_NAME(name)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getParentCategoryBySlug(slug: string): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.get<CategoryResponse>(
                CATEGORY_ENDPOINTS.PARENT.GET_BY_SLUG(slug)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    // Sub-Category Methods
    async getAllSubCategories(parentId: number): Promise<ApiResponse<CategoryResponse[]>> {
        try {
            const response = await apiConfig.get<CategoryResponse[]>(
                CATEGORY_ENDPOINTS.SUB.LIST(parentId)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getAllActiveSubCategories(parentId: number): Promise<ApiResponse<CategoryResponse[]>> {
        try {
            const response = await apiConfig.get<CategoryResponse[]>(
                CATEGORY_ENDPOINTS.SUB.LIST_ACTIVE(parentId)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async getSubCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.get<CategoryResponse>(
                CATEGORY_ENDPOINTS.SUB.VIEW(id)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async createSubCategory(
        parentId: number,
        categoryData: CategoryCreateRequest
    ): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.post<CategoryResponse>(
                CATEGORY_ENDPOINTS.SUB.CREATE(parentId),
                categoryData
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async updateSubCategory(
        id: number,
        categoryData: CategoryUpdateRequest
    ): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.put<CategoryResponse>(
                CATEGORY_ENDPOINTS.SUB.EDIT(id),
                categoryData
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async toggleSubCategoryStatus(id: number): Promise<ApiResponse<CategoryResponse>> {
        try {
            const response = await apiConfig.put<CategoryResponse>(
                CATEGORY_ENDPOINTS.SUB.TOGGLE_STATUS(id)
            );
            return CategoryService.wrapResponse(response.data);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }

    async deleteSubCategory(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(CATEGORY_ENDPOINTS.SUB.DELETE(id));
            return CategoryService.wrapResponse(undefined);
        } catch (err) {
            throw CategoryService.createErrorResponse(err);
        }
    }
}

export default new CategoryService();