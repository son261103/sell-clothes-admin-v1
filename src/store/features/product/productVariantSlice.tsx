import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductVariantService from '../../../services/productVariantService';
import type {
    ProductVariantResponse,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest,
    ProductVariantPageResponse,
    ProductVariantPageRequest,
    ProductVariantHierarchyResponse,
    ProductVariantFilters,
    BulkProductVariantCreateRequest
} from '@/types';

interface ProductVariantState {
    variants: ProductVariantPageResponse; // Danh sách phân trang
    variantsByProduct: ProductVariantResponse[]; // Danh sách biến thể theo productId
    currentVariant: ProductVariantResponse | null;
    variantHierarchy: ProductVariantHierarchyResponse | null;
    lowStockVariants: ProductVariantResponse[];
    outOfStockVariants: ProductVariantResponse[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductVariantState = {
    variants: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    variantsByProduct: [], // Khởi tạo rỗng
    currentVariant: null,
    variantHierarchy: null,
    lowStockVariants: [],
    outOfStockVariants: [],
    isLoading: false,
    error: null
};

const handleError = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
    return 'An unexpected error occurred';
};

export const fetchVariantsByProductId = createAsyncThunk(
    'variant/fetchByProductId',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getVariantsByProductId(productId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch variants by product ID');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Các thunk khác giữ nguyên
export const getFilteredVariants = createAsyncThunk(
    'variant/getFiltered',
    async ({ pageRequest, filters }: { pageRequest: ProductVariantPageRequest; filters?: ProductVariantFilters }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getFilteredVariants(pageRequest, filters);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch variants');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchVariantById = createAsyncThunk(
    'variant/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getVariantById(id);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch variant');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchVariantBySku = createAsyncThunk(
    'variant/fetchBySku',
    async (sku: string, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getVariantBySku(sku);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch variant by SKU');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchActiveVariantsByProductId = createAsyncThunk(
    'variant/fetchActiveByProductId',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getActiveVariantsByProductId(productId);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch active variants');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createVariant = createAsyncThunk(
    'variant/create',
    async ({ variantData, imageFile }: { variantData: ProductVariantCreateRequest; imageFile?: File }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.createVariant(variantData, imageFile);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to create variant');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const bulkCreateVariants = createAsyncThunk(
    'variant/bulkCreate',
    async ({ bulkData, colorImages }: { bulkData: BulkProductVariantCreateRequest; colorImages: Record<string, File> }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.bulkCreateVariants(bulkData, colorImages);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to create variants');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateVariant = createAsyncThunk(
    'variant/update',
    async ({ id, variantData, imageFile }: { id: number; variantData: ProductVariantUpdateRequest; imageFile?: File }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.updateVariant(id, variantData, imageFile);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to update variant');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteVariant = createAsyncThunk(
    'variant/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.deleteVariant(id);
            if (!response.success) return rejectWithValue(response.message || 'Failed to delete variant');
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const toggleVariantStatus = createAsyncThunk(
    'variant/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.toggleVariantStatus(id);
            if (!response.success) return rejectWithValue(response.message || 'Failed to toggle variant status');
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchVariantHierarchy = createAsyncThunk(
    'variant/fetchHierarchy',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getVariantHierarchy(productId);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch variant hierarchy');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchLowStockVariants = createAsyncThunk(
    'variant/fetchLowStock',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getLowStockVariants();
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch low stock variants');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchOutOfStockVariants = createAsyncThunk(
    'variant/fetchOutOfStock',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getOutOfStockVariants();
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to fetch out of stock variants');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateStockQuantity = createAsyncThunk(
    'variant/updateStock',
    async ({ id, quantity }: { id: number; quantity: number }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.updateStockQuantity(id, quantity);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to update stock quantity');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const checkVariantAvailability = createAsyncThunk(
    'variant/checkAvailability',
    async ({ productId, size, color }: { productId: number; size: string; color: string }, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.checkVariantAvailability(productId, size, color);
            if (!response.success) return rejectWithValue(response.message || 'Failed to check variant availability');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getAvailableSizes = createAsyncThunk(
    'variant/getAvailableSizes',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getAvailableSizes(productId);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to get available sizes');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getAvailableColors = createAsyncThunk(
    'variant/getAvailableColors',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductVariantService.getAvailableColors(productId);
            if (!response.success || !response.data) return rejectWithValue(response.message || 'Failed to get available colors');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const productVariantSlice = createSlice({
    name: 'productVariant',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentVariant: (state) => {
            state.currentVariant = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVariantsByProductId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVariantsByProductId.fulfilled, (state, action) => {
                console.log('fetchVariantsByProductId fulfilled with data:', action.payload); // Thêm log
                state.isLoading = false;
                state.variantsByProduct = action.payload; // Lưu dữ liệu vào variantsByProduct
                state.error = null;
            })
            .addCase(fetchVariantsByProductId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Các case khác giữ nguyên
            .addCase(getFilteredVariants.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getFilteredVariants.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variants = action.payload;
                state.error = null;
            })
            .addCase(getFilteredVariants.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchVariantById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVariantById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentVariant = action.payload;
                state.error = null;
            })
            .addCase(fetchVariantById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchVariantBySku.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVariantBySku.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentVariant = action.payload;
                state.error = null;
            })
            .addCase(fetchVariantBySku.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createVariant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createVariant.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.variants.number === 0) {
                    state.variants.content = [action.payload, ...state.variants.content];
                    if (state.variants.content.length > state.variants.size) state.variants.content.pop();
                }
                state.variants.totalElements += 1;
                state.variants.totalPages = Math.ceil(state.variants.totalElements / state.variants.size);
                state.variants.empty = state.variants.content.length === 0;
                state.currentVariant = action.payload;
                state.variantsByProduct.push(action.payload); // Cập nhật variantsByProduct
                state.error = null;
            })
            .addCase(createVariant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateVariant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateVariant.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variants.content = state.variants.content.map(variant =>
                    variant.variantId === action.payload.variantId ? action.payload : variant
                );
                state.variantsByProduct = state.variantsByProduct.map(variant =>
                    variant.variantId === action.payload.variantId ? action.payload : variant
                );
                if (state.currentVariant?.variantId === action.payload.variantId) {
                    state.currentVariant = action.payload;
                }
                state.error = null;
            })
            .addCase(updateVariant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteVariant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVariant.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variants.content = state.variants.content.filter(
                    variant => variant.variantId !== action.payload
                );
                state.variantsByProduct = state.variantsByProduct.filter(
                    variant => variant.variantId !== action.payload
                );
                state.variants.totalElements -= 1;
                state.variants.totalPages = Math.ceil(state.variants.totalElements / state.variants.size);
                state.variants.empty = state.variants.content.length === 0;
                if (state.currentVariant?.variantId === action.payload) state.currentVariant = null;
                state.error = null;
            })
            .addCase(deleteVariant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(toggleVariantStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleVariantStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variants.content = state.variants.content.map(variant =>
                    variant.variantId === action.payload ? { ...variant, status: !variant.status } : variant
                );
                state.variantsByProduct = state.variantsByProduct.map(variant =>
                    variant.variantId === action.payload ? { ...variant, status: !variant.status } : variant
                );
                if (state.currentVariant?.variantId === action.payload) {
                    state.currentVariant = { ...state.currentVariant, status: !state.currentVariant.status };
                }
                state.error = null;
            })
            .addCase(toggleVariantStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchVariantHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVariantHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variantHierarchy = action.payload;
                state.error = null;
            })
            .addCase(fetchVariantHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchLowStockVariants.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLowStockVariants.fulfilled, (state, action) => {
                state.isLoading = false;
                state.lowStockVariants = action.payload;
                state.error = null;
            })
            .addCase(fetchLowStockVariants.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOutOfStockVariants.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOutOfStockVariants.fulfilled, (state, action) => {
                state.isLoading = false;
                state.outOfStockVariants = action.payload;
                state.error = null;
            })
            .addCase(fetchOutOfStockVariants.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateStockQuantity.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateStockQuantity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.variants.content = state.variants.content.map(variant =>
                    variant.variantId === action.payload.variantId ? action.payload : variant
                );
                state.variantsByProduct = state.variantsByProduct.map(variant =>
                    variant.variantId === action.payload.variantId ? action.payload : variant
                );
                if (state.currentVariant?.variantId === action.payload.variantId) state.currentVariant = action.payload;
                state.lowStockVariants = state.lowStockVariants.map(variant =>
                    variant.variantId === action.payload.variantId ? action.payload : variant
                );
                state.outOfStockVariants = state.outOfStockVariants.filter(
                    variant => variant.variantId !== action.payload.variantId
                );
                state.error = null;
            })
            .addCase(updateStockQuantity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(checkVariantAvailability.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkVariantAvailability.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(checkVariantAvailability.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(getAvailableSizes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAvailableSizes.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getAvailableSizes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(getAvailableColors.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAvailableColors.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getAvailableColors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearError, clearCurrentVariant } = productVariantSlice.actions;

export default productVariantSlice.reducer;