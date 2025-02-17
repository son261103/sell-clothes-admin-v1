import apiConfig from '../config/apiConfig';
import { ROLE_ENDPOINTS } from '../constants/roleConstant';
import type {
    RoleResponse,
    RoleCreateRequest,
    RoleUpdateRequest,
    PageRequest,
    RoleFilters,
    PageResponse,
    PermissionResponse
} from '../types';
import { AxiosError } from 'axios';
import { ApiResponse, ErrorResponse } from '../types';

class RoleService {
    private static createErrorResponse(err: unknown): ErrorResponse {
        if (err instanceof AxiosError && err.response?.data) {
            return {
                success: false,
                message: err.response.data.message || err.message,
                errorCode: err.response.data.errorCode
            };
        }
        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
            errorCode: 'UNKNOWN_ERROR'
        };
    }

    private static wrapResponse<T>(data: T): ApiResponse<T> {
        return {
            success: true,
            data,
            message: 'Operation successful'
        };
    }

    async getAllRoles(
        pageRequest: PageRequest = { page: 0, size: 10, sort: 'roleId,desc' },
        filters: RoleFilters = {}
    ): Promise<ApiResponse<PageResponse<RoleResponse>>> {
        try {
            const params = new URLSearchParams();

            // Handle pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'roleId,desc');

            // Handle filters
            if (filters.search?.trim()) {
                params.append('search', filters.search.trim());
            }
            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy);
            }
            if (filters.sortDirection) {
                params.append('sortDirection', filters.sortDirection);
            }

            const response = await apiConfig.get<PageResponse<RoleResponse>>(
                `${ROLE_ENDPOINTS.LIST}?${params.toString()}`
            );

            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async getRoleById(id: number): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.get<RoleResponse>(
                ROLE_ENDPOINTS.VIEW(id)
            );
            if (!response.data) {
                throw new Error('Role not found');
            }
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async createRole(
        roleData: RoleCreateRequest
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.post<RoleResponse>(
                ROLE_ENDPOINTS.CREATE,
                roleData
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async updateRole(
        id: number,
        roleData: RoleUpdateRequest
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.put<RoleResponse>(
                ROLE_ENDPOINTS.EDIT(id),
                roleData
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async deleteRole(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(ROLE_ENDPOINTS.DELETE(id));
            return RoleService.wrapResponse(undefined);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async checkRoleExists(name: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<boolean>(
                ROLE_ENDPOINTS.CHECK_EXISTS,
                {
                    params: { name }
                }
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async getRoleByName(name: string): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.get<RoleResponse>(
                ROLE_ENDPOINTS.GET_BY_NAME(name)
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    // Role-Permission relationship methods
    async addPermissionToRole(
        roleId: number,
        permissionId: number
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.post<RoleResponse>(
                ROLE_ENDPOINTS.ADD_PERMISSION_TO_ROLE(roleId, permissionId)
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async removePermissionFromRole(
        roleId: number,
        permissionId: number
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.delete<RoleResponse>(
                ROLE_ENDPOINTS.REMOVE_PERMISSION_FROM_ROLE(roleId, permissionId)
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async updateRolePermissions(
        roleId: number,
        permissionIds: Set<number>
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.put<RoleResponse>(
                ROLE_ENDPOINTS.UPDATE_ROLE_PERMISSIONS(roleId),
                Array.from(permissionIds)
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async removeMultiplePermissions(
        roleId: number,
        permissionIds: Set<number>
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.delete<RoleResponse>(
                ROLE_ENDPOINTS.REMOVE_MULTIPLE_PERMISSIONS(roleId),
                {
                    data: Array.from(permissionIds)
                }
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }

    async getRolePermissions(roleId: number): Promise<ApiResponse<PermissionResponse[]>> {
        try {
            const response = await apiConfig.get<PermissionResponse[]>(
                ROLE_ENDPOINTS.GET_ROLE_PERMISSIONS(roleId)
            );
            return RoleService.wrapResponse(response.data);
        } catch (err) {
            throw RoleService.createErrorResponse(err);
        }
    }
}

export default new RoleService();