import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    uploadLogo,
    updateLogo,
    deleteLogo,
    clearError,
    clearCurrentLogo,
    clearMessage,
    setUploadProgress
} from '../store/features/brand/brandLogoSlice';
import {
    selectCurrentLogo,
    selectLogoOperationStatus,
    selectHasLogo,
    selectLogoUploadState,
    selectIsValidLogoUrl,
    selectUploadProgress
} from '../store/features/brand/brandLogoSelectors';

export const useBrandLogo = () => {
    const dispatch = useAppDispatch();
    const currentLogo = useAppSelector(selectCurrentLogo);
    const operationStatus = useAppSelector(selectLogoOperationStatus);
    const hasLogo = useAppSelector(selectHasLogo);
    const uploadState = useAppSelector(selectLogoUploadState);
    const isValidLogoUrl = useAppSelector(selectIsValidLogoUrl);
    const uploadProgress = useAppSelector(selectUploadProgress);

    /**
     * Upload a new logo
     * @param file The logo file to upload
     * @param brandId Optional brand ID to associate the logo with
     * @returns True if the upload was successful, false otherwise
     */
    const handleUploadLogo = useCallback(async (file: File, brandId?: number) => {
        if (!file || file.size === 0) {
            return false;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            return false;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return false;
        }

        try {
            const result = await dispatch(uploadLogo({ file, brandId })).unwrap();
            return result?.success && !!result?.data;
        } catch (error) {
            console.error('Error uploading logo:', error);
            return false;
        }
    }, [dispatch]);

    /**
     * Update an existing logo
     * @param file The new logo file
     * @param oldUrl The URL of the existing logo
     * @param brandId Brand ID to associate the logo with
     * @returns True if the update was successful, false otherwise
     */
    const handleUpdateLogo = useCallback(async (file: File, oldUrl: string, brandId: number) => {
        if (!file || file.size === 0 || !oldUrl || !brandId) {
            return false;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            return false;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return false;
        }

        try {
            // Clean up the old URL to ensure it's passed correctly
            const trimmedOldUrl = oldUrl.trim();

            const payload = {
                file,
                oldUrl: trimmedOldUrl,
                brandId
            };

            const result = await dispatch(updateLogo(payload)).unwrap();
            return result?.success && !!result?.data;
        } catch (error) {
            console.error('Error updating logo:', error);
            return false;
        }
    }, [dispatch]);

    /**
     * Delete a logo
     * @param logoUrl The URL of the logo to delete
     * @param brandId Optional brand ID to update after deletion
     * @returns True if the deletion was successful, false otherwise
     */
    const handleDeleteLogo = useCallback(async (logoUrl: string, brandId?: number) => {
        if (!logoUrl) {
            return false;
        }

        try {
            // Clean up the logo URL
            const trimmedLogoUrl = logoUrl.trim();

            const payload = {
                logoUrl: trimmedLogoUrl,
                brandId
            };

            const result = await dispatch(deleteLogo(payload)).unwrap();
            return result?.success;
        } catch (error) {
            console.error('Error deleting logo:', error);
            return false;
        }
    }, [dispatch]);

    /**
     * Manually set upload progress
     * Useful for simulating progress in testing environments
     */
    const handleSetUploadProgress = useCallback((progress: number) => {
        dispatch(setUploadProgress(Math.min(Math.max(0, progress), 100)));
    }, [dispatch]);

    /**
     * Clear any error state
     */
    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    /**
     * Clear the current logo
     */
    const handleClearLogo = useCallback(() => {
        dispatch(clearCurrentLogo());
    }, [dispatch]);

    /**
     * Clear any message state
     */
    const handleClearMessage = useCallback(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    return {
        // State
        currentLogo,
        hasLogo,
        isValidLogoUrl,
        isLoading: operationStatus.isLoading,
        error: operationStatus.error,
        message: operationStatus.message,
        isSuccess: operationStatus.isSuccess,
        uploadState,
        uploadProgress,

        // Actions
        uploadLogo: handleUploadLogo,
        updateLogo: handleUpdateLogo,
        deleteLogo: handleDeleteLogo,
        setUploadProgress: handleSetUploadProgress,
        clearError: handleClearError,
        clearLogo: handleClearLogo,
        clearMessage: handleClearMessage
    };
};