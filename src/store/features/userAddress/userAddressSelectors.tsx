import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import type { AddressResponseDTO } from '@/types';

// Basic selectors
export const selectUserAddressState = (state: RootState) => state.userAddress;

export const selectAddresses = createSelector(
    [selectUserAddressState],
    (state) => state.addresses || []
);

export const selectCurrentAddress = createSelector(
    [selectUserAddressState],
    (state) => state.currentAddress
);

export const selectDefaultAddress = createSelector(
    [selectUserAddressState],
    (state) => state.defaultAddress
);

export const selectAddressCount = createSelector(
    [selectUserAddressState],
    (state) => state.addressCount
);

export const selectIsLoading = createSelector(
    [selectUserAddressState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectUserAddressState],
    (state) => state.error
);

// Enhanced address selectors
export const selectFormattedAddresses = createSelector(
    [selectAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        return addresses.map(address => {
            if (!address) return null;
            return {
                ...address,
                formattedId: `ADDR-${address.addressId}`,
                fullAddressDisplay: address.fullAddress ||
                    `${address.addressLine || ''}, ${address.ward || ''}, ${address.district || ''}, ${address.city || ''}`,
                isDefaultDisplay: address.isDefault ? 'Default' : '',
                defaultBadge: address.isDefault ? 'Default' : null
            };
        }).filter(Boolean);
    }
);

export const selectFormattedCurrentAddress = createSelector(
    [selectCurrentAddress],
    (address) => {
        if (!address) return null;

        return {
            ...address,
            formattedId: `ADDR-${address.addressId}`,
            fullAddressDisplay: address.fullAddress ||
                `${address.addressLine || ''}, ${address.ward || ''}, ${address.district || ''}, ${address.city || ''}`,
            isDefaultDisplay: address.isDefault ? 'Default' : '',
            defaultBadge: address.isDefault ? 'Default' : null
        };
    }
);

export const selectFormattedDefaultAddress = createSelector(
    [selectDefaultAddress],
    (address) => {
        if (!address) return null;

        return {
            ...address,
            formattedId: `ADDR-${address.addressId}`,
            fullAddressDisplay: address.fullAddress ||
                `${address.addressLine || ''}, ${address.ward || ''}, ${address.district || ''}, ${address.city || ''}`,
            isDefaultDisplay: 'Default',
            defaultBadge: 'Default'
        };
    }
);

// Address by ID selector
export const selectAddressById = createSelector(
    [selectAddresses, (_: RootState, addressId: number) => addressId],
    (addresses, addressId) => {
        const found = addresses.find(a => a?.addressId === addressId);
        return found ? {
            ...found,
            formattedId: `ADDR-${addressId}`,
            fullAddressDisplay: found.fullAddress ||
                `${found.addressLine || ''}, ${found.ward || ''}, ${found.district || ''}, ${found.city || ''}`,
            isDefaultDisplay: found.isDefault ? 'Default' : '',
            defaultBadge: found.isDefault ? 'Default' : null
        } : null;
    }
);

// Addresses by user ID selector
export const selectAddressesByUserId = createSelector(
    [selectAddresses, (_: RootState, userId: number) => userId],
    (addresses, userId) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        return addresses
            .filter(a => a?.userId === userId)
            .map(address => {
                if (!address) return null;
                return {
                    ...address,
                    formattedId: `ADDR-${address.addressId}`,
                    fullAddressDisplay: address.fullAddress ||
                        `${address.addressLine || ''}, ${address.ward || ''}, ${address.district || ''}, ${address.city || ''}`,
                    isDefaultDisplay: address.isDefault ? 'Default' : '',
                    defaultBadge: address.isDefault ? 'Default' : null,
                    addressCount: addresses.filter(a => a?.userId === userId).length
                };
            }).filter(Boolean);
    }
);

// Filter and search selectors
interface AddressFilters {
    city?: string;
    district?: string;
    ward?: string;
    isDefault?: boolean;
    search?: string;
}

export const selectFilteredAddresses = createSelector(
    [selectFormattedAddresses, (_: RootState, filters: AddressFilters) => filters],
    (addresses, filters) => {
        if (!addresses || !Array.isArray(addresses) || !filters) {
            return addresses || [];
        }

        return addresses.filter(address => {
            if (!address) return false;

            const matchesCity = !filters.city ||
                (address.city && address.city.toLowerCase().includes(filters.city.toLowerCase()));

            const matchesDistrict = !filters.district ||
                (address.district && address.district.toLowerCase().includes(filters.district.toLowerCase()));

            const matchesWard = !filters.ward ||
                (address.ward && address.ward.toLowerCase().includes(filters.ward.toLowerCase()));

            const matchesDefault = filters.isDefault === undefined || address.isDefault === filters.isDefault;

            const searchTerm = filters.search?.toLowerCase();
            const matchesSearch = !searchTerm ||
                (address.addressLine && address.addressLine.toLowerCase().includes(searchTerm)) ||
                (address.city && address.city.toLowerCase().includes(searchTerm)) ||
                (address.district && address.district.toLowerCase().includes(searchTerm)) ||
                (address.ward && address.ward.toLowerCase().includes(searchTerm)) ||
                (address.phoneNumber && address.phoneNumber.includes(searchTerm));

            return matchesCity && matchesDistrict && matchesWard && matchesDefault && matchesSearch;
        });
    }
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedAddresses = createSelector(
    [
        selectFormattedAddresses,
        (_: RootState, sortBy: keyof AddressResponseDTO) => sortBy,
        (_: RootState, __: keyof AddressResponseDTO, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (addresses, sortBy, sortOrder) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        return [...addresses]
            .sort((a, b) => {
                if (!a || !b) return 0;

                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (aVal === bVal) return 0;
                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                    return sortOrder === 'asc'
                        ? (aVal === bVal ? 0 : aVal ? -1 : 1)
                        : (aVal === bVal ? 0 : aVal ? 1 : -1);
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            })
            .map((a, index) => {
                if (!a) return null;
                return {
                    ...a,
                    sortIndex: index + 1,
                    sortedBy: sortBy
                };
            }).filter(Boolean);
    }
);

// Group addresses by properties
export const selectAddressesByCity = createSelector(
    [selectFormattedAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return {};
        }

        return addresses.reduce((groups: { [city: string]: AddressResponseDTO[] }, address) => {
            if (!address || !address.city) return groups;

            const city = address.city;
            if (!groups[city]) {
                groups[city] = [];
            }
            groups[city].push(address);
            return groups;
        }, {});
    }
);

export const selectAddressesByDistrict = createSelector(
    [selectFormattedAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return {};
        }

        return addresses.reduce((groups: { [district: string]: AddressResponseDTO[] }, address) => {
            if (!address || !address.district) return groups;

            const district = address.district;
            if (!groups[district]) {
                groups[district] = [];
            }
            groups[district].push(address);
            return groups;
        }, {});
    }
);

// Count selectors
export const selectAddressesCountDisplay = createSelector(
    [selectAddressCount],
    (count) => ({
        total: count,
        displayText: `Total: ${count} addresses`
    })
);

// Check if addresses exist
export const selectIsAddressesEmpty = createSelector(
    [selectAddresses],
    (addresses) => ({
        isEmpty: !addresses || addresses.length === 0,
        message: !addresses || addresses.length === 0 ? 'No addresses found' : 'Addresses available'
    })
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectAddressOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Loading...' : error ? 'Error occurred' : 'Success'
    })
);

// Check for default status
export const selectHasDefaultAddress = createSelector(
    [selectAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return {
                hasDefault: false,
                message: 'No default address set'
            };
        }

        const hasDefault = addresses.some(address => address && address.isDefault);
        return {
            hasDefault,
            message: hasDefault ? 'Default address is set' : 'No default address set'
        };
    }
);

// List of cities/districts/wards from current addresses
export const selectCitiesList = createSelector(
    [selectAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        const cities = new Set<string>();
        addresses.forEach(address => {
            if (address && address.city) {
                cities.add(address.city);
            }
        });

        return Array.from(cities).sort();
    }
);

export const selectDistrictsList = createSelector(
    [selectAddresses, (_: RootState, city?: string) => city],
    (addresses, city) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        const districts = new Set<string>();
        addresses.forEach(address => {
            if (address && address.district && (!city || address.city === city)) {
                districts.add(address.district);
            }
        });

        return Array.from(districts).sort();
    }
);

export const selectWardsList = createSelector(
    [selectAddresses, (_: RootState, district?: string) => district],
    (addresses, district) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        const wards = new Set<string>();
        addresses.forEach(address => {
            if (address && address.ward && (!district || address.district === district)) {
                wards.add(address.ward);
            }
        });

        return Array.from(wards).sort();
    }
);

// Get non-default addresses
export const selectNonDefaultAddresses = createSelector(
    [selectFormattedAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        return addresses.filter(address => address && !address.isDefault);
    }
);

// Display helpers
export const selectAddressDisplayOptions = createSelector(
    [selectFormattedAddresses],
    (addresses) => {
        if (!addresses || !Array.isArray(addresses)) {
            return [];
        }

        return addresses.map(address => {
            if (!address) return null;
            return {
                value: address.addressId,
                label: address.fullAddressDisplay + (address.isDefault ? ' (Default)' : ''),
                isDefault: address.isDefault
            };
        }).filter(Boolean);
    }
);

// Check if address belongs to user
export const selectIsAddressBelongToUser = createSelector(
    [selectAddresses, (_: RootState, params: { userId: number; addressId: number }) => params],
    (addresses, { userId, addressId }) => {
        if (!addresses || !Array.isArray(addresses)) {
            return false;
        }

        return addresses.some(address =>
            address && address.addressId === addressId && address.userId === userId
        );
    }
);