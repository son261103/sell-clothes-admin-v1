import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BrandLogoService from '../../../services/brandLogoService';
import type { ErrorResponse } from '../../../types';

interface BrandLogoState {
    isLoading: boolean;
    error: string | null;
    currentLogo: string | undefined;
    message: string | undefined;
    isSuccess: boolean;
    uploadState: {
        progress: number;
        isUploading: boolean;
    };
}

const initialState: BrandLogoState = {
    isLoading: false,
    error: null,
    currentLogo: undefined,
    message: undefined,
    isSuccess: false,
    uploadState: {
        progress: 0,
        isUploading: false
    }
};

const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as ErrorResponse).message);
    }
    return 'An unexpected error occurred';
};

export const uploadLogo = createAsyncThunk(
    'brandLogo/upload',
    async ({ file, brandId }: { file: File; brandId?: number }, { rejectWithValue }) => {
        try {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                return rejectWithValue('Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.');
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                return rejectWithValue('File size exceeds the maximum limit of 2MB.');
            }

            const response = await BrandLogoService.uploadLogo(file, brandId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to upload logo');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateLogo = createAsyncThunk(
    'brandLogo/update',
    async ({ file, oldUrl, brandId }: { file: File; oldUrl: string; brandId: number }, { rejectWithValue }) => {
        try {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                return rejectWithValue('Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.');
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                return rejectWithValue('File size exceeds the maximum limit of 2MB.');
            }

            // Trim and validate oldUrl
            const trimmedOldUrl = oldUrl?.trim();
            if (!trimmedOldUrl) {
                return rejectWithValue('Old logo URL is required');
            }

            // Validate brandId
            if (!brandId) {
                return rejectWithValue('Brand ID is required');
            }

            const response = await BrandLogoService.updateLogo(file, trimmedOldUrl, brandId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update logo');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteLogo = createAsyncThunk(
    'brandLogo/delete',
    async ({ logoUrl, brandId }: { logoUrl: string; brandId?: number }, { rejectWithValue }) => {
        try {
            // Trim and validate logoUrl
            const trimmedLogoUrl = logoUrl?.trim();
            if (!trimmedLogoUrl) {
                return rejectWithValue('Logo URL is required');
            }

            const response = await BrandLogoService.deleteLogo(trimmedLogoUrl, brandId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete logo');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const brandLogoSlice = createSlice({
    name: 'brandLogo',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentLogo: (state) => {
            state.currentLogo = undefined;
        },
        clearMessage: (state) => {
            state.message = undefined;
        },
        setUploadProgress: (state, action) => {
            state.uploadState.progress = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Upload Logo
            .addCase(uploadLogo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
                state.isSuccess = false;
                state.uploadState.isUploading = true;
                state.uploadState.progress = 0;
            })
            .addCase(uploadLogo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLogo = action.payload.data;
                state.message = action.payload.message;
                state.error = null;
                state.isSuccess = true;
                state.uploadState.isUploading = false;
                state.uploadState.progress = 100;
            })
            .addCase(uploadLogo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
                state.isSuccess = false;
                state.uploadState.isUploading = false;
                state.uploadState.progress = 0;
            })

            // Update Logo
            .addCase(updateLogo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
                state.isSuccess = false;
                state.uploadState.isUploading = true;
                state.uploadState.progress = 0;
            })
            .addCase(updateLogo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLogo = action.payload.data;
                state.message = action.payload.message;
                state.error = null;
                state.isSuccess = true;
                state.uploadState.isUploading = false;
                state.uploadState.progress = 100;
            })
            .addCase(updateLogo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
                state.isSuccess = false;
                state.uploadState.isUploading = false;
                state.uploadState.progress = 0;
            })

            // Delete Logo
            .addCase(deleteLogo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
                state.isSuccess = false;
            })
            .addCase(deleteLogo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLogo = undefined;
                state.message = action.payload.message;
                state.error = null;
                state.isSuccess = true;
            })
            .addCase(deleteLogo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
                state.isSuccess = false;
            });
    }
});

export const {
    clearError,
    clearCurrentLogo,
    clearMessage,
    setUploadProgress
} = brandLogoSlice.actions;

export default brandLogoSlice.reducer;