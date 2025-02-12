import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AvatarService from '../../../services/avatarService';
import type { ErrorResponse } from '../../../types';

interface AvatarState {
    isLoading: boolean;
    error: string | null;
    currentUserAvatar: string | undefined;
    message: string | undefined;
}

const initialState: AvatarState = {
    isLoading: false,
    error: null,
    currentUserAvatar: undefined,
    message: undefined
};

// Error handler
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as ErrorResponse).message);
    }
    return 'An unexpected error occurred';
};

// Async thunk actions
export const uploadAvatar = createAsyncThunk(
    'avatar/upload',
    async ({ userId, file }: { userId: number; file: File }, { rejectWithValue }) => {
        try {
            const response = await AvatarService.uploadAvatar(userId, file);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to upload avatar');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateAvatar = createAsyncThunk(
    'avatar/update',
    async ({ userId, file }: { userId: number; file: File }, { rejectWithValue }) => {
        try {
            const response = await AvatarService.updateAvatar(userId, file);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update avatar');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteAvatar = createAsyncThunk(
    'avatar/delete',
    async (userId: number, { rejectWithValue }) => {
        try {
            const response = await AvatarService.deleteAvatar(userId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to delete avatar');
            }
            return response;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const avatarSlice = createSlice({
    name: 'avatar',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentUserAvatar: (state) => {
            state.currentUserAvatar = undefined;
        },
        clearMessage: (state) => {
            state.message = undefined;
        }
    },
    extraReducers: (builder) => {
        builder
            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUserAvatar = action.payload.data.avatar;
                state.message = action.payload.message;
                state.error = null;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
            })

            // Update Avatar
            .addCase(updateAvatar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
            })
            .addCase(updateAvatar.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUserAvatar = action.payload.data.avatar;
                state.message = action.payload.message;
                state.error = null;
            })
            .addCase(updateAvatar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
            })

            // Delete Avatar
            .addCase(deleteAvatar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = undefined;
            })
            .addCase(deleteAvatar.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUserAvatar = undefined;
                state.message = action.payload.message;
                state.error = null;
            })
            .addCase(deleteAvatar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.message = undefined;
            });
    }
});

export const {
    clearError,
    clearCurrentUserAvatar,
    clearMessage
} = avatarSlice.actions;

export default avatarSlice.reducer;