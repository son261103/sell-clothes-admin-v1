import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks'; // Đảm bảo đường dẫn đúng
import {
    getFilteredVariants,
    fetchVariantById,
    fetchVariantBySku,
    createVariant,
    bulkCreateVariants,
    updateVariant,
    deleteVariant,
    toggleVariantStatus,
    fetchVariantHierarchy,
    fetchLowStockVariants,
    fetchOutOfStockVariants,
    updateStockQuantity,
    fetchVariantsByProductId,
    fetchActiveVariantsByProductId,
    checkVariantAvailability,
    getAvailableSizes,
    getAvailableColors,
    clearError,
    clearCurrentVariant
} from '../store/features/product/productVariantSlice'; // Đảm bảo đường dẫn đúng
import {
    selectVariantsPage,
    selectVariantsList,
    selectCurrentVariant,
    selectVariantHierarchy,
    selectError,
    selectLowStockVariants,
    selectOutOfStockVariants,
    selectPageInfo,
    selectVariantsByProductId,
    selectUniqueColors,
    selectUniqueSizes,
    selectFilteredVariants,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectVariantStats,
    selectStockBySize,
    selectStockByColor,
    selectVariantOperationStatus,
} from '../store/features/product/productVariantSelectors'; // Đảm bảo đường dẫn đúng
import type {
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest,
    ProductVariantResponse,
    ProductVariantPageRequest,
    ProductVariantFilters,
    BulkProductVariantCreateRequest
} from '@/types';

// Main variant management hook
export const useVariants = () => {
    const dispatch = useAppDispatch();
    const variantsPage = useAppSelector(selectVariantsPage);
    const variantsList = useAppSelector(selectVariantsList);
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);
    const pageInfo = useAppSelector(selectPageInfo);
    const variantStats = useAppSelector(selectVariantStats);

    const handleGetFilteredVariants = useCallback(async (
        pageRequest: ProductVariantPageRequest = { page: 0, size: 10, sort: 'variantId,desc' },
        filters?: ProductVariantFilters
    ) => {
        try {
            await dispatch(getFilteredVariants({ pageRequest, filters })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateVariant = useCallback(async (
        variantData: ProductVariantCreateRequest,
        imageFile?: File
    ): Promise<ProductVariantResponse | null> => {
        try {
            const result = await dispatch(createVariant({ variantData, imageFile })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleBulkCreateVariants = useCallback(async (
        bulkData: BulkProductVariantCreateRequest,
        colorImages: Record<string, File>
    ): Promise<ProductVariantResponse[] | null> => {
        try {
            const result = await dispatch(bulkCreateVariants({ bulkData, colorImages })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateVariant = useCallback(async (
        id: number,
        variantData: ProductVariantUpdateRequest,
        imageFile?: File
    ) => {
        try {
            await dispatch(updateVariant({ id, variantData, imageFile })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteVariant = useCallback(async (id: number) => {
        try {
            await dispatch(deleteVariant(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleVariantStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleVariantStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        variantsPage,
        variantsList,
        isLoading,
        error,
        pageInfo,
        variantStats,
        getFilteredVariants: handleGetFilteredVariants,
        createVariant: handleCreateVariant,
        bulkCreateVariants: handleBulkCreateVariants,
        updateVariant: handleUpdateVariant,
        deleteVariant: handleDeleteVariant,
        toggleVariantStatus: handleToggleVariantStatus
    };
};

// Hook for finding specific variants
export const useVariantFinder = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    const handleFetchVariantById = useCallback(async (id: number) => {
        try {
            const result = await dispatch(fetchVariantById(id)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleFetchVariantBySku = useCallback(async (sku: string) => {
        try {
            const result = await dispatch(fetchVariantBySku(sku)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        fetchVariantById: handleFetchVariantById,
        fetchVariantBySku: handleFetchVariantBySku
    };
};

// Hook for variant stock management
export const useVariantStock = () => {
    const dispatch = useAppDispatch();
    const lowStockVariants = useAppSelector(selectLowStockVariants);
    const outOfStockVariants = useAppSelector(selectOutOfStockVariants);
    const stockBySize = useAppSelector(selectStockBySize);
    const stockByColor = useAppSelector(selectStockByColor);
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    const handleFetchLowStockVariants = useCallback(async () => {
        try {
            await dispatch(fetchLowStockVariants()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchOutOfStockVariants = useCallback(async () => {
        try {
            await dispatch(fetchOutOfStockVariants()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateStockQuantity = useCallback(async (id: number, quantity: number) => {
        try {
            await dispatch(updateStockQuantity({ id, quantity })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        lowStockVariants,
        outOfStockVariants,
        stockBySize,
        stockByColor,
        isLoading,
        error,
        fetchLowStockVariants: handleFetchLowStockVariants,
        fetchOutOfStockVariants: handleFetchOutOfStockVariants,
        updateStockQuantity: handleUpdateStockQuantity
    };
};

// Hook for variant filtering by product
export const useVariantsByProduct = (productId: number) => {
    const dispatch = useAppDispatch();
    const variantsByProduct = useAppSelector((state) => selectVariantsByProductId(state, productId));
    const isLoading = useAppSelector((state) => state.productVariant.isLoading);
    const error = useAppSelector((state) => state.productVariant.error);

    const fetchVariantsByProduct = useCallback(async () => {
        try {
            console.log(`Fetching variants for productId: ${productId}`);
            const result = await dispatch(fetchVariantsByProductId(productId)).unwrap();
            console.log('Fetch variants by product result:', result);
            return true;
        } catch (err) {
            console.error('Error fetching variants by product:', err);
            return false;
        }
    }, [dispatch, productId]);

    const fetchActiveVariantsByProduct = useCallback(async () => {
        try {
            console.log(`Fetching active variants for productId: ${productId}`);
            const result = await dispatch(fetchActiveVariantsByProductId(productId)).unwrap();
            console.log('Fetch active variants by product result:', result);
            return true;
        } catch (err) {
            console.error('Error fetching active variants by product:', err);
            return false;
        }
    }, [dispatch, productId]);

    return {
        variantsByProduct: variantsByProduct || [],
        isLoading,
        error,
        fetchVariantsByProduct,
        fetchActiveVariantsByProduct
    };
};

// Hook for variant attributes
export const useVariantAttributes = (productId: number) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);
    const uniqueColors = useAppSelector(selectUniqueColors);
    const uniqueSizes = useAppSelector(selectUniqueSizes);

    const handleGetAvailableSizes = useCallback(async () => {
        try {
            const result = await dispatch(getAvailableSizes(productId)).unwrap();
            return result;
        } catch {
            return [];
        }
    }, [dispatch, productId]);

    const handleGetAvailableColors = useCallback(async () => {
        try {
            const result = await dispatch(getAvailableColors(productId)).unwrap();
            return result;
        } catch {
            return [];
        }
    }, [dispatch, productId]);

    return {
        uniqueColors,
        uniqueSizes,
        isLoading,
        error,
        getAvailableSizes: handleGetAvailableSizes,
        getAvailableColors: handleGetAvailableColors
    };
};

// Hook for variant availability
export const useVariantAvailability = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    const checkAvailability = useCallback(async (
        productId: number,
        size: string,
        color: string
    ) => {
        try {
            const result = await dispatch(checkVariantAvailability({ productId, size, color })).unwrap();
            return result;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        checkAvailability
    };
};

// Hook for variant hierarchy
export const useVariantHierarchy = () => {
    const dispatch = useAppDispatch();
    const variantHierarchy = useAppSelector(selectVariantHierarchy);
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    const handleFetchHierarchy = useCallback(async (productId: number) => {
        try {
            await dispatch(fetchVariantHierarchy(productId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        variantHierarchy,
        isLoading,
        error,
        fetchHierarchy: handleFetchHierarchy
    };
};

// Hook for filtered variants
export const useFilteredVariants = (filters: ProductVariantFilters = {}) => {
    const filteredVariants = useAppSelector(state => selectFilteredVariants(state, filters));
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    return {
        filteredVariants,
        isLoading,
        error
    };
};

// Hook for current variant management
export const useCurrentVariant = () => {
    const dispatch = useAppDispatch();
    const currentVariant = useAppSelector(selectCurrentVariant);
    const { isLoading, error } = useAppSelector(selectVariantOperationStatus);

    const handleClearCurrentVariant = useCallback(() => {
        dispatch(clearCurrentVariant());
    }, [dispatch]);

    return {
        currentVariant,
        isLoading,
        error,
        clearCurrentVariant: handleClearCurrentVariant
    };
};

// Hook for pagination
export const useVariantPagination = () => {
    const isFirstPage = useAppSelector(selectIsFirstPage);
    const isLastPage = useAppSelector(selectIsLastPage);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const pageInfo = useAppSelector(selectPageInfo);

    return {
        isFirstPage,
        isLastPage,
        currentPage,
        pageSize,
        totalPages,
        pageInfo
    };
};

// Hook for error handling
export const useVariantError = () => {
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