import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PermissionService from '../../../services/permissionService';
import type {
    PermissionResponse,
    PermissionCreateRequest,
    PermissionUpdateRequest,
    ErrorResponse,
    PageResponse,
    PageRequest,
    PermissionFilters,
} from '../../../types';

interface PermissionState {
    permissions: PageResponse<PermissionResponse>;
    currentPermission: PermissionResponse | null;
    groupPermissions: PermissionResponse[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PermissionState = {
    permissions: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentPermission: null,
    groupPermissions: [],
    isLoading: false,
    error: null
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
export const fetchAllPermissions = createAsyncThunk(
    'permission/fetchAll',
    async ({
               pageRequest,
               filters
           }: {
        pageRequest: PageRequest;
        filters?: PermissionFilters;
    }, { rejectWithValue }) => {
        try {
            const response = await PermissionService.getAllPermissions(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch permissions');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchPermissionById = createAsyncThunk(
    'permission/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PermissionService.getPermissionById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch permission');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createPermission = createAsyncThunk(
    'permission/create',
    async (permissionData: PermissionCreateRequest, { rejectWithValue }) => {
        try {
            const response = await PermissionService.createPermission(permissionData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create permission');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updatePermission = createAsyncThunk(
    'permission/update',
    async ({ id, permissionData }: { id: number; permissionData: PermissionUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await PermissionService.updatePermission(id, permissionData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update permission');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deletePermission = createAsyncThunk(
    'permission/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PermissionService.deletePermission(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete permission');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getPermissionsByGroup = createAsyncThunk(
    'permission/getByGroup',
    async (groupName: string, { rejectWithValue }) => {
        try {
            const response = await PermissionService.getPermissionsByGroup(groupName);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch permissions by group');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Role-Permission relationship thunks
export const addPermissionToRole = createAsyncThunk(
    'permission/addToRole',
    async ({ roleId, permissionId }: { roleId: number; permissionId: number }, { rejectWithValue }) => {
        try {
            const response = await PermissionService.addPermissionToRole(roleId, permissionId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to add permission to role');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateRolePermissions = createAsyncThunk(
    'permission/updateRolePermissions',
    async ({ roleId, permissionIds }: { roleId: number; permissionIds: Set<number> }, { rejectWithValue }) => {
        try {
            const response = await PermissionService.updateRolePermissions(roleId, permissionIds);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update role permissions');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPermission: (state) => {
            state.currentPermission = null;
        },
        clearGroupPermissions: (state) => {
            state.groupPermissions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Permissions
            .addCase(fetchAllPermissions.pending, (state) => {
                console.log('🔄 Redux: Fetching permissions...');
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllPermissions.fulfilled, (state, action) => {
                console.log('✅ Redux: Permissions fetched successfully', {
                    total: action.payload.totalElements,
                    currentPage: action.payload.number,
                    content: action.payload.content
                });
                state.isLoading = false;
                state.permissions = action.payload;
                state.error = null;
            })
            .addCase(fetchAllPermissions.rejected, (state, action) => {
                console.error('❌ Redux: Error fetching permissions', action.payload);
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Permission By ID
            .addCase(fetchPermissionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPermissionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPermission = action.payload;
                state.error = null;
            })
            .addCase(fetchPermissionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Permission
            .addCase(createPermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPermission.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.permissions.number === 0) {
                    state.permissions.content = [action.payload, ...state.permissions.content];
                    if (state.permissions.content.length > state.permissions.size) {
                        state.permissions.content.pop();
                    }
                }
                state.permissions.totalElements += 1;
                state.permissions.totalPages = Math.ceil(state.permissions.totalElements / state.permissions.size);
                state.permissions.empty = state.permissions.content.length === 0;
                state.error = null;
            })
            .addCase(createPermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Permission
            .addCase(updatePermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePermission.fulfilled, (state, action) => {
                state.isLoading = false;
                state.permissions.content = state.permissions.content.map(permission =>
                    permission.permissionId === action.payload.permissionId ? action.payload : permission
                );
                if (state.currentPermission?.permissionId === action.payload.permissionId) {
                    state.currentPermission = action.payload;
                }
                state.error = null;
            })
            .addCase(updatePermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Permission
            .addCase(deletePermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePermission.fulfilled, (state, action) => {
                state.isLoading = false;
                state.permissions.content = state.permissions.content.filter(
                    permission => permission.permissionId !== action.payload
                );
                state.permissions.totalElements -= 1;
                state.permissions.totalPages = Math.ceil(state.permissions.totalElements / state.permissions.size);
                state.permissions.empty = state.permissions.content.length === 0;
                if (state.currentPermission?.permissionId === action.payload) {
                    state.currentPermission = null;
                }
                state.error = null;
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Get Permissions By Group
            .addCase(getPermissionsByGroup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPermissionsByGroup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groupPermissions = action.payload;
                state.error = null;
            })
            .addCase(getPermissionsByGroup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentPermission,
    clearGroupPermissions
} = permissionSlice.actions;

export default permissionSlice.reducer;