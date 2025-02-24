import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
    ProductImageResponse,
    ProductImageHierarchyResponse,
    ProductImageUploadRequest,
    ProductImageUpdateRequest,
    ProductImageReorderRequest,
} from '@/types';
import ProductImageService from '../../../services/productImageService';

interface ProductImageState {
    images: ProductImageResponse[];
    imageHierarchy: ProductImageHierarchyResponse | null;
    currentImage: ProductImageResponse | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductImageState = {
    images: [],
    imageHierarchy: null,
    currentImage: null,
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
export const fetchProductImages = createAsyncThunk(
    'productImage/fetchAll',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.getProductImages(productId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch product images');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const uploadProductImages = createAsyncThunk(
    'productImage/upload',
    async ({ productId, request }: { productId: number; request: ProductImageUploadRequest }, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.uploadImages(productId, request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to upload images');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateProductImage = createAsyncThunk(
    'productImage/update',
    async ({ imageId, updateData }: { imageId: number; updateData: ProductImageUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.updateImage(imageId, updateData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update image');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateProductImageFile = createAsyncThunk(
    'productImage/updateFile',
    async ({ imageId, file }: { imageId: number; file: File }, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.updateImageFile(imageId, { file });
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update image file');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteProductImage = createAsyncThunk(
    'productImage/delete',
    async (imageId: number, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.deleteImage(imageId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete image');
            }
            return imageId;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const reorderProductImages = createAsyncThunk(
    'productImage/reorder',
    async ({ productId, request }: { productId: number; request: ProductImageReorderRequest }, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.reorderImages(productId, request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to reorder images');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchImageHierarchy = createAsyncThunk(
    'productImage/fetchHierarchy',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await ProductImageService.getImageHierarchy(productId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch image hierarchy');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const productImageSlice = createSlice({
    name: 'productImage',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentImage: (state) => {
            state.currentImage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Product Images
            .addCase(fetchProductImages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductImages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = action.payload;
                state.error = null;
            })
            .addCase(fetchProductImages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Upload Images
            .addCase(uploadProductImages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(uploadProductImages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = [...state.images, ...action.payload.images];
                state.error = null;
            })
            .addCase(uploadProductImages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Image
            .addCase(updateProductImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProductImage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = state.images.map(image =>
                    image.imageId === action.payload.imageId ? action.payload : image
                );
                if (state.currentImage?.imageId === action.payload.imageId) {
                    state.currentImage = action.payload;
                }
                state.error = null;
            })
            .addCase(updateProductImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Image File
            .addCase(updateProductImageFile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProductImageFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = state.images.map(image =>
                    image.imageId === action.payload.imageId ? action.payload : image
                );
                if (state.currentImage?.imageId === action.payload.imageId) {
                    state.currentImage = action.payload;
                }
                state.error = null;
            })
            .addCase(updateProductImageFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Image
            .addCase(deleteProductImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProductImage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = state.images.filter(image => image.imageId !== action.payload);
                if (state.currentImage?.imageId === action.payload) {
                    state.currentImage = null;
                }
                state.error = null;
            })
            .addCase(deleteProductImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Reorder Images
            .addCase(reorderProductImages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reorderProductImages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.images = action.payload;
                state.error = null;
            })
            .addCase(reorderProductImages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Image Hierarchy
            .addCase(fetchImageHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchImageHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.imageHierarchy = action.payload;
                state.error = null;
            })
            .addCase(fetchImageHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentImage
} = productImageSlice.actions;

export default productImageSlice.reducer;