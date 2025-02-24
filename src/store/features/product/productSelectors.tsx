import {createSelector} from 'reselect';
import type {RootState} from '../../store';
import type {
    ProductResponse,
    ProductFilters
} from '@/types';

// Basic selectors
export const selectProductState = (state: RootState) => state.product;

export const selectProductsPage = createSelector(
    selectProductState,
    (state) => state.products
);

export const selectProductsList = createSelector(
    selectProductsPage,
    (products) => products.content
);

export const selectCurrentProduct = createSelector(
    selectProductState,
    (state) => state.currentProduct
);

export const selectProductHierarchy = createSelector(
    selectProductState,
    (state) => state.productHierarchy
);

export const selectIsLoading = createSelector(
    selectProductState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectProductState,
    (state) => state.error
);

// Featured and Related Products selectors
export const selectFeaturedProducts = createSelector(
    selectProductState,
    (state) => state.featuredProducts
);

export const selectRelatedProducts = createSelector(
    selectProductState,
    (state) => state.relatedProducts
);

// Latest and Sale Products selectors
export const selectLatestProducts = createSelector(
    selectProductState,
    (state) => state.latestProducts
);

export const selectSaleProducts = createSelector(
    selectProductState,
    (state) => state.saleProducts
);

// Pagination selectors
export const selectPageInfo = createSelector(
    selectProductsPage,
    (products) => ({
        totalPages: products.totalPages,
        totalElements: products.totalElements,
        size: products.size,
        number: products.number,
        first: products.first,
        last: products.last,
        empty: products.empty
    })
);

// Product information selectors
export const selectProductById = createSelector(
    [selectProductsList, (_, productId: number) => productId],
    (products, productId) => products.find(product => product.productId === productId) || null
);

export const selectProductBySlug = createSelector(
    [selectProductsList, (_, slug: string) => slug],
    (products, slug) => products.find(product => product.slug === slug) || null
);

// Category and Brand based selectors
export const selectProductsByCategory = createSelector(
    [selectProductsList, (_, categoryId: number) => categoryId],
    (products, categoryId) => products.filter(product => product.category.categoryId === categoryId)
);

export const selectProductsByBrand = createSelector(
    [selectProductsList, (_, brandId: number) => brandId],
    (products, brandId) => products.filter(product => product.brand.brandId === brandId)
);

// Status-based selectors
export const selectActiveProducts = createSelector(
    selectProductsList,
    (products) => products.filter(product => product.status)
);

export const selectInactiveProducts = createSelector(
    selectProductsList,
    (products) => products.filter(product => !product.status)
);

// Price-based selectors
export const selectProductsOnSale = createSelector(
    selectProductsList,
    (products) => products.filter(product => product.salePrice && product.salePrice < product.price)
);

export const selectProductsByPriceRange = createSelector(
    [selectProductsList, (_, minPrice: number, maxPrice: number) => ({minPrice, maxPrice})],
    (products, {minPrice, maxPrice}) => products.filter(
        product => product.price >= minPrice && product.price <= maxPrice
    )
);

// Search and filter selectors
export const selectFilteredProducts = createSelector(
    [selectProductsList, (_, filters: ProductFilters) => filters],
    (products, filters) => {
        if (!filters) return products;

        return products.filter(product => {
            const matchesSearch = !filters.search ||
                product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase()));

            const matchesCategory = !filters.categoryId ||
                product.category.categoryId === filters.categoryId;

            const matchesBrand = !filters.brandId ||
                product.brand.brandId === filters.brandId;

            const matchesStatus = filters.status === undefined ||
                product.status === filters.status;

            const matchesPrice = (!filters.minPrice || product.price >= filters.minPrice) &&
                (!filters.maxPrice || product.price <= filters.maxPrice);

            return matchesSearch && matchesCategory && matchesBrand && matchesStatus && matchesPrice;
        });
    }
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedProducts = createSelector(
    [
        selectProductsList,
        (_, sortBy: keyof ProductResponse) => sortBy,
        (_, __, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (products, sortBy, sortOrder) => {
        return [...products].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal === bVal) return 0;
            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
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

// Hierarchy selectors
export const selectProductStats = createSelector(
    selectProductHierarchy,
    (hierarchy) => hierarchy ? {
        totalProducts: hierarchy.totalProducts,
        activeProducts: hierarchy.activeProducts,
        inactiveProducts: hierarchy.inactiveProducts
    } : null
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

export const selectProductOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);