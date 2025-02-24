// Upload Image Request (FormData)
export interface ProductImageUploadRequest {
    files: File[];  // Will be converted to FormData
}

// Update Image File Request (FormData)
export interface ProductImageFileUpdateRequest {
    file: File;  // Will be converted to FormData
}

// Update Image Properties Request
export interface ProductImageUpdateRequest {
    imageUrl?: string;
    isPrimary?: boolean;
    displayOrder?: number;
}

// Reorder Images Request
export interface ProductImageReorderRequest {
    imageIds: number[];
}

// Bulk Image Create Request
export interface BulkProductImageCreateRequest {
    productId: number;
    images: {
        imageUrl: string;
        isPrimary: boolean;
        displayOrder: number;
    }[];
}
