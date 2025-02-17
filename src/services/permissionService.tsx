import apiConfig from '../config/apiConfig';
import {PERMISSION_ENDPOINTS} from '../constants/permissionConstant';
import type {
    PermissionResponse,
    PermissionCreateRequest,
    PermissionUpdateRequest,
    PageRequest,
    PermissionFilters,
    PageResponse,
} from '../types';
import {AxiosError} from 'axios';
import {ApiResponse, ErrorResponse} from '../types';
import {RoleResponse} from '../types';

class PermissionService {
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

// permissionService.ts
    async getAllPermissions(
        pageRequest: PageRequest = { page: 0, size: 10, sort: 'permissionId,desc' },
        filters: PermissionFilters = {}
    ): Promise<ApiResponse<PageResponse<PermissionResponse>>> {
        try {
            const params = new URLSearchParams();

            // Handle pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'permissionId,desc');

            // Handle filters
            if (filters.search?.trim()) {
                params.append('search', filters.search.trim());
            }
            if (filters.groupName) {
                params.append('groupName', filters.groupName);
            }
            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy);
            }
            if (filters.sortDirection) {
                params.append('sortDirection', filters.sortDirection);
            }

            const response = await apiConfig.get<PageResponse<PermissionResponse>>(
                `${PERMISSION_ENDPOINTS.LIST}?${params.toString()}`
            );

            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async getPermissionById(id: number): Promise<ApiResponse<PermissionResponse>> {
        try {
            const response = await apiConfig.get<PermissionResponse>(
                PERMISSION_ENDPOINTS.VIEW(id)
            );
            if (!response.data) {
                throw new Error('Permission not found');
            }
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async createPermission(
        permissionData: PermissionCreateRequest
    ): Promise<ApiResponse<PermissionResponse>> {
        try {
            const response = await apiConfig.post<PermissionResponse>(
                PERMISSION_ENDPOINTS.CREATE,
                permissionData
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async updatePermission(
        id: number,
        permissionData: PermissionUpdateRequest
    ): Promise<ApiResponse<PermissionResponse>> {
        try {
            const response = await apiConfig.put<PermissionResponse>(
                PERMISSION_ENDPOINTS.EDIT(id),
                permissionData
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async deletePermission(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(PERMISSION_ENDPOINTS.DELETE(id));
            return PermissionService.wrapResponse(undefined);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async checkPermissionExists(name: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<boolean>(
                PERMISSION_ENDPOINTS.CHECK_EXISTS,
                {
                    params: { name }
                }
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async getPermissionsByGroup(groupName: string): Promise<ApiResponse<PermissionResponse[]>> {
        try {
            const response = await apiConfig.get<PermissionResponse[]>(
                PERMISSION_ENDPOINTS.GET_BY_GROUP(groupName)
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    // Role-Permission relationship methods
    async addPermissionToRole(
        roleId: number,
        permissionId: number
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.post<RoleResponse>(
                PERMISSION_ENDPOINTS.ADD_PERMISSION_TO_ROLE(roleId, permissionId)
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async removePermissionFromRole(
        roleId: number,
        permissionId: number
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.delete<RoleResponse>(
                PERMISSION_ENDPOINTS.REMOVE_PERMISSION_FROM_ROLE(roleId, permissionId)
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }

    async updateRolePermissions(
        roleId: number,
        permissionIds: Set<number>
    ): Promise<ApiResponse<RoleResponse>> {
        try {
            const response = await apiConfig.put<RoleResponse>(
                PERMISSION_ENDPOINTS.UPDATE_ROLE_PERMISSIONS(roleId),
                Array.from(permissionIds)
            );
            return PermissionService.wrapResponse(response.data);
        } catch (err) {
            throw PermissionService.createErrorResponse(err);
        }
    }
}

export default new PermissionService();