import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BrandService from '../../../services/brandService';
import type {
    BrandResponse,
    BrandCreateRequest,
    BrandUpdateRequest,
    ErrorResponse,
    PageResponse,
    BrandPageRequest,
    BrandFilters,
    BrandHierarchyResponse
} from '@/types';

interface BrandState {
    brands: PageResponse<BrandResponse>;
    currentBrand: BrandResponse | null;
    hierarchy: BrandHierarchyResponse | null;
    isLoading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: BrandState = {
    brands: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentBrand: null,
    hierarchy: null,
    isLoading: false,
    error: null,
    message: null
};

const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as ErrorResponse).message);
    }
    return 'An unexpected error occurred';
};

// Async thunks
export const fetchAllBrands = createAsyncThunk(
    'brand/fetchAll',
    async ({
               pageRequest,
               filters
           }: {
        pageRequest: BrandPageRequest;
        filters?: BrandFilters;
    }, { rejectWithValue }) => {
        try {
            const response = await BrandService.getAllBrands(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch brands');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchActiveBrands = createAsyncThunk(
    'brand/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BrandService.getActiveBrands();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch active brands');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchBrandById = createAsyncThunk(
    'brand/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await BrandService.getBrandById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch brand');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createBrand = createAsyncThunk(
    'brand/create',
    async ({ brandData, logoFile }: { brandData: BrandCreateRequest; logoFile?: File }, { rejectWithValue }) => {
        try {
            const response = await BrandService.createBrand(brandData, logoFile);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create brand');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateBrand = createAsyncThunk(
    'brand/update',
    async ({
               id,
               brandData,
               logoFile
           }: {
        id: number;
        brandData: BrandUpdateRequest;
        logoFile?: File;
    }, { rejectWithValue }) => {
        try {
            const response = await BrandService.updateBrand(id, brandData, logoFile);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update brand');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteBrand = createAsyncThunk(
    'brand/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await BrandService.deleteBrand(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete brand');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchBrandHierarchy = createAsyncThunk(
    'brand/fetchHierarchy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BrandService.getBrandHierarchy();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch brand hierarchy');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const toggleBrandStatus = createAsyncThunk(
    'brand/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await BrandService.toggleBrandStatus(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to toggle brand status');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const brandSlice = createSlice({
    name: 'brand',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = null;
        },
        clearCurrentBrand: (state) => {
            state.currentBrand = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Brands
            .addCase(fetchAllBrands.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllBrands.fulfilled, (state, action) => {
                state.isLoading = false;
                state.brands = action.payload;
                state.error = null;
            })
            .addCase(fetchAllBrands.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Active Brands
            .addCase(fetchActiveBrands.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveBrands.fulfilled, (state, action) => {
                state.isLoading = false;
                state.brands.content = action.payload;
                state.error = null;
            })
            .addCase(fetchActiveBrands.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Brand By ID
            .addCase(fetchBrandById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBrandById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentBrand = action.payload;
                state.error = null;
            })
            .addCase(fetchBrandById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Brand
            .addCase(createBrand.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.brands.number === 0) {
                    state.brands.content = [action.payload, ...state.brands.content];
                    if (state.brands.content.length > state.brands.size) {
                        state.brands.content.pop();
                    }
                }
                state.brands.totalElements += 1;
                state.brands.totalPages = Math.ceil(state.brands.totalElements / state.brands.size);
                state.brands.empty = state.brands.content.length === 0;
                state.error = null;
            })
            .addCase(createBrand.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Brand
            .addCase(updateBrand.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.isLoading = false;
                state.brands.content = state.brands.content.map(brand =>
                    brand.brandId === action.payload.brandId ? action.payload : brand
                );
                if (state.currentBrand?.brandId === action.payload.brandId) {
                    state.currentBrand = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBrand.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Brand
            .addCase(deleteBrand.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.isLoading = false;
                state.brands.content = state.brands.content.filter(
                    brand => brand.brandId !== action.payload
                );
                state.brands.totalElements -= 1;
                state.brands.totalPages = Math.ceil(state.brands.totalElements / state.brands.size);
                state.brands.empty = state.brands.content.length === 0;
                if (state.currentBrand?.brandId === action.payload) {
                    state.currentBrand = null;
                }
                state.error = null;
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Brand Hierarchy
            .addCase(fetchBrandHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBrandHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hierarchy = action.payload;
                state.error = null;
            })
            .addCase(fetchBrandHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Toggle Brand Status
            .addCase(toggleBrandStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleBrandStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const brandToUpdate = state.brands.content.find(brand => brand.brandId === action.payload);
                if (brandToUpdate) {
                    brandToUpdate.status = !brandToUpdate.status;
                }
                if (state.currentBrand?.brandId === action.payload) {
                    state.currentBrand.status = !state.currentBrand.status;
                }
                state.error = null;
            })
            .addCase(toggleBrandStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearMessage,
    clearCurrentBrand
} = brandSlice.actions;

export default brandSlice.reducer;
