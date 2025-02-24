import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchAllProducts,
    fetchProductById,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    fetchProductHierarchy,
    fetchFeaturedProducts,
    fetchRelatedProducts,
    clearError,
    clearCurrentProduct
} from '../store/features/product/productSlice';
import {
    selectProductsPage,
    selectProductsList,
    selectCurrentProduct,
    selectProductHierarchy,
    selectError,
    selectFeaturedProducts,
    selectRelatedProducts,
    selectLatestProducts,
    selectSaleProducts,
    selectPageInfo,
    selectProductById,
    selectProductBySlug,
    selectProductsByCategory,
    selectProductsByBrand,
    selectActiveProducts,
    selectInactiveProducts,
    selectProductsOnSale,
    selectProductsByPriceRange,
    selectFilteredProducts,
    selectSortedProducts,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectProductStats,
    selectProductOperationStatus
} from '../store/features/product/productSelectors';
import type {
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
    ProductPageRequest,
    ProductFilters
} from '@/types';

// Main product management hook
export const useProducts = () => {
    const dispatch = useAppDispatch();
    const productsPage = useAppSelector(selectProductsPage);
    const productsList = useAppSelector(selectProductsList);
    const { isLoading, error } = useAppSelector(selectProductOperationStatus);
    const pageInfo = useAppSelector(selectPageInfo);
    const productStats = useAppSelector(selectProductStats);

    const handleFetchAllProducts = useCallback(async (
        pageRequest: ProductPageRequest = { page: 0, size: 10, sort: 'productId' },
        filters?: ProductFilters
    ) => {
        try {
            await dispatch(fetchAllProducts({ pageRequest, filters })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateProduct = useCallback(async (
        productData: ProductCreateRequest,
        thumbnailFile?: File
    ): Promise<ProductResponse | null> => {
        try {
            const result = await dispatch(createProduct({ productData, thumbnailFile })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateProduct = useCallback(async (
        id: number,
        productData: ProductUpdateRequest,
        thumbnailFile?: File
    ) => {
        try {
            await dispatch(updateProduct({ id, productData, thumbnailFile })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteProduct = useCallback(async (id: number) => {
        try {
            await dispatch(deleteProduct(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleProductStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleProductStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        productsPage,
        productsList,
        isLoading,
        error,
        pageInfo,
        productStats,
        fetchAllProducts: handleFetchAllProducts,
        createProduct: handleCreateProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        toggleProductStatus: handleToggleProductStatus
    };
};

// Hook for finding specific products
export const useProductFinder = (productId?: number, slug?: string) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectProductOperationStatus);
    const foundById = useAppSelector(productId ? (state => selectProductById(state, productId)) : () => null);
    const foundBySlug = useAppSelector(slug ? (state => selectProductBySlug(state, slug)) : () => null);

    const handleFetchProductById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchProductById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchProductBySlug = useCallback(async (slug: string) => {
        try {
            await dispatch(fetchProductBySlug(slug)).unwrap();
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
        fetchProductById: handleFetchProductById,
        fetchProductBySlug: handleFetchProductBySlug
    };
};

// Hook for product category and brand filtering
export const useProductFilters = (categoryId?: number, brandId?: number) => {
    const productsByCategory = useAppSelector(categoryId ? (state => selectProductsByCategory(state, categoryId)) : selectProductsList);
    const productsByBrand = useAppSelector(brandId ? (state => selectProductsByBrand(state, brandId)) : selectProductsList);
    const activeProducts = useAppSelector(selectActiveProducts);
    const inactiveProducts = useAppSelector(selectInactiveProducts);
    const productsOnSale = useAppSelector(selectProductsOnSale);

    return {
        productsByCategory,
        productsByBrand,
        activeProducts,
        inactiveProducts,
        productsOnSale
    };
};

// Hook for price range filtering
export const useProductPriceFilter = (minPrice?: number, maxPrice?: number) => {
    const productsByPriceRange = useAppSelector(
        (minPrice !== undefined && maxPrice !== undefined)
            ? (state => selectProductsByPriceRange(state, minPrice, maxPrice))
            : selectProductsList
    );

    return {
        productsByPriceRange
    };
};

// Hook for featured and related products
export const useProductFeatures = () => {
    const dispatch = useAppDispatch();
    const featuredProducts = useAppSelector(selectFeaturedProducts);
    const relatedProducts = useAppSelector(selectRelatedProducts);
    const latestProducts = useAppSelector(selectLatestProducts);
    const saleProducts = useAppSelector(selectSaleProducts);

    const handleFetchFeaturedProducts = useCallback(async (limit: number = 10) => {
        try {
            await dispatch(fetchFeaturedProducts(limit)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchRelatedProducts = useCallback(async (productId: number, limit: number = 4) => {
        try {
            await dispatch(fetchRelatedProducts({ productId, limit })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        featuredProducts,
        relatedProducts,
        latestProducts,
        saleProducts,
        fetchFeaturedProducts: handleFetchFeaturedProducts,
        fetchRelatedProducts: handleFetchRelatedProducts
    };
};

// Hook for product hierarchy
export const useProductHierarchy = () => {
    const dispatch = useAppDispatch();
    const productHierarchy = useAppSelector(selectProductHierarchy);
    const { isLoading, error } = useAppSelector(selectProductOperationStatus);

    const handleFetchHierarchy = useCallback(async () => {
        try {
            await dispatch(fetchProductHierarchy()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        productHierarchy,
        isLoading,
        error,
        fetchHierarchy: handleFetchHierarchy
    };
};

// Hook for advanced product filtering
export const useAdvancedProductFilters = (filters: ProductFilters = {}) => {
    const filteredProducts = useAppSelector(state => selectFilteredProducts(state, filters));
    const { isLoading, error } = useAppSelector(selectProductOperationStatus);

    return {
        filteredProducts,
        isLoading,
        error
    };
};

// Hook for sorted product lists
export const useSortedProducts = (sortBy?: keyof ProductResponse, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sortedProducts = useAppSelector(
        sortBy ? (state => selectSortedProducts(state, sortBy, sortOrder)) : selectProductsList
    );

    return {
        sortedProducts
    };
};

// Hook for current product management
export const useCurrentProduct = () => {
    const dispatch = useAppDispatch();
    const currentProduct = useAppSelector(selectCurrentProduct);
    const { isLoading, error } = useAppSelector(selectProductOperationStatus);

    const handleClearCurrentProduct = useCallback(() => {
        dispatch(clearCurrentProduct());
    }, [dispatch]);

    return {
        currentProduct,
        isLoading,
        error,
        clearCurrentProduct: handleClearCurrentProduct
    };
};

// Hook for pagination
export const useProductPagination = () => {
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
export const useProductError = () => {
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