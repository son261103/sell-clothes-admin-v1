import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchAllParentCategories,
    fetchAllActiveParentCategories,
    fetchParentCategoryById,
    createParentCategory,
    updateParentCategory,
    toggleParentCategoryStatus,
    deleteParentCategory,
    fetchCategoryHierarchy, fetchAllSubCategories,
    fetchSubCategoryById,
    createSubCategory, updateSubCategory,
    toggleSubCategoryStatus, deleteSubCategory
} from '../store/features/category/categorySlice';

import {
    selectCategoriesPage,
    selectCategoriesList,
    selectCurrentCategory,
    selectHierarchyData,
    selectError,
    selectCategoryOperationStatus,
    selectFilteredCategories,
    selectActiveCategories,
    selectInactiveCategories,
    selectCategoryById,
    selectCategoryBySlug,
    selectCategoriesCount,
    selectSortedCategories,
    selectPageInfo,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectIsCategoriesEmpty,
    selectHierarchyMetrics
} from '../store/features/category/categorySelector';

import type {
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
    CategoryPageRequest,
    CategoryFilters
} from '../types';

// Main category management hook
export const useCategories = () => {
    const dispatch = useAppDispatch();
    const categoriesPage = useAppSelector(selectCategoriesPage);
    const categoriesList = useAppSelector(selectCategoriesList);
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const pageInfo = useAppSelector(selectPageInfo);

    const handleFetchAllParentCategories = useCallback(async (
        pageRequest: CategoryPageRequest = { page: 0, size: 10, sort: 'categoryId' },
        filters: CategoryFilters = {}
    ) => {
        try {
            await dispatch(fetchAllParentCategories({ pageRequest, filters })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchActiveParentCategories = useCallback(async () => {
        try {
            await dispatch(fetchAllActiveParentCategories()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateParentCategory = useCallback(async (categoryData: CategoryCreateRequest) => {
        try {
            const result = await dispatch(createParentCategory(categoryData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateParentCategory = useCallback(async (
        id: number,
        categoryData: CategoryUpdateRequest
    ) => {
        try {
            await dispatch(updateParentCategory({ id, categoryData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleParentStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleParentCategoryStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteParentCategory = useCallback(async (id: number) => {
        try {
            await dispatch(deleteParentCategory(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        categoriesPage,
        categoriesList,
        isLoading,
        error,
        pageInfo,
        fetchAllParentCategories: handleFetchAllParentCategories,
        fetchActiveParentCategories: handleFetchActiveParentCategories,
        createParentCategory: handleCreateParentCategory,
        updateParentCategory: handleUpdateParentCategory,
        toggleParentStatus: handleToggleParentStatus,
        deleteParentCategory: handleDeleteParentCategory
    };
};

// Hook for category hierarchy management
export const useCategoryHierarchy = () => {
    const dispatch = useAppDispatch();
    const hierarchyData = useAppSelector(selectHierarchyData);
    const hierarchyMetrics = useAppSelector(selectHierarchyMetrics);
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);

    const handleFetchHierarchy = useCallback(async (id: number) => {
        try {
            await dispatch(fetchCategoryHierarchy(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        hierarchyData,
        hierarchyMetrics,
        isLoading,
        error,
        fetchHierarchy: handleFetchHierarchy
    };
};

// Hook for category finding
export const useCategoryFinder = (categoryId?: number, slug?: string) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const foundById = useAppSelector(categoryId ? (state => selectCategoryById(state, categoryId)) : () => null);
    const foundBySlug = useAppSelector(slug ? (state => selectCategoryBySlug(state, slug)) : () => null);

    const handleFetchCategoryById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchParentCategoryById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundById,
        foundBySlug,
        fetchCategoryById: handleFetchCategoryById
    };
};

// Hook for active/inactive categories
export const useCategoryStatus = () => {
    const activeCategories = useAppSelector(selectActiveCategories);
    const inactiveCategories = useAppSelector(selectInactiveCategories);
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);

    return {
        activeCategories,
        inactiveCategories,
        isLoading,
        error
    };
};

// Hook for category filtering
export const useCategoryFilters = (filters: CategoryFilters = {}) => {
    const filteredCategories = useAppSelector(state => selectFilteredCategories(state, filters));
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const isEmpty = useAppSelector(selectIsCategoriesEmpty);

    return {
        filteredCategories,
        isLoading,
        error,
        isEmpty
    };
};

// Hook for category statistics
export const useCategoryStats = () => {
    const totalCategories = useAppSelector(selectCategoriesCount);
    const hierarchyMetrics = useAppSelector(selectHierarchyMetrics);
    const isEmpty = useAppSelector(selectIsCategoriesEmpty);

    return {
        totalCategories,
        hierarchyMetrics,
        isEmpty
    };
};

// Hook for sorted categories
export const useSortedCategories = (
    sortBy?: keyof CategoryResponse,
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const sortedCategories = useAppSelector(
        sortBy ? (state => selectSortedCategories(state, sortBy, sortOrder)) : selectCategoriesList
    );

    return {
        sortedCategories
    };
};

// Hook for pagination
export const useCategoryPagination = () => {
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

// Hook for current category management
export const useCurrentCategory = () => {
    const dispatch = useAppDispatch();
    const currentCategory = useAppSelector(selectCurrentCategory);
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);

    const handleFetchCategoryById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchParentCategoryById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        currentCategory,
        isLoading,
        error,
        fetchCategoryById: handleFetchCategoryById
    };
};

// Hook for error handling
export const useCategoryError = () => {
    const error = useAppSelector(selectError);
    return {
        error
    };
};

// Main hook for SubCategory CRUD operations
export const useSubCategories = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const hierarchyData = useAppSelector(selectHierarchyData);
    const currentCategory = useAppSelector(selectCurrentCategory);

    const handleFetchAllSubCategories = useCallback(async (parentCategoryId: number) => {
        try {
            await dispatch(fetchAllSubCategories(parentCategoryId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchSubCategoryById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchSubCategoryById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateSubCategory = useCallback(async (
        parentCategoryId: number,
        categoryData: CategoryCreateRequest
    ) => {
        try {
            const result = await dispatch(createSubCategory({
                parentId: parentCategoryId,
                categoryData
            })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateSubCategory = useCallback(async (
        id: number,
        categoryData: CategoryUpdateRequest
    ) => {
        try {
            await dispatch(updateSubCategory({ id, categoryData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleSubCategoryStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleSubCategoryStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteSubCategory = useCallback(async (id: number) => {
        try {
            await dispatch(deleteSubCategory(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        subCategories: hierarchyData?.subCategories ?? [],
        currentSubCategory: currentCategory?.parentId ? currentCategory : null,
        isLoading,
        error,
        fetchAllSubCategories: handleFetchAllSubCategories,
        fetchSubCategoryById: handleFetchSubCategoryById,
        createSubCategory: handleCreateSubCategory,
        updateSubCategory: handleUpdateSubCategory,
        toggleSubCategoryStatus: handleToggleSubCategoryStatus,
        deleteSubCategory: handleDeleteSubCategory
    };
};

// Hook for managing a specific SubCategory
export const useSubCategory = (id?: number) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const currentCategory = useAppSelector(selectCurrentCategory);
    const hierarchyData = useAppSelector(selectHierarchyData);

    const subCategory = id && hierarchyData
        ? hierarchyData.subCategories.find(sub => sub.categoryId === id)
        : null;

    const handleFetchSubCategory = useCallback(async (categoryId: number) => {
        try {
            await dispatch(fetchSubCategoryById(categoryId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateSubCategory = useCallback(async (
        categoryId: number,
        categoryData: CategoryUpdateRequest
    ) => {
        try {
            await dispatch(updateSubCategory({ id: categoryId, categoryData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleStatus = useCallback(async (categoryId: number) => {
        try {
            await dispatch(toggleSubCategoryStatus(categoryId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteSubCategory = useCallback(async (categoryId: number) => {
        try {
            await dispatch(deleteSubCategory(categoryId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        subCategory,
        isLoading,
        error,
        isCurrentCategory: currentCategory?.categoryId === id,
        fetchSubCategory: handleFetchSubCategory,
        updateSubCategory: handleUpdateSubCategory,
        toggleStatus: handleToggleStatus,
        deleteSubCategory: handleDeleteSubCategory
    };
};

// Hook for SubCategory metrics
export const useSubCategoryMetrics = (parentId?: number) => {
    const hierarchyData = useAppSelector(selectHierarchyData);

    const metrics = parentId && hierarchyData?.parent.categoryId === parentId
        ? {
            total: hierarchyData.totalSubCategories,
            active: hierarchyData.activeSubCategories,
            inactive: hierarchyData.inactiveSubCategories,
            activePercentage: hierarchyData.totalSubCategories > 0
                ? Math.round((hierarchyData.activeSubCategories / hierarchyData.totalSubCategories) * 100)
                : 0
        }
        : null;

    return {
        metrics,
        hasMetrics: !!metrics,
        isEmpty: metrics?.total === 0
    };
};

// Hook for managing SubCategory batch operations
export const useSubCategoryBatchOperations = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectCategoryOperationStatus);
    const hierarchyData = useAppSelector(selectHierarchyData);

    const handleToggleMultipleStatus = useCallback(async (ids: number[]) => {
        try {
            const results = await Promise.all(
                ids.map(id => dispatch(toggleSubCategoryStatus(id)).unwrap())
            );
            return results.every(Boolean);
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteMultiple = useCallback(async (ids: number[]) => {
        try {
            const results = await Promise.all(
                ids.map(id => dispatch(deleteSubCategory(id)).unwrap())
            );
            return results.every(Boolean);
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        subCategories: hierarchyData?.subCategories ?? [],
        isLoading,
        error,
        toggleMultipleStatus: handleToggleMultipleStatus,
        deleteMultiple: handleDeleteMultiple
    };
};