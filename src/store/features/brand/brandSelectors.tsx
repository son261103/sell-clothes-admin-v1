import {createSelector} from 'reselect';
import type {RootState} from '../../store';

// Basic selectors
export const selectBrandState = (state: RootState) => state.brand;

export const selectBrandsPage = createSelector(
    selectBrandState,
    (state) => state.brands
);

export const selectBrandsList = createSelector(
    selectBrandsPage,
    (brands) => brands.content
);

export const selectCurrentBrand = createSelector(
    selectBrandState,
    (state) => state.currentBrand
);

export const selectBrandHierarchy = createSelector(
    selectBrandState,
    (state) => state.hierarchy
);

export const selectIsLoading = createSelector(
    selectBrandState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectBrandState,
    (state) => state.error
);

export const selectMessage = createSelector(
    selectBrandState,
    (state) => state.message
);

// Pagination selectors
export const selectPageInfo = createSelector(
    selectBrandsPage,
    (brands) => ({
        totalPages: brands.totalPages,
        totalElements: brands.totalElements,
        size: brands.size,
        number: brands.number,
        first: brands.first,
        last: brands.last,
        empty: brands.empty
    })
);

// Brand information selectors
export const selectBrandById = createSelector(
    [selectBrandsList, (_, brandId: number) => brandId],
    (brands, brandId) => brands.find(brand => brand.brandId === brandId) || null
);

// Status-based selectors
export const selectActiveBrands = createSelector(
    selectBrandsList,
    (brands) => brands.filter(brand => brand.status)
);

export const selectInactiveBrands = createSelector(
    selectBrandsList,
    (brands) => brands.filter(brand => !brand.status)
);

// Search and filter selectors
interface BrandFilters {
    status?: boolean;
    searchTerm?: string;
}

export const selectFilteredBrands = createSelector(
    [selectBrandsList, (_, filters: BrandFilters) => filters],
    (brands, filters) => {
        if (!filters) return brands;

        return brands.filter(brand => {
            const matchesStatus = filters.status === undefined || brand.status === filters.status;
            const matchesSearch = !filters.searchTerm ||
                brand.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (brand.description && brand.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            return matchesStatus && matchesSearch;
        });
    }
);