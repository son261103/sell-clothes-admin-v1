import {createSelector} from 'reselect';
import type {RootState} from '../../store';


// Basic selectors
export const selectProductImageState = (state: RootState) => state.productImage;

export const selectAllImages = createSelector(
    selectProductImageState,
    (state) => state.images
);

export const selectCurrentImage = createSelector(
    selectProductImageState,
    (state) => state.currentImage
);

export const selectImageHierarchy = createSelector(
    selectProductImageState,
    (state) => state.imageHierarchy
);

export const selectIsLoading = createSelector(
    selectProductImageState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectProductImageState,
    (state) => state.error
);

// Image status and type selectors
export const selectPrimaryImages = createSelector(
    selectAllImages,
    (images) => images.filter(image => image.isPrimary)
);

export const selectNonPrimaryImages = createSelector(
    selectAllImages,
    (images) => images.filter(image => !image.isPrimary)
);

// Order-based selectors
export const selectOrderedImages = createSelector(
    selectAllImages,
    (images) => [...images].sort((a, b) => a.displayOrder - b.displayOrder)
);

// Individual image selectors
export const selectImageById = createSelector(
    [selectAllImages, (_, imageId: number) => imageId],
    (images, imageId) => images.find(image => image.imageId === imageId) || null
);

// Image hierarchy statistics
export const selectImageStats = createSelector(
    selectImageHierarchy,
    (hierarchy): {
        totalImages: number;
        primaryImages: number;
        nonPrimaryImages: number;
    } | null => hierarchy ? {
        totalImages: hierarchy.totalImages,
        primaryImages: hierarchy.primaryImages,
        nonPrimaryImages: hierarchy.nonPrimaryImages
    } : null
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

export const selectImageOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Image count selectors
export const selectTotalImageCount = createSelector(
    selectAllImages,
    (images) => images.length
);

// Display order range selectors
export const selectDisplayOrderRange = createSelector(
    selectAllImages,
    (images): { min: number; max: number } => {
        if (images.length === 0) {
            return {min: 0, max: 0};
        }
        const orders = images.map(img => img.displayOrder);
        return {
            min: Math.min(...orders),
            max: Math.max(...orders)
        };
    }
);

// Product-specific image selectors
export const selectImagesByProductId = createSelector(
    [selectImageHierarchy, (_, productId: number) => productId],
    (hierarchy, productId) =>
        hierarchy && hierarchy.productId === productId ? hierarchy.images : []
);