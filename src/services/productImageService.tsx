import apiConfig from '../config/apiConfig';
import { PRODUCT_IMAGE_ENDPOINTS } from '../constants/productImageConstant.tsx';
import type {
    ProductImageResponse,
    ProductImageHierarchyResponse,
    ProductImageUploadResponse,
    ProductImageUploadRequest,
    ProductImageFileUpdateRequest,
    ProductImageUpdateRequest,
    ProductImageReorderRequest,
    BulkProductImageCreateRequest
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class ProductImageService {
    private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    private validateFile(file: File): void {
        if (!file) {
            throw new Error('No file provided');
        }

        if (file.size > ProductImageService.MAX_FILE_SIZE) {
            throw new Error('File size exceeds the maximum limit of 5MB');
        }

        if (!ProductImageService.ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
        }
    }

    private validateFiles(files: File[]): void {
        if (!files.length) {
            throw new Error('No files provided');
        }

        files.forEach(file => this.validateFile(file));
    }

    async uploadImages(productId: number, request: ProductImageUploadRequest): Promise<ApiResponse<ProductImageUploadResponse>> {
        try {
            this.validateFiles(request.files);

            const formData = new FormData();
            request.files.forEach(file => {
                formData.append('files', file);
            });

            const response = await apiConfig.post<ProductImageUploadResponse>(
                PRODUCT_IMAGE_ENDPOINTS.UPLOAD(productId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async updateImageFile(imageId: number, request: ProductImageFileUpdateRequest): Promise<ApiResponse<ProductImageResponse>> {
        try {
            this.validateFile(request.file);

            const formData = new FormData();
            formData.append('file', request.file);

            const response = await apiConfig.put<ProductImageResponse>(
                PRODUCT_IMAGE_ENDPOINTS.UPDATE_FILE(imageId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async updateImage(imageId: number, request: ProductImageUpdateRequest): Promise<ApiResponse<ProductImageResponse>> {
        try {
            const response = await apiConfig.put<ProductImageResponse>(
                PRODUCT_IMAGE_ENDPOINTS.UPDATE(imageId),
                request
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async setPrimaryImage(imageId: number): Promise<ApiResponse<ProductImageResponse>> {
        try {
            const response = await apiConfig.patch<ProductImageResponse>(
                PRODUCT_IMAGE_ENDPOINTS.SET_PRIMARY(imageId)
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async reorderImages(productId: number, request: ProductImageReorderRequest): Promise<ApiResponse<ProductImageResponse[]>> {
        try {
            const response = await apiConfig.put<ProductImageResponse[]>(
                PRODUCT_IMAGE_ENDPOINTS.REORDER(productId),
                request
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async deleteImage(imageId: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(PRODUCT_IMAGE_ENDPOINTS.DELETE(imageId));
            return ProductImageService.wrapResponse(undefined);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async getProductImages(productId: number): Promise<ApiResponse<ProductImageResponse[]>> {
        try {
            const response = await apiConfig.get<ProductImageResponse[]>(
                PRODUCT_IMAGE_ENDPOINTS.LIST(productId)
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async getPrimaryImage(productId: number): Promise<ApiResponse<ProductImageResponse>> {
        try {
            const response = await apiConfig.get<ProductImageResponse>(
                PRODUCT_IMAGE_ENDPOINTS.GET_PRIMARY(productId)
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async getImageHierarchy(productId: number): Promise<ApiResponse<ProductImageHierarchyResponse>> {
        try {
            const response = await apiConfig.get<ProductImageHierarchyResponse>(
                PRODUCT_IMAGE_ENDPOINTS.GET_HIERARCHY(productId)
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }

    async bulkCreateImages(request: BulkProductImageCreateRequest): Promise<ApiResponse<ProductImageResponse[]>> {
        try {
            const response = await apiConfig.post<ProductImageResponse[]>(
                PRODUCT_IMAGE_ENDPOINTS.UPLOAD(request.productId),
                request
            );
            return ProductImageService.wrapResponse(response.data);
        } catch (err) {
            throw ProductImageService.createErrorResponse(err);
        }
    }
}

export default new ProductImageService();