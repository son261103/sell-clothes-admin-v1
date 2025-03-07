import apiConfig from '../config/apiConfig';
import { USER_ADDRESS_ENDPOINTS } from '../constants/userAddressConstant';
import type {
    AddressRequestDTO,
    UpdateAddressDTO,
    AddressResponseDTO,
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

class UserAddressService {
    private static createErrorResponse(err: unknown) {
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

    // User Methods

    /**
     * Get all addresses for the current user
     */
    async getUserAddresses(): Promise<ApiResponse<AddressResponseDTO[]>> {
        try {
            const response = await apiConfig.get<AddressResponseDTO[]>(USER_ADDRESS_ENDPOINTS.LIST);
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Get address by ID for the current user
     */
    async getUserAddressById(addressId: number): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.get<AddressResponseDTO>(USER_ADDRESS_ENDPOINTS.GET(addressId));
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Create a new address for the current user
     */
    async createAddress(addressData: AddressRequestDTO): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.post<AddressResponseDTO>(USER_ADDRESS_ENDPOINTS.CREATE, addressData);
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Update an existing address for the current user
     */
    async updateAddress(addressId: number, updateData: UpdateAddressDTO): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.put<AddressResponseDTO>(
                USER_ADDRESS_ENDPOINTS.UPDATE(addressId),
                updateData
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Delete an address for the current user
     */
    async deleteAddress(addressId: number): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.delete<ApiResponse<void>>(
                USER_ADDRESS_ENDPOINTS.DELETE(addressId)
            );
            return response.data;
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Set an address as default for the current user
     */
    async setDefaultAddress(addressId: number): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.put<AddressResponseDTO>(
                USER_ADDRESS_ENDPOINTS.SET_DEFAULT(addressId)
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Get the default address for the current user
     */
    async getDefaultAddress(): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.get<AddressResponseDTO>(USER_ADDRESS_ENDPOINTS.GET_DEFAULT);
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Validate an address for order placement
     */
    async validateAddressForOrder(addressId: number): Promise<ApiResponse<boolean>> {
        try {
            const params = new URLSearchParams();
            params.append('addressId', String(addressId));

            const response = await apiConfig.get<ApiResponse<boolean>>(
                `${USER_ADDRESS_ENDPOINTS.VALIDATE}?${params.toString()}`
            );
            return response.data;
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Check if address exists
     */
    async checkAddressExists(addressId: number): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<ApiResponse<boolean>>(
                USER_ADDRESS_ENDPOINTS.CHECK_EXISTS(addressId)
            );
            return response.data;
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Check if address belongs to the current user
     */
    async checkAddressBelongsToUser(addressId: number): Promise<ApiResponse<boolean>> {
        try {
            const response = await apiConfig.get<ApiResponse<boolean>>(
                USER_ADDRESS_ENDPOINTS.CHECK_OWNER(addressId)
            );
            return response.data;
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Get address count for the current user
     */
    async getAddressCount(): Promise<ApiResponse<number>> {
        try {
            const response = await apiConfig.get<number>(USER_ADDRESS_ENDPOINTS.COUNT);
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    // Admin Methods

    /**
     * Get address by ID (admin)
     */
    async getAddressById(addressId: number): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.get<AddressResponseDTO>(
                USER_ADDRESS_ENDPOINTS.ADMIN_GET(addressId)
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Get all addresses for a specific user (admin)
     */
    async getAddressesByUserId(userId: number): Promise<ApiResponse<AddressResponseDTO[]>> {
        try {
            const response = await apiConfig.get<AddressResponseDTO[]>(
                USER_ADDRESS_ENDPOINTS.ADMIN_USER_ADDRESSES(userId)
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Create address for a specific user (admin)
     */
    async createAddressForUser(
        userId: number,
        addressData: AddressRequestDTO
    ): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.post<AddressResponseDTO>(
                USER_ADDRESS_ENDPOINTS.ADMIN_CREATE(userId),
                addressData
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Update address (admin)
     */
    async updateAddressAdmin(
        addressId: number,
        updateData: UpdateAddressDTO
    ): Promise<ApiResponse<AddressResponseDTO>> {
        try {
            const response = await apiConfig.put<AddressResponseDTO>(
                USER_ADDRESS_ENDPOINTS.ADMIN_UPDATE(addressId),
                updateData
            );
            return UserAddressService.wrapResponse(response.data);
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }

    /**
     * Delete address (admin)
     */
    async deleteAddressAdmin(addressId: number): Promise<ApiResponse<void>> {
        try {
            const response = await apiConfig.delete<ApiResponse<void>>(
                USER_ADDRESS_ENDPOINTS.ADMIN_DELETE(addressId)
            );
            return response.data;
        } catch (err) {
            throw UserAddressService.createErrorResponse(err);
        }
    }
}

export default new UserAddressService();