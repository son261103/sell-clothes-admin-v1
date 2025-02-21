import apiConfig from '../config/apiConfig';
import { BRAND_ENDPOINTS } from '../constants/brandConstant';
import type {
    BrandResponse,
    BrandCreateRequest,
    BrandUpdateRequest,
    BrandPageResponse,
    BrandPageRequest,
    BrandHierarchyResponse,
    BrandFilters
} from '../types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

class BrandService {
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

    async getAllBrands(
        pageRequest: BrandPageRequest = { page: 0, size: 10, sort: 'brandId,desc' },
        filters: BrandFilters = {}
    ): Promise<ApiResponse<BrandPageResponse>> {
        try {
            const params = new URLSearchParams();

            // Pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'brandId,desc');

            // Filter params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    if (key === 'search' && typeof value === 'string') {
                        params.append('search', value.trim());
                    } else if (key === 'status' && typeof value === 'boolean') {
                        params.append('status', String(value));
                    } else if (key === 'sortBy') {
                        params.append('sortBy', String(value));
                    } else if (key === 'sortDirection') {
                        params.append('sortDirection', String(value));
                    }
                }
            });

            const response = await apiConfig.get<BrandPageResponse>(
                `${BRAND_ENDPOINTS.LIST}?${params.toString()}`
            );

            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async getActiveBrands(): Promise<ApiResponse<BrandResponse[]>> {
        try {
            const response = await apiConfig.get<BrandResponse[]>(BRAND_ENDPOINTS.LIST_ACTIVE);
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async getBrandById(id: number): Promise<ApiResponse<BrandResponse>> {
        try {
            const response = await apiConfig.get<BrandResponse>(BRAND_ENDPOINTS.VIEW(id));
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async createBrand(brandData: BrandCreateRequest, logoFile?: File): Promise<ApiResponse<BrandResponse>> {
        try {
            const formData = new FormData();
            formData.append('brand', JSON.stringify(brandData));
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await apiConfig.post<BrandResponse>(
                BRAND_ENDPOINTS.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async updateBrand(id: number, brandData: BrandUpdateRequest, logoFile?: File): Promise<ApiResponse<BrandResponse>> {
        try {
            const formData = new FormData();
            formData.append('brand', JSON.stringify(brandData));
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await apiConfig.put<BrandResponse>(
                BRAND_ENDPOINTS.EDIT(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async deleteBrand(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(BRAND_ENDPOINTS.DELETE(id));
            return BrandService.wrapResponse(undefined);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async getBrandHierarchy(): Promise<ApiResponse<BrandHierarchyResponse>> {
        try {
            const response = await apiConfig.get<BrandHierarchyResponse>(BRAND_ENDPOINTS.HIERARCHY);
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async searchBrands(keyword?: string): Promise<ApiResponse<BrandResponse[]>> {
        try {
            const params = new URLSearchParams();
            if (keyword) {
                params.append('keyword', keyword.trim());
            }

            const response = await apiConfig.get<BrandResponse[]>(
                `${BRAND_ENDPOINTS.SEARCH}?${params.toString()}`
            );
            return BrandService.wrapResponse(response.data);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }

    async toggleBrandStatus(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.patch(BRAND_ENDPOINTS.TOGGLE_STATUS(id));
            return BrandService.wrapResponse(undefined);
        } catch (err) {
            throw BrandService.createErrorResponse(err);
        }
    }
}

export default new BrandService();
