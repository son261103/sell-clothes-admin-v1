import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserAddressService from '../../../services/userAddressService';
import type {
    AddressRequestDTO,
    UpdateAddressDTO,
    AddressResponseDTO
} from '@/types';

interface UserAddressState {
    addresses: AddressResponseDTO[];
    currentAddress: AddressResponseDTO | null;
    defaultAddress: AddressResponseDTO | null;
    addressCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserAddressState = {
    addresses: [],
    currentAddress: null,
    defaultAddress: null,
    addressCount: 0,
    isLoading: false,
    error: null
};

// Error handler
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'An unexpected error occurred';
};

// Async thunk actions - User side
export const fetchUserAddresses = createAsyncThunk(
    'userAddress/fetchUserAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getUserAddresses();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch addresses');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchAddressById = createAsyncThunk(
    'userAddress/fetchAddressById',
    async (addressId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getUserAddressById(addressId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createAddress = createAsyncThunk(
    'userAddress/createAddress',
    async (addressData: AddressRequestDTO, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.createAddress(addressData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateAddress = createAsyncThunk(
    'userAddress/updateAddress',
    async ({ addressId, updateData }: { addressId: number; updateData: UpdateAddressDTO }, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.updateAddress(addressId, updateData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'userAddress/deleteAddress',
    async (addressId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.deleteAddress(addressId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete address');
            }
            return addressId;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const setDefaultAddress = createAsyncThunk(
    'userAddress/setDefaultAddress',
    async (addressId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.setDefaultAddress(addressId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to set default address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchDefaultAddress = createAsyncThunk(
    'userAddress/fetchDefaultAddress',
    async (_, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getDefaultAddress();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch default address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchAddressCount = createAsyncThunk(
    'userAddress/fetchAddressCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getAddressCount();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch address count');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Admin thunk actions
export const fetchAddressesByUserId = createAsyncThunk(
    'userAddress/fetchAddressesByUserId',
    async (userId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getAddressesByUserId(userId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch user addresses');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getAddressById = createAsyncThunk(
    'userAddress/getAddressById',
    async (addressId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.getAddressById(addressId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createAddressForUser = createAsyncThunk(
    'userAddress/createAddressForUser',
    async ({ userId, addressData }: { userId: number; addressData: AddressRequestDTO }, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.createAddressForUser(userId, addressData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create user address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateAddressAdmin = createAsyncThunk(
    'userAddress/updateAddressAdmin',
    async ({ addressId, updateData }: { addressId: number; updateData: UpdateAddressDTO }, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.updateAddressAdmin(addressId, updateData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update address');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteAddressAdmin = createAsyncThunk(
    'userAddress/deleteAddressAdmin',
    async (addressId: number, { rejectWithValue }) => {
        try {
            const response = await UserAddressService.deleteAddressAdmin(addressId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete address');
            }
            return addressId;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const userAddressSlice = createSlice({
    name: 'userAddress',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentAddress: (state) => {
            state.currentAddress = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Addresses
            .addCase(fetchUserAddresses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserAddresses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = action.payload;
                state.error = null;
            })
            .addCase(fetchUserAddresses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Address By ID
            .addCase(fetchAddressById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAddressById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentAddress = action.payload;
                state.error = null;
            })
            .addCase(fetchAddressById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Address
            .addCase(createAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = [...state.addresses, action.payload];
                state.currentAddress = action.payload;
                state.addressCount += 1;

                // Update default address if this is set as default
                if (action.payload.isDefault) {
                    state.defaultAddress = action.payload;
                    // Update other addresses to not be default
                    state.addresses = state.addresses.map(address =>
                        address.addressId !== action.payload.addressId
                            ? { ...address, isDefault: false }
                            : address
                    );
                }

                state.error = null;
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Address
            .addCase(updateAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in addresses list
                state.addresses = state.addresses.map(address =>
                    address.addressId === action.payload.addressId
                        ? action.payload
                        : address
                );

                // Update current address if it's the same
                if (state.currentAddress?.addressId === action.payload.addressId) {
                    state.currentAddress = action.payload;
                }

                // Update default address if this is set as default
                if (action.payload.isDefault) {
                    state.defaultAddress = action.payload;
                    // Update other addresses to not be default
                    state.addresses = state.addresses.map(address =>
                        address.addressId !== action.payload.addressId
                            ? { ...address, isDefault: false }
                            : address
                    );
                }

                // Update default address if it was this one but is no longer default
                if (state.defaultAddress?.addressId === action.payload.addressId && !action.payload.isDefault) {
                    state.defaultAddress = null;
                }

                state.error = null;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Address
            .addCase(deleteAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                // Get the address before removing it
                // const deletedAddress = state.addresses.find(
                //     address => address.addressId === action.payload
                // );

                // Remove from addresses list
                state.addresses = state.addresses.filter(
                    address => address.addressId !== action.payload
                );

                // Update address count
                state.addressCount -= 1;

                // Clear current address if it's the same
                if (state.currentAddress?.addressId === action.payload) {
                    state.currentAddress = null;
                }

                // Clear default address if it's the same
                if (state.defaultAddress?.addressId === action.payload) {
                    state.defaultAddress = null;
                }

                state.error = null;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Set Default Address
            .addCase(setDefaultAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in addresses list
                state.addresses = state.addresses.map(address =>
                    address.addressId === action.payload.addressId
                        ? { ...address, isDefault: true }
                        : { ...address, isDefault: false }
                );

                // Update default address
                state.defaultAddress = action.payload;

                // Update current address if it's the same
                if (state.currentAddress?.addressId === action.payload.addressId) {
                    state.currentAddress = action.payload;
                }

                state.error = null;
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Default Address
            .addCase(fetchDefaultAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.defaultAddress = action.payload;
                state.error = null;
            })
            .addCase(fetchDefaultAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Address Count
            .addCase(fetchAddressCount.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAddressCount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addressCount = action.payload;
                state.error = null;
            })
            .addCase(fetchAddressCount.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Admin: Fetch Addresses By User ID
            .addCase(fetchAddressesByUserId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAddressesByUserId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = action.payload;
                state.error = null;
            })
            .addCase(fetchAddressesByUserId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Admin: Get Address By ID
            .addCase(getAddressById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAddressById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentAddress = action.payload;
                state.error = null;
            })
            .addCase(getAddressById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Admin: Create Address For User
            .addCase(createAddressForUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createAddressForUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = [...state.addresses, action.payload];
                state.currentAddress = action.payload;
                state.addressCount += 1;

                // Update default address if this is set as default
                if (action.payload.isDefault) {
                    state.defaultAddress = action.payload;
                    // Update other addresses to not be default
                    state.addresses = state.addresses.map(address =>
                        address.addressId !== action.payload.addressId
                            ? { ...address, isDefault: false }
                            : address
                    );
                }

                state.error = null;
            })
            .addCase(createAddressForUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Admin: Update Address
            .addCase(updateAddressAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAddressAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in addresses list
                state.addresses = state.addresses.map(address =>
                    address.addressId === action.payload.addressId
                        ? action.payload
                        : address
                );

                // Update current address if it's the same
                if (state.currentAddress?.addressId === action.payload.addressId) {
                    state.currentAddress = action.payload;
                }

                // Update default address if this is set as default
                if (action.payload.isDefault) {
                    state.defaultAddress = action.payload;
                    // Update other addresses to not be default
                    state.addresses = state.addresses.map(address =>
                        address.addressId !== action.payload.addressId
                            ? { ...address, isDefault: false }
                            : address
                    );
                }

                // Update default address if it was this one but is no longer default
                if (state.defaultAddress?.addressId === action.payload.addressId && !action.payload.isDefault) {
                    state.defaultAddress = null;
                }

                state.error = null;
            })
            .addCase(updateAddressAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Admin: Delete Address
            .addCase(deleteAddressAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteAddressAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove from addresses list
                state.addresses = state.addresses.filter(
                    address => address.addressId !== action.payload
                );

                // Update address count
                state.addressCount -= 1;

                // Clear current address if it's the same
                if (state.currentAddress?.addressId === action.payload) {
                    state.currentAddress = null;
                }

                // Clear default address if it's the same
                if (state.defaultAddress?.addressId === action.payload) {
                    state.defaultAddress = null;
                }

                state.error = null;
            })
            .addCase(deleteAddressAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentAddress
} = userAddressSlice.actions;

export default userAddressSlice.reducer;