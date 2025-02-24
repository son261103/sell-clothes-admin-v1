import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../../services/productService';
import type {
    ProductResponse,
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductPageResponse,
    ProductPageRequest,
    ProductHierarchyResponse,
    ProductFilters
} from '../../../types';

interface ProductState {
    products: ProductPageResponse;
    currentProduct: ProductResponse | null;
    productHierarchy: ProductHierarchyResponse | null;
    featuredProducts: ProductResponse[];
    relatedProducts: ProductResponse[];
    latestProducts: ProductResponse[];
    saleProducts: ProductResponse[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentProduct: null,
    productHierarchy: null,
    featuredProducts: [],
    relatedProducts: [],
    latestProducts: [],
    saleProducts: [],
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

// Async thunk actions
export const fetchAllProducts = createAsyncThunk(
    'product/fetchAll',
    async ({ pageRequest, filters }: { pageRequest: ProductPageRequest; filters?: ProductFilters }, { rejectWithValue }) => {
        try {
            const response = await ProductService.getAllProducts(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductService.getProductById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch product');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchProductBySlug = createAsyncThunk(
    'product/fetchBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await ProductService.getProductBySlug(slug);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch product');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createProduct = createAsyncThunk(
    'product/create',
    async ({ productData, thumbnailFile }: { productData: ProductCreateRequest; thumbnailFile?: File }, { rejectWithValue }) => {
        try {
            const response = await ProductService.createProduct(productData, thumbnailFile);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create product');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/update',
    async ({ id, productData, thumbnailFile }: { id: number; productData: ProductUpdateRequest; thumbnailFile?: File }, { rejectWithValue }) => {
        try {
            const response = await ProductService.updateProduct(id, productData, thumbnailFile);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update product');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductService.deleteProduct(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete product');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const toggleProductStatus = createAsyncThunk(
    'product/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductService.toggleProductStatus(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to toggle product status');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchProductHierarchy = createAsyncThunk(
    'product/fetchHierarchy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ProductService.getProductHierarchy();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch product hierarchy');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'product/fetchFeatured',
    async (limit: number = 10, { rejectWithValue }) => {
        try {
            const response = await ProductService.getFeaturedProducts(limit);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch featured products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchRelatedProducts = createAsyncThunk(
    'product/fetchRelated',
    async ({ productId, limit = 4 }: { productId: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await ProductService.getRelatedProducts(productId, limit);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch related products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Products
            .addCase(fetchAllProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload;
                state.error = null;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Product By ID
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload;
                state.error = null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.products.number === 0) {
                    state.products.content = [action.payload, ...state.products.content];
                    if (state.products.content.length > state.products.size) {
                        state.products.content.pop();
                    }
                }
                state.products.totalElements += 1;
                state.products.totalPages = Math.ceil(state.products.totalElements / state.products.size);
                state.products.empty = state.products.content.length === 0;
                state.error = null;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products.content = state.products.content.map(product =>
                    product.productId === action.payload.productId ? action.payload : product
                );
                if (state.currentProduct?.productId === action.payload.productId) {
                    state.currentProduct = action.payload;
                }
                state.error = null;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products.content = state.products.content.filter(
                    product => product.productId !== action.payload
                );
                state.products.totalElements -= 1;
                state.products.totalPages = Math.ceil(state.products.totalElements / state.products.size);
                state.products.empty = state.products.content.length === 0;
                if (state.currentProduct?.productId === action.payload) {
                    state.currentProduct = null;
                }
                state.error = null;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Toggle Product Status
            .addCase(toggleProductStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleProductStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products.content = state.products.content.map(product =>
                    product.productId === action.payload
                        ? { ...product, status: !product.status }
                        : product
                );
                if (state.currentProduct?.productId === action.payload) {
                    state.currentProduct = {
                        ...state.currentProduct,
                        status: !state.currentProduct.status
                    };
                }
                state.error = null;
            })
            .addCase(toggleProductStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Product Hierarchy
            .addCase(fetchProductHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.productHierarchy = action.payload;
                state.error = null;
            })
            .addCase(fetchProductHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Featured Products
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.featuredProducts = action.payload;
                state.error = null;
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Related Products
            .addCase(fetchRelatedProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.relatedProducts = action.payload;
                state.error = null;
            })
            .addCase(fetchRelatedProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentProduct
} = productSlice.actions;

export default productSlice.reducer;