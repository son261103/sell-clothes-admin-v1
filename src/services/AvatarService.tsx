import apiConfig from '../config/apiConfig';
import { USER_ENDPOINTS } from '../constants/userConstant';
import type { UserResponse } from '../types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

class AvatarService {
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

    async uploadAvatar(userId: number, file: File): Promise<ApiResponse<UserResponse>> {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiConfig.post<UserResponse>(
                USER_ENDPOINTS.UPLOAD_AVATAR(userId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return {
                success: true,
                data: response.data,
                message: 'Avatar uploaded successfully'
            };
        } catch (err) {
            throw AvatarService.createErrorResponse(err);
        }
    }

    async updateAvatar(userId: number, file: File): Promise<ApiResponse<UserResponse>> {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiConfig.put<UserResponse>(
                USER_ENDPOINTS.UPDATE_AVATAR(userId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return {
                success: true,
                data: response.data,
                message: 'Avatar updated successfully'
            };
        } catch (err) {
            throw AvatarService.createErrorResponse(err);
        }
    }

    async deleteAvatar(userId: number): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.delete<UserResponse>(
                USER_ENDPOINTS.DELETE_AVATAR(userId)
            );
            return {
                success: true,
                data: response.data,
                message: 'Avatar deleted successfully'
            };
        } catch (err) {
            throw AvatarService.createErrorResponse(err);
        }
    }
}

export default new AvatarService();