import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import type { ProductVariantFilters } from '@/types';

// Basic selectors
export const selectVariantState = (state: RootState) => state.productVariant;

export const selectVariantsPage = createSelector(
    selectVariantState,
    (state) => state.variants
);

export const selectVariantsList = createSelector(
    selectVariantsPage,
    (variants) => variants.content
);

export const selectCurrentVariant = createSelector(
    selectVariantState,
    (state) => state.currentVariant
);

export const selectVariantHierarchy = createSelector(
    selectVariantState,
    (state) => state.variantHierarchy
);

export const selectIsLoading = createSelector(
    selectVariantState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectVariantState,
    (state) => state.error
);

// Stock-related selectors
export const selectLowStockVariants = createSelector(
    selectVariantState,
    (state) => state.lowStockVariants
);

export const selectOutOfStockVariants = createSelector(
    selectVariantState,
    (state) => state.outOfStockVariants
);

// Pagination selectors
export const selectPageInfo = createSelector(
    selectVariantsPage,
    (variants) => ({
        totalPages: variants.totalPages,
        totalElements: variants.totalElements,
        size: variants.size,
        number: variants.number,
        first: variants.first,
        last: variants.last,
        empty: variants.empty
    })
);

// Variant information selectors
export const selectVariantById = createSelector(
    [selectVariantsList, (_, variantId: number) => variantId],
    (variants, variantId) => variants.find(variant => variant.variantId === variantId) || null
);

export const selectVariantBySku = createSelector(
    [selectVariantsList, (_, sku: string) => sku],
    (variants, sku) => variants.find(variant => variant.sku === sku) || null
);

// Product-based selectors (Đã sửa)
export const selectVariantsByProductId = createSelector(
    [selectVariantState, (_, productId: number) => productId],
    (state, productId) => state.variantsByProduct.filter(variant => variant.product?.productId === productId)
);

export const selectActiveVariantsByProductId = createSelector(
    [selectVariantsByProductId],
    (variants) => variants.filter(variant => variant.status)
);

// Size and Color selectors
export const selectVariantsBySize = createSelector(
    [selectVariantsList, (_, size: string) => size],
    (variants, size) => variants.filter(variant => variant.size === size)
);

export const selectVariantsByColor = createSelector(
    [selectVariantsList, (_, color: string) => color],
    (variants, color) => variants.filter(variant => variant.color === color)
);

export const selectUniqueColors = createSelector(
    selectVariantsList,
    (variants) => [...new Set(variants.map(variant => variant.color))]
);

export const selectUniqueSizes = createSelector(
    selectVariantsList,
    (variants) => [...new Set(variants.map(variant => variant.size))]
);

// Stock-based selectors
export const selectVariantsByStockRange = createSelector(
    [selectVariantsList, (_, minStock: number, maxStock: number) => ({ minStock, maxStock })],
    (variants, { minStock, maxStock }) => variants.filter(
        variant => variant.stockQuantity >= minStock && variant.stockQuantity <= maxStock
    )
);

// Filter selectors
export const selectFilteredVariants = createSelector(
    [selectVariantsList, (_, filters: ProductVariantFilters) => filters],
    (variants, filters) => {
        if (!filters) return variants;

        return variants.filter(variant => {
            const matchesProductId = !filters.productId || variant.product.productId === filters.productId;
            const matchesSize = !filters.size || variant.size.toLowerCase() === filters.size.toLowerCase();
            const matchesColor = !filters.color || variant.color.toLowerCase() === filters.color.toLowerCase();
            const matchesStatus = filters.status === undefined || variant.status === filters.status;

            return matchesProductId && matchesSize && matchesColor && matchesStatus;
        });
    }
);

// Hierarchy statistics selectors
export const selectVariantStats = createSelector(
    selectVariantHierarchy,
    (hierarchy): HierarchyStats | null => hierarchy ? {
        totalVariants: hierarchy.totalVariants,
        activeVariants: hierarchy.activeVariants,
        inactiveVariants: hierarchy.inactiveVariants,
        totalStock: hierarchy.totalStock
    } : null
);

export const selectStockBySize = createSelector(
    selectVariantHierarchy,
    (hierarchy): Record<string, number> => hierarchy?.stockBySize || {}
);

export const selectStockByColor = createSelector(
    selectVariantHierarchy,
    (hierarchy): Record<string, number> => hierarchy?.stockByColor || {}
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.first
);

export const selectIsLastPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.last
);

export const selectCurrentPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.number
);

export const selectPageSize = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.size
);

export const selectTotalPages = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.totalPages
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

interface HierarchyStats {
    totalVariants: number;
    activeVariants: number;
    inactiveVariants: number;
    totalStock: number;
}

export const selectVariantOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Availability selectors
export const selectAvailabilityCheck = createSelector(
    [
        selectVariantsList,
        (_, productId: number, size: string, color: string) => ({ productId, size, color })
    ],
    (variants, { productId, size, color }) => {
        const variant = variants.find(v =>
            v.product.productId === productId &&
            v.size === size &&
            v.color === color
        );
        return variant ? variant.stockQuantity > 0 : false;
    }
);