import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchProductImages,
    uploadProductImages,
    updateProductImage,
    updateProductImageFile,
    deleteProductImage,
    reorderProductImages,
    fetchImageHierarchy,
    clearError,
    clearCurrentImage
} from '../store/features/product/productImageSlice';
import {
    selectAllImages,
    selectCurrentImage,
    selectImageHierarchy,
    selectError,
    selectPrimaryImages,
    selectNonPrimaryImages,
    selectOrderedImages,
    selectImageById,
    selectImageStats,
    selectImageOperationStatus,
    selectTotalImageCount,
    selectDisplayOrderRange,
    selectImagesByProductId
} from '../store/features/product/productImageSelectors';
import type {
    ProductImageUpdateRequest,
    ProductImageReorderRequest,
    ProductImageUploadRequest,
} from '@/types';

// Main image management hook
export const useProductImages = (productId?: number) => {
    const dispatch = useAppDispatch();
    const images = useAppSelector(productId ?
        (state) => selectImagesByProductId(state, productId) :
        selectAllImages
    );
    const { isLoading, error } = useAppSelector(selectImageOperationStatus);
    const imageStats = useAppSelector(selectImageStats);

    const handleFetchImages = useCallback(async (productId: number) => {
        try {
            await dispatch(fetchProductImages(productId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUploadImages = useCallback(async (
        productId: number,
        request: ProductImageUploadRequest
    ) => {
        try {
            await dispatch(uploadProductImages({ productId, request })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateImage = useCallback(async (
        imageId: number,
        updateData: ProductImageUpdateRequest
    ) => {
        try {
            await dispatch(updateProductImage({ imageId, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateImageFile = useCallback(async (
        imageId: number,
        file: File
    ) => {
        try {
            await dispatch(updateProductImageFile({ imageId, file })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteImage = useCallback(async (imageId: number) => {
        try {
            await dispatch(deleteProductImage(imageId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        images,
        isLoading,
        error,
        imageStats,
        fetchImages: handleFetchImages,
        uploadImages: handleUploadImages,
        updateImage: handleUpdateImage,
        updateImageFile: handleUpdateImageFile,
        deleteImage: handleDeleteImage
    };
};

// Hook for image ordering
export const useImageOrder = (productId: number) => {
    const dispatch = useAppDispatch();
    const orderedImages = useAppSelector(selectOrderedImages);
    const displayOrderRange = useAppSelector(selectDisplayOrderRange);
    const { isLoading, error } = useAppSelector(selectImageOperationStatus);

    const handleReorderImages = useCallback(async (request: ProductImageReorderRequest) => {
        try {
            await dispatch(reorderProductImages({ productId, request })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch, productId]);

    return {
        orderedImages,
        displayOrderRange,
        isLoading,
        error,
        reorderImages: handleReorderImages
    };
};

// Hook for primary/non-primary image management
export const useImageTypes = () => {
    const primaryImages = useAppSelector(selectPrimaryImages);
    const nonPrimaryImages = useAppSelector(selectNonPrimaryImages);
    const totalImageCount = useAppSelector(selectTotalImageCount);

    return {
        primaryImages,
        nonPrimaryImages,
        totalImageCount
    };
};

// Hook for individual image management
export const useImage = (imageId: number) => {
    const image = useAppSelector((state) => selectImageById(state, imageId));
    const { isLoading, error } = useAppSelector(selectImageOperationStatus);

    return {
        image,
        isLoading,
        error
    };
};

// Hook for image hierarchy
export const useImageHierarchy = () => {
    const dispatch = useAppDispatch();
    const imageHierarchy = useAppSelector(selectImageHierarchy);
    const { isLoading, error } = useAppSelector(selectImageOperationStatus);

    const handleFetchHierarchy = useCallback(async (productId: number) => {
        try {
            await dispatch(fetchImageHierarchy(productId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        imageHierarchy,
        isLoading,
        error,
        fetchHierarchy: handleFetchHierarchy
    };
};

// Hook for current image management
export const useCurrentImage = () => {
    const dispatch = useAppDispatch();
    const currentImage = useAppSelector(selectCurrentImage);
    const { isLoading, error } = useAppSelector(selectImageOperationStatus);

    const handleClearCurrentImage = useCallback(() => {
        dispatch(clearCurrentImage());
    }, [dispatch]);

    return {
        currentImage,
        isLoading,
        error,
        clearCurrentImage: handleClearCurrentImage
    };
};

// Hook for error handling
export const useImageError = () => {
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