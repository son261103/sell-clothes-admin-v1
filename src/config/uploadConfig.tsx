import axios, { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
import apiConfig from './apiConfig';

export type AllowedFileType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as AllowedFileType[],
    UPLOAD_ENDPOINTS: {
        UPLOAD_SINGLE: '/uploads/single',
        UPLOAD_MULTIPLE: '/uploads/multiple',
        DELETE_FILE: '/uploads/delete',
    },
} as const;

interface UploadResponse {
    url: string;
    filename: string;
    size: number;
    mimetype: AllowedFileType;
}

interface UploadError {
    code: string;
    message: string;
    field?: string;
}

export const validateFile = (file: File): UploadError | null => {
    if (!file) {
        return { code: 'NO_FILE', message: 'No file provided' };
    }

    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as AllowedFileType)) {
        return {
            code: 'INVALID_TYPE',
            message: `File type not allowed. Allowed types: ${UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}`,
            field: 'file'
        };
    }

    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            field: 'file'
        };
    }

    return null;
};

export const uploadSingleFile = async (
    file: File,
    onProgress?: (progress: number) => void,
    customConfig?: AxiosRequestConfig
): Promise<ApiResponse<UploadResponse>> => {
    const validationError = validateFile(file);
    if (validationError) {
        return Promise.reject(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
        ...customConfig,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            }
        },
    };

    try {
        const response = await apiConfig.post<ApiResponse<UploadResponse>>(
            UPLOAD_CONFIG.UPLOAD_ENDPOINTS.UPLOAD_SINGLE,
            formData,
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw error.response.data;
        }
        throw error;
    }
};

export const uploadMultipleFiles = async (
    files: File[],
    onProgress?: (progress: number, index: number) => void,
    customConfig?: AxiosRequestConfig
): Promise<ApiResponse<UploadResponse[]>> => {
    // Validate all files first
    const validationErrors = files.map(validateFile).filter((error): error is UploadError => error !== null);
    if (validationErrors.length > 0) {
        return Promise.reject(validationErrors);
    }

    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });

    const config: AxiosRequestConfig = {
        ...customConfig,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                files.forEach((_, index) => onProgress(progress, index));
            }
        },
    };

    try {
        const response = await apiConfig.post<ApiResponse<UploadResponse[]>>(
            UPLOAD_CONFIG.UPLOAD_ENDPOINTS.UPLOAD_MULTIPLE,
            formData,
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw error.response.data;
        }
        throw error;
    }
};

export const deleteUploadedFile = async (
    filename: string,
    customConfig?: AxiosRequestConfig
): Promise<ApiResponse<void>> => {
    try {
        const response = await apiConfig.delete<ApiResponse<void>>(
            `${UPLOAD_CONFIG.UPLOAD_ENDPOINTS.DELETE_FILE}/${filename}`,
            customConfig
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw error.response.data;
        }
        throw error;
    }
};

// Example usage with the UserCreateFormData and UserUpdateFormData
export const uploadUserAvatar = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const response = await uploadSingleFile(file, onProgress);
    return response.data.url;
};

export default {
    ...UPLOAD_CONFIG,
    validateFile,
    uploadSingleFile,
    uploadMultipleFiles,
    deleteUploadedFile,
    uploadUserAvatar,
};