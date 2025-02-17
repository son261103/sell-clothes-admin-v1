import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import RoleService from '../../../services/roleService';
import type {
    RoleResponse,
    RoleCreateRequest,
    RoleUpdateRequest,
    ErrorResponse,
    PageResponse,
    PageRequest,
    RoleFilters,
    PermissionResponse
} from '../../../types';

interface RoleState {
    roles: PageResponse<RoleResponse>;
    currentRole: RoleResponse | null;
    rolePermissions: PermissionResponse[];
    isLoading: boolean;
    error: string | null;
}

const initialState: RoleState = {
    roles: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentRole: null,
    rolePermissions: [],
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
export const fetchAllRoles = createAsyncThunk(
    'role/fetchAll',
    async ({
               pageRequest,
               filters
           }: {
        pageRequest: PageRequest;
        filters?: RoleFilters;
    }, { rejectWithValue }) => {
        try {
            const response = await RoleService.getAllRoles(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch roles');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchRoleById = createAsyncThunk(
    'role/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await RoleService.getRoleById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch role');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createRole = createAsyncThunk(
    'role/create',
    async (roleData: RoleCreateRequest, { rejectWithValue }) => {
        try {
            const response = await RoleService.createRole(roleData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create role');
            }

            // Thêm permissions ngay sau khi tạo role
            if (roleData.permissions && roleData.permissions.length > 0) {
                try {
                    await RoleService.updateRolePermissions(
                        response.data.roleId,
                        new Set(roleData.permissions)
                    );
                } catch (error) {
                    console.error('Error adding permissions to new role:', error);
                    return rejectWithValue('Role created but failed to add permissions');
                }
            }

            // Fetch lại role để có data mới nhất với permissions
            const updatedRole = await RoleService.getRoleById(response.data.roleId);
            if (!updatedRole.success || !updatedRole.data) {
                return rejectWithValue('Role created but failed to fetch updated data');
            }

            return updatedRole.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateRole = createAsyncThunk(
    'role/update',
    async ({ id, roleData }: { id: number; roleData: RoleUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await RoleService.updateRole(id, roleData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update role');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteRole = createAsyncThunk(
    'role/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await RoleService.deleteRole(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete role');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getRolePermissions = createAsyncThunk(
    'role/getPermissions',
    async (roleId: number, { rejectWithValue }) => {
        try {
            const response = await RoleService.getRolePermissions(roleId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch role permissions');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const addPermissionToRole = createAsyncThunk(
    'role/addPermission',
    async ({ roleId, permissionId }: { roleId: number; permissionId: number }, { rejectWithValue }) => {
        try {
            const response = await RoleService.addPermissionToRole(roleId, permissionId);
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
    'role/updatePermissions',
    async ({ roleId, permissionIds }: { roleId: number; permissionIds: Set<number> }, { rejectWithValue }) => {
        try {
            const response = await RoleService.updateRolePermissions(roleId, permissionIds);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update role permissions');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentRole: (state) => {
            state.currentRole = null;
        },
        clearRolePermissions: (state) => {
            state.rolePermissions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Roles
            .addCase(fetchAllRoles.pending, (state) => {
                console.log('🔄 Redux: Fetching roles...');
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                console.log('✅ Redux: Roles fetched successfully', {
                    total: action.payload.totalElements,
                    currentPage: action.payload.number,
                    content: action.payload.content
                });
                state.isLoading = false;
                state.roles = action.payload;
                state.error = null;
            })
            .addCase(fetchAllRoles.rejected, (state, action) => {
                console.error('❌ Redux: Error fetching roles', action.payload);
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Role By ID
            .addCase(fetchRoleById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoleById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRole = action.payload;
                state.error = null;
            })
            .addCase(fetchRoleById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Role
            .addCase(createRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.roles.number === 0) {
                    // Ensure we're adding the complete role with permissions
                    state.roles.content = [action.payload, ...state.roles.content];
                    if (state.roles.content.length > state.roles.size) {
                        state.roles.content.pop();
                    }
                }
                state.roles.totalElements += 1;
                state.roles.totalPages = Math.ceil(state.roles.totalElements / state.roles.size);
                state.roles.empty = state.roles.content.length === 0;
                state.currentRole = action.payload; // Store the newly created role
                state.error = null;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Role
            .addCase(updateRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles.content = state.roles.content.map(role =>
                    role.roleId === action.payload.roleId ? action.payload : role
                );
                if (state.currentRole?.roleId === action.payload.roleId) {
                    state.currentRole = action.payload;
                }
                state.error = null;
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Role
            .addCase(deleteRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles.content = state.roles.content.filter(
                    role => role.roleId !== action.payload
                );
                state.roles.totalElements -= 1;
                state.roles.totalPages = Math.ceil(state.roles.totalElements / state.roles.size);
                state.roles.empty = state.roles.content.length === 0;
                if (state.currentRole?.roleId === action.payload) {
                    state.currentRole = null;
                }
                state.error = null;
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Get Role Permissions
            .addCase(getRolePermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRolePermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rolePermissions = action.payload;
                state.error = null;
            })
            .addCase(getRolePermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Add Permission to Role
            .addCase(addPermissionToRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addPermissionToRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRole = action.payload;
                state.error = null;
            })
            .addCase(addPermissionToRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Role Permissions
            .addCase(updateRolePermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRolePermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRole = action.payload;
                state.error = null;
            })
            .addCase(updateRolePermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentRole,
    clearRolePermissions
} = roleSlice.actions;

export default roleSlice.reducer;