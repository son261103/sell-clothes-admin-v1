import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import UserService from '../../../services/userService';
import type {
    UserResponse,
    UserCreateRequest,
    UserUpdateRequest,
    UserStatus, ErrorResponse, PageResponse, PageRequest, UserFilters
} from '../../../types';

interface UserState {
    users: PageResponse<UserResponse>;
    currentUser: UserResponse | null;
    searchedUser: UserResponse | null;
    isLoading: boolean;
    error: string | null;
    userCheckStatus: {
        usernameAvailable: boolean;
        emailAvailable: boolean;
        message: string | null;
    };
}

const initialState: UserState = {
    users: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentUser: null,
    searchedUser: null,
    isLoading: false,
    error: null,
    userCheckStatus: {
        usernameAvailable: false,
        emailAvailable: false,
        message: null
    }
};

// Async thunk actions
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as ErrorResponse).message);
    }
    return 'An unexpected error occurred';
};

export const fetchAllUsers = createAsyncThunk(
    'user/fetchAll',
    async ({
               pageRequest,
               filters
           }: {
        pageRequest: PageRequest;
        filters?: UserFilters;
    }, { rejectWithValue }) => {
        try {
            const response = await UserService.getAllUsers(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch users');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'user/fetchById',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await UserService.getUserById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch user');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getUserByUsername = createAsyncThunk(
    'user/getByUsername',
    async (username: string, {rejectWithValue}) => {
        try {
            const response = await UserService.getUserByUsername(username);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch user by username');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getUserByEmail = createAsyncThunk(
    'user/getByEmail',
    async (email: string, {rejectWithValue}) => {
        try {
            const response = await UserService.getUserByEmail(email);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch user by email');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createUser = createAsyncThunk(
    'user/create',
    async ({
               userData,
               avatarFile,
               onProgress
           }: {
        userData: UserCreateRequest;
        avatarFile?: File;
        onProgress?: (progress: number) => void;
    }, {rejectWithValue}) => {
        try {
            const response = await UserService.createUser(userData, avatarFile, onProgress);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create user');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/update',
    async ({
               id,
               userData,
               avatarFile,
               onProgress
           }: {
        id: number;
        userData: UserUpdateRequest;
        avatarFile?: File;
        onProgress?: (progress: number) => void;
    }, {rejectWithValue}) => {
        try {
            const response = await UserService.updateUser(id, userData, avatarFile, onProgress);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update user');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteUser = createAsyncThunk(
    'user/delete',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await UserService.deleteUser(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete user');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    'user/updateStatus',
    async ({id, status}: { id: number; status: UserStatus }, {rejectWithValue}) => {
        try {
            const response = await UserService.updateUserStatus(id, {status: status.toString()});
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to update user status');
            }
            return {id, status};
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const checkUsername = createAsyncThunk(
    'user/checkUsername',
    async (username: string, {rejectWithValue}) => {
        try {
            const response = await UserService.checkUsername(username);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to check username');
            }
            return {
                success: response.success,
                message: response.message
            };
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const checkEmail = createAsyncThunk(
    'user/checkEmail',
    async (email: string, {rejectWithValue}) => {
        try {
            const response = await UserService.checkEmail(email);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to check email');
            }
            return {
                success: response.success,
                message: response.message
            };
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateLastLogin = createAsyncThunk(
    'user/updateLastLogin',
    async (userId: number, {rejectWithValue}) => {
        try {
            const response = await UserService.updateLastLogin(userId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update last login');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        clearSearchedUser: (state) => {
            state.searchedUser = null;
        },
        resetUserCheckStatus: (state) => {
            state.userCheckStatus = {
                usernameAvailable: false,
                emailAvailable: false,
                message: null
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Users with pagination
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
                state.error = null;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Get User By Username
            .addCase(getUserByUsername.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserByUsername.fulfilled, (state, action) => {
                state.isLoading = false;
                state.searchedUser = action.payload;
                state.error = null;
            })
            .addCase(getUserByUsername.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Get User By Email
            .addCase(getUserByEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserByEmail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.searchedUser = action.payload;
                state.error = null;
            })
            .addCase(getUserByEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create User
            .addCase(createUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // Create User - update with pagination
            .addCase(createUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update content array if we're on the first page
                if (state.users.number === 0) {
                    state.users.content = [action.payload, ...state.users.content];
                    if (state.users.content.length > state.users.size) {
                        state.users.content.pop();
                    }
                }
                state.users.totalElements += 1;
                state.users.totalPages = Math.ceil(state.users.totalElements / state.users.size);
                state.users.empty = state.users.content.length === 0;
                state.error = null;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update User
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.content = state.users.content.map(user =>
                    user.userId === action.payload.userId ? action.payload : user
                );
                if (state.currentUser?.userId === action.payload.userId) {
                    state.currentUser = action.payload;
                }
                if (state.searchedUser?.userId === action.payload.userId) {
                    state.searchedUser = action.payload;
                }
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.content = state.users.content.filter(
                    user => user.userId !== action.payload
                );
                state.users.totalElements -= 1;
                state.users.totalPages = Math.ceil(state.users.totalElements / state.users.size);
                state.users.empty = state.users.content.length === 0;
                if (state.currentUser?.userId === action.payload) {
                    state.currentUser = null;
                }
                if (state.searchedUser?.userId === action.payload) {
                    state.searchedUser = null;
                }
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update User Status
            .addCase(updateUserStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.content = state.users.content.map(user =>
                    user.userId === action.payload.id
                        ? { ...user, status: action.payload.status }
                        : user
                );
                if (state.currentUser?.userId === action.payload.id) {
                    state.currentUser = {
                        ...state.currentUser,
                        status: action.payload.status
                    };
                }
                if (state.searchedUser?.userId === action.payload.id) {
                    state.searchedUser = {
                        ...state.searchedUser,
                        status: action.payload.status
                    };
                }
                state.error = null;
            })
            .addCase(updateUserStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Check Username
            .addCase(checkUsername.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkUsername.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userCheckStatus.usernameAvailable = action.payload.success;
                state.userCheckStatus.message = action.payload.message;
                state.error = null;
            })
            .addCase(checkUsername.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Check Email
            .addCase(checkEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkEmail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userCheckStatus.emailAvailable = action.payload.success;
                state.userCheckStatus.message = action.payload.message;
                state.error = null;
            })
            .addCase(checkEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentUser,
    clearSearchedUser,
    resetUserCheckStatus
} = userSlice.actions;

export default userSlice.reducer;