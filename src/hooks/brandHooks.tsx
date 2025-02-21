// brandHooks.ts
import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    fetchAllBrands,
    fetchActiveBrands,
    fetchBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    fetchBrandHierarchy,
    toggleBrandStatus,
    clearError,
    clearCurrentBrand,
    clearMessage
} from '../store/features/brand/brandSlice';
import {
    selectBrandsPage,
    selectBrandsList,
    selectCurrentBrand,
    selectBrandHierarchy,
    selectFilteredBrands,
    selectActiveBrands,
    selectInactiveBrands,
    selectPageInfo,
    selectError,
    selectMessage,
    selectIsLoading,
    selectBrandById
} from '../store/features/brand/brandSelectors';
import type {
    BrandCreateRequest,
    BrandUpdateRequest,
    BrandResponse,
    BrandPageRequest,
    BrandFilters
} from '@/types';

// Main brand management hook
export const useBrands = () => {
    const dispatch = useAppDispatch();
    const brandsPage = useAppSelector(selectBrandsPage);
    const brandsList = useAppSelector(selectBrandsList);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);
    const message = useAppSelector(selectMessage);
    const pageInfo = useAppSelector(selectPageInfo);

    const handleFetchAllBrands = useCallback(async (
        pageRequest: BrandPageRequest = {page: 0, size: 10, sort: 'brandId,desc'},
        filters: BrandFilters = {}
    ) => {
        try {
            await dispatch(fetchAllBrands({pageRequest, filters})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchActiveBrands = useCallback(async () => {
        try {
            await dispatch(fetchActiveBrands()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateBrand = useCallback(async (
        brandData: BrandCreateRequest,
        logoFile?: File
    ) => {
        try {
            const result = await dispatch(createBrand({brandData, logoFile})).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateBrand = useCallback(async (
        id: number,
        brandData: BrandUpdateRequest,
        logoFile?: File
    ) => {
        try {
            await dispatch(updateBrand({id, brandData, logoFile})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteBrand = useCallback(async (id: number) => {
        try {
            await dispatch(deleteBrand(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleBrandStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleBrandStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        brandsPage,
        brandsList,
        isLoading,
        error,
        message,
        pageInfo,
        fetchAllBrands: handleFetchAllBrands,
        fetchActiveBrands: handleFetchActiveBrands,
        createBrand: handleCreateBrand,
        updateBrand: handleUpdateBrand,
        deleteBrand: handleDeleteBrand,
        toggleBrandStatus: handleToggleBrandStatus
    };
};

// Hook for current brand management
export const useCurrentBrand = (brandId?: number) => {
    const dispatch = useAppDispatch();
    const currentBrand = useAppSelector(selectCurrentBrand);
    const brandById = useAppSelector(
        brandId ? (state => selectBrandById(state, brandId)) : () => null
    );
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    const handleFetchBrandById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchBrandById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentBrand = useCallback(() => {
        dispatch(clearCurrentBrand());
    }, [dispatch]);

    return {
        currentBrand,
        brandById,
        isLoading,
        error,
        fetchBrandById: handleFetchBrandById,
        clearCurrentBrand: handleClearCurrentBrand
    };
};

// Hook for brand filtering
export const useBrandFilters = (filters: BrandFilters = {}) => {
    const filteredBrands = useAppSelector(state => selectFilteredBrands(state, filters));
    const activeBrands = useAppSelector(selectActiveBrands);
    const inactiveBrands = useAppSelector(selectInactiveBrands);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    return {
        filteredBrands,
        activeBrands,
        inactiveBrands,
        isLoading,
        error
    };
};

// Hook for brand sorting
export const useSortedBrands = (
    sortBy?: keyof BrandResponse,
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const sortedBrands = useAppSelector(selectBrandsList);

    // If no sorting is needed, return the original list
    if (!sortBy) {
        return {sortedBrands};
    }

    // Sort the brands locally based on the sortBy key and order
    const sortedResults = [...sortedBrands].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue === bValue) return 0;
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc'
                ? aValue - bValue
                : bValue - aValue;
        }

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return sortOrder === 'asc'
                ? (aValue === bValue ? 0 : aValue ? 1 : -1)
                : (aValue === bValue ? 0 : aValue ? -1 : 1);
        }

        return 0;
    });

    return {
        sortedBrands: sortedResults
    };
};

// Hook for brand hierarchy
export const useBrandHierarchy = () => {
    const dispatch = useAppDispatch();
    const hierarchy = useAppSelector(selectBrandHierarchy);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    const handleFetchHierarchy = useCallback(async () => {
        try {
            await dispatch(fetchBrandHierarchy()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        hierarchy,
        isLoading,
        error,
        fetchHierarchy: handleFetchHierarchy
    };
};

// Hook for brand pagination
export const useBrandPagination = () => {
    const pageInfo = useAppSelector(selectPageInfo);

    return {
        ...pageInfo
    };
};

// Hook for brand error handling
export const useBrandError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);
    const message = useAppSelector(selectMessage);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearMessage = useCallback(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    return {
        error,
        message,
        clearError: handleClearError,
        clearMessage: handleClearMessage
    };
};