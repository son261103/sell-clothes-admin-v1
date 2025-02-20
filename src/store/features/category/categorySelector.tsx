import {createSelector} from 'reselect';
import type {RootState} from '../../store';
import type {CategoryResponse, CategoryHierarchyResponse} from '../../../types';

// Basic selectors
export const selectCategoryState = (state: RootState) => state.category;

export const selectCategoriesPage = createSelector(
    [selectCategoryState],
    (state) => ({
        content: state.categories.content,
        totalPages: state.categories.totalPages,
        totalElements: state.categories.totalElements,
        size: state.categories.size,
        number: state.categories.number,
        first: state.categories.first,
        last: state.categories.last,
        empty: state.categories.empty
    })
);

export const selectCategoriesList = createSelector(
    [selectCategoriesPage],
    (categories) => categories.content.map(category => ({
        ...category,
        displayName: category.name,
        isParent: !category.parentId
    }))
);

export const selectCurrentCategory = createSelector(
    [selectCategoryState],
    (state) => state.currentCategory ? {
        ...state.currentCategory,
        displayName: state.currentCategory.name,
        isParent: !state.currentCategory.parentId
    } : null
);

export const selectHierarchyData = createSelector(
    [selectCategoryState],
    (state) => state.hierarchyData
);

export const selectIsLoading = createSelector(
    [selectCategoryState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectCategoryState],
    (state) => state.error
);

// Pagination selectors
export const selectPageInfo = createSelector(
    [selectCategoriesPage],
    (categories) => ({
        totalPages: categories.totalPages,
        totalElements: categories.totalElements,
        size: categories.size,
        number: categories.number,
        first: categories.first,
        last: categories.last,
        empty: categories.empty,
        hasNext: !categories.last,
        hasPrevious: !categories.first
    })
);

// Category information selectors
export const selectCategoryById = createSelector(
    [selectCategoriesList, (_: RootState, categoryId: number) => categoryId],
    (categories, categoryId) => {
        const found = categories.find(c => c.categoryId === categoryId);
        return found ? {
            ...found,
            formattedId: `CAT-${categoryId}`
        } : null;
    }
);

export const selectCategoryBySlug = createSelector(
    [selectCategoriesList, (_: RootState, slug: string) => slug],
    (categories, slug) => {
        const found = categories.find(c => c.slug === slug);
        return found ? {
            ...found,
            formattedSlug: slug.toUpperCase()
        } : null;
    }
);

// Parent-Child relationship selectors
export const selectParentCategories = createSelector(
    [selectCategoriesList],
    (categories) => categories.filter(category => !category.parentId)
);

export const selectSubCategories = createSelector(
    [selectCategoriesList],
    (categories) => categories.filter(category => category.parentId)
);

export const selectSubCategoriesByParentId = createSelector(
    [selectCategoriesList, (_: RootState, parentId: number) => parentId],
    (categories, parentId) => categories.filter(category => category.parentId === parentId)
);

// Status-based selectors
export const selectActiveCategories = createSelector(
    [selectCategoriesList],
    (categories) => categories.filter(category => category.status)
);

export const selectInactiveCategories = createSelector(
    [selectCategoriesList],
    (categories) => categories.filter(category => !category.status)
);

// Search and filter selectors
interface CategoryFilters {
    search?: string;
    status?: boolean;
    parentId?: number;
}

export const selectFilteredCategories = createSelector(
    [selectCategoriesList, (_: RootState, filters: CategoryFilters) => filters],
    (categories, filters) => {
        if (!filters) {
            return categories;
        }

        return categories.filter(category => {
            const matchesSearch = !filters.search ||
                category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                category.slug.toLowerCase().includes(filters.search.toLowerCase()) ||
                (category.description?.toLowerCase().includes(filters.search.toLowerCase()));

            const matchesStatus = filters.status === undefined || category.status === filters.status;

            const matchesParent = filters.parentId === undefined || category.parentId === filters.parentId;

            return matchesSearch && matchesStatus && matchesParent;
        });
    }
);

// Hierarchy selectors
export const selectCategoryHierarchy = createSelector(
    [selectHierarchyData],
    (hierarchyData): CategoryHierarchyResponse | null => hierarchyData
);

export const selectHierarchyMetrics = createSelector(
    [selectHierarchyData],
    (hierarchyData) => hierarchyData ? {
        totalSubCategories: hierarchyData.totalSubCategories,
        activeSubCategories: hierarchyData.activeSubCategories,
        inactiveSubCategories: hierarchyData.inactiveSubCategories,
        activePercentage: Math.round((hierarchyData.activeSubCategories / hierarchyData.totalSubCategories) * 100)
    } : null
);

// Count selectors
export const selectCategoriesCount = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Total: ${pageInfo.totalElements} categories`
    })
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectCategoryOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Loading...' : error ? 'Error occurred' : 'Success'
    })
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedCategories = createSelector(
    [
        selectCategoriesList,
        (_: RootState, sortBy: keyof CategoryResponse) => sortBy,
        (_: RootState, __: keyof CategoryResponse, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (categories, sortBy, sortOrder) => {
        return [...categories]
            .sort((a, b) => {
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
            })
            .map((c, index) => ({
                ...c,
                sortIndex: index + 1,
                sortedBy: sortBy
            }));
    }
);

// Empty state selector
export const selectIsCategoriesEmpty = createSelector(
    [selectPageInfo, selectCategoriesList],
    (pageInfo, categories) => ({
        isEmpty: pageInfo.empty || categories.length === 0,
        message: pageInfo.empty ? 'No categories found' : 'Categories available'
    })
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        isFirst: pageInfo.first,
        canNavigatePrevious: !pageInfo.first
    })
);

export const selectIsLastPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        isLast: pageInfo.last,
        canNavigateNext: !pageInfo.last
    })
);

export const selectCurrentPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        current: pageInfo.number,
        displayText: `Page ${pageInfo.number + 1} of ${pageInfo.totalPages}`
    })
);

export const selectPageSize = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        size: pageInfo.size,
        displayText: `Showing ${pageInfo.size} items per page`
    })
);

export const selectTotalPages = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalPages,
        displayText: `Total pages: ${pageInfo.totalPages}`
    })
);

// ---------------------------------------------------------------------------------------------------------------------

