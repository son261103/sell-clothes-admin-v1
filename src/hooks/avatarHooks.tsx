import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    uploadAvatar,
    updateAvatar,
    deleteAvatar,
    clearError,
    clearCurrentUserAvatar,
    clearMessage
} from '../store/features/user/avatarSlice';
import {
    selectCurrentUserAvatar,
    selectAvatarOperationStatus,
    selectHasAvatar
} from '../store/features/user/avatarSelectors';

export const useAvatar = () => {
    const dispatch = useAppDispatch();
    const currentUserAvatar = useAppSelector(selectCurrentUserAvatar);
    const operationStatus = useAppSelector(selectAvatarOperationStatus);
    const hasAvatar = useAppSelector(selectHasAvatar);

    const handleUploadAvatar = useCallback(
        async (userId: number, file: File): Promise<boolean> => {
            try {
                await dispatch(uploadAvatar({ userId, file })).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleUpdateAvatar = useCallback(
        async (userId: number, file: File): Promise<boolean> => {
            try {
                await dispatch(updateAvatar({ userId, file })).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleDeleteAvatar = useCallback(
        async (userId: number): Promise<boolean> => {
            try {
                await dispatch(deleteAvatar(userId)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleClearError = useCallback(
        () => {
            dispatch(clearError());
        },
        [dispatch]
    );

    const handleClearAvatar = useCallback(
        () => {
            dispatch(clearCurrentUserAvatar());
        },
        [dispatch]
    );

    const handleClearMessage = useCallback(
        () => {
            dispatch(clearMessage());
        },
        [dispatch]
    );

    return {
        // State
        currentUserAvatar,
        hasAvatar,
        isLoading: operationStatus.isLoading,
        error: operationStatus.error,
        message: operationStatus.message,
        isSuccess: operationStatus.isSuccess,

        // Actions
        uploadAvatar: handleUploadAvatar,
        updateAvatar: handleUpdateAvatar,
        deleteAvatar: handleDeleteAvatar,
        clearError: handleClearError,
        clearAvatar: handleClearAvatar,
        clearMessage: handleClearMessage
    };
};