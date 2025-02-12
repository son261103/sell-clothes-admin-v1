import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic selectors
export const selectAvatarState = (state: RootState) => state.avatar;

export const selectCurrentUserAvatar = createSelector(
    selectAvatarState,
    (state) => state.currentUserAvatar
);

export const selectIsLoading = createSelector(
    selectAvatarState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectAvatarState,
    (state) => state.error
);

export const selectMessage = createSelector(
    selectAvatarState,
    (state) => state.message
);

// Operation status selector
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    message?: string;
    isSuccess: boolean;
}

export const selectAvatarOperationStatus = createSelector(
    [selectIsLoading, selectError, selectMessage],
    (isLoading, error, message): OperationStatus => ({
        isLoading,
        error,
        message,
        isSuccess: !isLoading && !error
    })
);

// Avatar availability selector
export const selectHasAvatar = createSelector(
    selectCurrentUserAvatar,
    (avatar): boolean => avatar !== undefined && avatar !== null && avatar !== ''
);