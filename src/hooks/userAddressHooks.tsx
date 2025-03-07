import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchUserAddresses,
    fetchAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchDefaultAddress,
    fetchAddressCount,
    fetchAddressesByUserId,
    getAddressById,
    createAddressForUser,
    updateAddressAdmin,
    deleteAddressAdmin,
    clearError,
    clearCurrentAddress
} from '../store/features/userAddress/userAddressSlice';
import {
    selectAddresses,
    selectFormattedAddresses,
    selectCurrentAddress,
    selectFormattedCurrentAddress,
    selectDefaultAddress,
    selectFormattedDefaultAddress,
    selectAddressCount,
    selectAddressesCountDisplay,
    selectError,
    selectAddressById,
    selectAddressesByUserId,
    selectFilteredAddresses,
    selectAddressOperationStatus,
    selectSortedAddresses,
    selectIsAddressesEmpty,
    selectHasDefaultAddress,
    selectCitiesList,
    selectDistrictsList,
    selectWardsList,
    selectNonDefaultAddresses,
    selectAddressDisplayOptions,
    selectIsAddressBelongToUser,
    selectAddressesByCity,
    selectAddressesByDistrict
} from '../store/features/userAddress/userAddressSelectors';
import type {
    AddressRequestDTO,
    UpdateAddressDTO,
    AddressResponseDTO
} from '@/types';

// Main address management hook
export const useAddresses = () => {
    const dispatch = useAppDispatch();
    const addresses = useAppSelector(selectAddresses);
    const formattedAddresses = useAppSelector(selectFormattedAddresses);
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);
    const addressCount = useAppSelector(selectAddressCount);
    const addressCountDisplay = useAppSelector(selectAddressesCountDisplay);
    const isEmpty = useAppSelector(selectIsAddressesEmpty);

    const handleFetchUserAddresses = useCallback(async () => {
        try {
            await dispatch(fetchUserAddresses()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateAddress = useCallback(async (
        addressData: AddressRequestDTO
    ): Promise<AddressResponseDTO | null> => {
        try {
            const result = await dispatch(createAddress(addressData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateAddress = useCallback(async (
        addressId: number,
        updateData: UpdateAddressDTO
    ) => {
        try {
            await dispatch(updateAddress({ addressId, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteAddress = useCallback(async (addressId: number) => {
        try {
            await dispatch(deleteAddress(addressId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        addresses,
        formattedAddresses,
        isLoading,
        error,
        addressCount,
        addressCountDisplay,
        isEmpty,
        fetchUserAddresses: handleFetchUserAddresses,
        createAddress: handleCreateAddress,
        updateAddress: handleUpdateAddress,
        deleteAddress: handleDeleteAddress
    };
};

// Hook for finding specific addresses
export const useAddressFinder = (addressId?: number) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);
    const foundAddress = useAppSelector(addressId ? (state => selectAddressById(state, addressId)) : () => null);

    const handleFetchAddressById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchAddressById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleGetAddressById = useCallback(async (id: number) => {
        try {
            await dispatch(getAddressById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundAddress,
        fetchAddressById: handleFetchAddressById,
        getAddressById: handleGetAddressById
    };
};

// Hook for default address management
export const useDefaultAddress = () => {
    const dispatch = useAppDispatch();
    const defaultAddress = useAppSelector(selectDefaultAddress);
    const formattedDefaultAddress = useAppSelector(selectFormattedDefaultAddress);
    const hasDefaultAddress = useAppSelector(selectHasDefaultAddress);
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);

    const handleFetchDefaultAddress = useCallback(async () => {
        try {
            await dispatch(fetchDefaultAddress()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleSetDefaultAddress = useCallback(async (addressId: number) => {
        try {
            await dispatch(setDefaultAddress(addressId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        defaultAddress,
        formattedDefaultAddress,
        hasDefaultAddress,
        isLoading,
        error,
        fetchDefaultAddress: handleFetchDefaultAddress,
        setDefaultAddress: handleSetDefaultAddress
    };
};

// Hook for user's addresses by user ID
export const useUserAddresses = (userId?: number) => {
    const dispatch = useAppDispatch();
    const userAddresses = useAppSelector(userId ? (state => selectAddressesByUserId(state, userId)) : selectFormattedAddresses);
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);

    const handleFetchAddressesByUserId = useCallback(async (id: number) => {
        try {
            await dispatch(fetchAddressesByUserId(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateAddressForUser = useCallback(async (
        userId: number,
        addressData: AddressRequestDTO
    ): Promise<AddressResponseDTO | null> => {
        try {
            const result = await dispatch(createAddressForUser({ userId, addressData })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    return {
        userAddresses,
        isLoading,
        error,
        fetchAddressesByUserId: handleFetchAddressesByUserId,
        createAddressForUser: handleCreateAddressForUser
    };
};

// Hook for address count
export const useAddressCount = () => {
    const dispatch = useAppDispatch();
    const addressCount = useAppSelector(selectAddressCount);
    const addressCountDisplay = useAppSelector(selectAddressesCountDisplay);
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);

    const handleFetchAddressCount = useCallback(async () => {
        try {
            await dispatch(fetchAddressCount()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        addressCount,
        addressCountDisplay,
        isLoading,
        error,
        fetchAddressCount: handleFetchAddressCount
    };
};

// Hook for address filtering
interface AddressFilters {
    city?: string;
    district?: string;
    ward?: string;
    isDefault?: boolean;
    search?: string;
}

export const useFilteredAddresses = (filters: AddressFilters = {}) => {
    const filteredAddresses = useAppSelector(state => selectFilteredAddresses(state, filters));
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);

    return {
        filteredAddresses,
        isLoading,
        error
    };
};

// Hook for sorted address lists
type SortOrder = 'asc' | 'desc';

export const useSortedAddresses = (sortBy?: keyof AddressResponseDTO, sortOrder: SortOrder = 'asc') => {
    const sortedAddresses = useAppSelector(
        sortBy ? (state => selectSortedAddresses(state, sortBy, sortOrder)) : selectFormattedAddresses
    );

    return {
        sortedAddresses
    };
};

// Hook for current address management
export const useCurrentAddress = () => {
    const dispatch = useAppDispatch();
    const currentAddress = useAppSelector(selectCurrentAddress);
    const formattedCurrentAddress = useAppSelector(selectFormattedCurrentAddress);
    const { isLoading, error } = useAppSelector(selectAddressOperationStatus);

    const handleClearCurrentAddress = useCallback(() => {
        dispatch(clearCurrentAddress());
    }, [dispatch]);

    const handleUpdateAddressAdmin = useCallback(async (
        addressId: number,
        updateData: UpdateAddressDTO
    ) => {
        try {
            await dispatch(updateAddressAdmin({ addressId, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteAddressAdmin = useCallback(async (addressId: number) => {
        try {
            await dispatch(deleteAddressAdmin(addressId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        currentAddress,
        formattedCurrentAddress,
        isLoading,
        error,
        clearCurrentAddress: handleClearCurrentAddress,
        updateAddressAdmin: handleUpdateAddressAdmin,
        deleteAddressAdmin: handleDeleteAddressAdmin
    };
};

// Hook for location data lists
export const useLocationLists = () => {
    const cities = useAppSelector(selectCitiesList);
    const districts = useAppSelector((state) => selectDistrictsList(state));
    const wards = useAppSelector((state) => selectWardsList(state));

    // Instead of calling hooks inside callbacks (which violates React's rules of hooks),
    // we'll use the selector directly with the component's state
    return {
        cities,
        districts,
        wards,
        // These are now functions that need to be used with the useAppSelector hook in the component
        getDistrictsByCitySelector: selectDistrictsList,
        getWardsByDistrictSelector: selectWardsList
    };
};

// Hook for getting districts by city
export const useDistrictsByCity = (city: string) => {
    return useAppSelector((state) => selectDistrictsList(state, city));
};

// Hook for getting wards by district
export const useWardsByDistrict = (district: string) => {
    return useAppSelector((state) => selectWardsList(state, district));
};

// Hook for grouped addresses
export const useGroupedAddresses = () => {
    const addressesByCity = useAppSelector(selectAddressesByCity);
    const addressesByDistrict = useAppSelector(selectAddressesByDistrict);
    const nonDefaultAddresses = useAppSelector(selectNonDefaultAddresses);
    const addressDisplayOptions = useAppSelector(selectAddressDisplayOptions);

    return {
        addressesByCity,
        addressesByDistrict,
        nonDefaultAddresses,
        addressDisplayOptions
    };
};

// Hook for address ownership check
export const useAddressOwnership = (userId?: number, addressId?: number) => {
    const isAddressBelongToUser = useAppSelector(
        userId && addressId ?
            (state => selectIsAddressBelongToUser(state, { userId, addressId })) :
            () => false
    );

    return {
        isAddressBelongToUser
    };
};

// Hook for error handling
export const useAddressError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};