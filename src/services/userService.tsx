import apiConfig from '../config/apiConfig';
import {USER_ENDPOINTS} from '../constants/userConstant';
import type {
    UserResponse,
    UserCreateRequest,
    UserUpdateRequest,
    UserStatusUpdateRequest,
    UserCheckResponse,
    UserLoginUpdateResponse, PageRequest, UserFilters, PageResponse,
} from '../types';
import {AxiosError} from 'axios';
import {ApiResponse, ErrorResponse} from '../types';

class UserService {
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

    // async getAllUsers(
    //     pageRequest: PageRequest = {page: 0, size: 10, sort: 'userId'},
    //     filters: UserFilters = {}
    // ): Promise<ApiResponse<PageResponse<UserResponse>>> {
    //     try {
    //         const params = new URLSearchParams({
    //             page: pageRequest.page?.toString() || '0',
    //             size: pageRequest.size?.toString() || '10',
    //             sort: pageRequest.sort || 'userId'
    //         });
    //
    //         if (filters.search) {
    //             params.append('search', filters.search);
    //         }
    //         if (filters.status) {
    //             params.append('status', filters.status);
    //         }
    //
    //         const response = await apiConfig.get<PageResponse<UserResponse>>(
    //             `${USER_ENDPOINTS.LIST}?${params.toString()}`
    //         );
    //
    //         return UserService.wrapResponse(response.data);
    //     } catch (err) {
    //         throw UserService.createErrorResponse(err);
    //     }
    // }


    async getAllUsers(
        pageRequest: PageRequest = { page: 0, size: 10, sort: 'userId,desc' },
        filters: UserFilters = {}
    ): Promise<ApiResponse<PageResponse<UserResponse>>> {
        try {
            const params = new URLSearchParams();

            // Xử lý pagination params
            params.append('page', String(pageRequest.page ?? 0));
            params.append('size', String(pageRequest.size ?? 10));
            params.append('sort', pageRequest.sort || 'userId,desc');

            // Xử lý các filter params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    switch (key) {
                        case 'search':
                            if (value.trim()) {
                                params.append('search', value.trim());
                            }
                            break;
                        case 'status':
                            params.append('status', value);
                            break;
                        case 'role':
                            params.append('role', value);
                            break;
                        case 'startDate':
                            params.append('startDate', value);
                            break;
                        case 'endDate':
                            params.append('endDate', value);
                            break;
                        case 'sortBy':
                            params.append('sortBy', value);
                            break;
                        case 'sortDirection':
                            params.append('sortDirection', value);
                            break;
                    }
                }
            });

            // Log để debug
            console.debug('[UserService] Request URL:', `${USER_ENDPOINTS.LIST}?${params.toString()}`);
            console.debug('[UserService] Applied filters:', filters);

            const response = await apiConfig.get<PageResponse<UserResponse>>(
                `${USER_ENDPOINTS.LIST}?${params.toString()}`
            );

            return UserService.wrapResponse(response.data);
        } catch (err) {
            console.error('[UserService] Error in getAllUsers:', err);
            throw UserService.createErrorResponse(err);
        }
    }


    async getUserById(id: number): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.get<UserResponse>(USER_ENDPOINTS.VIEW(id));
            if (!response.data) {
                throw new Error('User not found');
            }
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async getUserByUsername(username: string): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.get<UserResponse>(
                USER_ENDPOINTS.GET_BY_USERNAME(username)
            );
            if (!response.data) {
                throw new Error('User not found');
            }
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async getUserByEmail(email: string): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.get<UserResponse>(
                USER_ENDPOINTS.GET_BY_EMAIL(email)
            );
            if (!response.data) {
                throw new Error('User not found');
            }
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async createUser(userData: UserCreateRequest): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.post<UserResponse>(
                USER_ENDPOINTS.CREATE,
                userData
            );
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async updateUser(
        id: number,
        userData: UserUpdateRequest
    ): Promise<ApiResponse<UserResponse>> {
        try {
            const response = await apiConfig.put<UserResponse>(
                USER_ENDPOINTS.EDIT(id),
                userData
            );
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async deleteUser(id: number): Promise<ApiResponse<void>> {
        try {
            await apiConfig.delete(USER_ENDPOINTS.DELETE(id));
            return UserService.wrapResponse(undefined);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async updateUserStatus(
        id: number,
        status: UserStatusUpdateRequest
    ): Promise<ApiResponse<void>> {
        try {
            await apiConfig.put(
                USER_ENDPOINTS.UPDATE_STATUS(id),
                status
            );
            return UserService.wrapResponse(undefined);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async checkUsername(username: string): Promise<ApiResponse<UserCheckResponse>> {
        try {
            const response = await apiConfig.get<UserCheckResponse>(
                USER_ENDPOINTS.CHECK_USERNAME,
                {
                    params: {username}
                }
            );
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async checkEmail(email: string): Promise<ApiResponse<UserCheckResponse>> {
        try {
            const response = await apiConfig.get<UserCheckResponse>(
                USER_ENDPOINTS.CHECK_EMAIL,
                {
                    params: {email}
                }
            );
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }

    async updateLastLogin(userId: number): Promise<ApiResponse<UserLoginUpdateResponse>> {
        try {
            const response = await apiConfig.put<UserLoginUpdateResponse>(
                USER_ENDPOINTS.UPDATE_LAST_LOGIN(userId)
            );
            return UserService.wrapResponse(response.data);
        } catch (err) {
            throw UserService.createErrorResponse(err);
        }
    }
}

export default new UserService();