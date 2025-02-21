import apiConfig from '../config/apiConfig';
import {BRAND_ENDPOINTS} from '../constants/brandConstant';
import {ApiResponse} from '@/types';
import {AxiosError} from 'axios';

import {setUploadProgress} from '../store/features/brand/brandLogoSlice';
import {store} from "@/store/store.tsx";

class BrandLogoService {
    private static createErrorResponse(err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
            return {
                success: false,
                message: err.response.data.message || err.message,
                errorCode: err.response.data.errorCode
            };
        }

        console.error('Logo operation error:', err);

        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
            errorCode: 'UNKNOWN_ERROR'
        };
    }

    private static wrapResponse<T>(data: T, message?: string): ApiResponse<T> {
        return {
            success: true,
            data,
            message: message || 'Operation successful'
        };
    }

    async uploadLogo(file: File, brandId?: number): Promise<ApiResponse<string>> {
        try {
            // Validate file
            this.validateFile(file);

            const formData = new FormData();
            formData.append('logo', file);

            // Thêm brandId nếu có
            if (brandId) {
                formData.append('brandId', brandId.toString());
            }

            const response = await apiConfig.post<string>(
                BRAND_ENDPOINTS.LOGO.UPLOAD,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            store.dispatch(setUploadProgress(progress));
                        }
                    }
                }
            );
            return BrandLogoService.wrapResponse(response.data, 'Logo uploaded successfully');
        } catch (err) {
            console.error('Error uploading logo:', err);
            throw BrandLogoService.createErrorResponse(err);
        }
    }

    async updateLogo(file: File, oldUrl: string, brandId: number): Promise<ApiResponse<string>> {
        try {
            // Validate file
            this.validateFile(file);

            // Validate oldUrl
            if (!oldUrl || !oldUrl.trim()) {
                throw new Error('Old logo URL is required');
            }

            // Validate brandId
            if (!brandId) {
                throw new Error('Brand ID is required');
            }

            const trimmedOldUrl = oldUrl.trim();

            const formData = new FormData();
            formData.append('logo', file);
            formData.append('oldUrl', trimmedOldUrl);
            formData.append('brandId', brandId.toString());

            const response = await apiConfig.put<string>(
                BRAND_ENDPOINTS.LOGO.UPDATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            store.dispatch(setUploadProgress(progress));
                        }
                    }
                }
            );

            return BrandLogoService.wrapResponse(response.data, 'Logo updated successfully');
        } catch (err) {
            console.error('Error updating logo:', err);
            throw BrandLogoService.createErrorResponse(err);
        }
    }

    async deleteLogo(logoUrl: string, brandId?: number): Promise<ApiResponse<void>> {
        try {
            // Validate logoUrl
            if (!logoUrl || !logoUrl.trim()) {
                throw new Error('Logo URL is required');
            }

            const trimmedLogoUrl = logoUrl.trim();

            // Chuẩn bị tham số
            const params: Record<string, string> = { url: trimmedLogoUrl };

            // Thêm brandId nếu có
            if (brandId) {
                params.brandId = brandId.toString();
            }

            await apiConfig.delete(BRAND_ENDPOINTS.LOGO.DELETE, {
                params: params
            });

            return BrandLogoService.wrapResponse(undefined, 'Logo deleted successfully');
        } catch (err) {
            console.error('Error deleting logo:', err);
            throw BrandLogoService.createErrorResponse(err);
        }
    }

    private validateFile(file: File): void {
        // Check if file exists
        if (!file) {
            throw new Error('No file provided');
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('File size exceeds the maximum limit of 2MB');
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed');
        }
    }
}

export default new BrandLogoService();