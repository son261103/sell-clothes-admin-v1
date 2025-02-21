import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic selectors
export const selectBrandLogoState = (state: RootState) => state.brandLogo;

export const selectCurrentLogo = createSelector(
    selectBrandLogoState,
    (state) => state.currentLogo
);

export const selectIsLoading = createSelector(
    selectBrandLogoState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectBrandLogoState,
    (state) => state.error
);

export const selectMessage = createSelector(
    selectBrandLogoState,
    (state) => state.message
);

export const selectIsSuccess = createSelector(
    selectBrandLogoState,
    (state) => state.isSuccess
);

export const selectUploadProgress = createSelector(
    selectBrandLogoState,
    (state) => state.uploadState?.progress || 0
);

export const selectIsUploading = createSelector(
    selectBrandLogoState,
    (state) => state.uploadState?.isUploading || false
);

// Operation status selector
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    message?: string;
    isSuccess: boolean;
}

export const selectLogoOperationStatus = createSelector(
    [selectIsLoading, selectError, selectMessage, selectIsSuccess],
    (isLoading, error, message, isSuccess): OperationStatus => ({
        isLoading,
        error,
        message,
        isSuccess
    })
);

// Logo availability selector
export const selectHasLogo = createSelector(
    selectCurrentLogo,
    (logo): boolean => logo !== undefined && logo !== null && logo !== ''
);

// Logo upload state selectors
export const selectLogoUploadState = createSelector(
    [selectIsUploading, selectUploadProgress, selectError, selectMessage],
    (isUploading, progress, error, message) => ({
        isUploading,
        progress,
        uploadError: error,
        uploadMessage: message,
        isUploadSuccess: !isUploading && !error && message !== undefined && progress === 100
    })
);

// Logo URL validation selector
export const selectIsValidLogoUrl = createSelector(
    selectCurrentLogo,
    (logo): boolean => {
        if (!logo) return false;
        try {
            new URL(logo);
            return true;
        } catch {
            return false;
        }
    }
);