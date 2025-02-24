// Single Image Response
export interface ProductImageResponse {
    imageId: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
}

// Image Hierarchy Response
export interface ProductImageHierarchyResponse {
    images: ProductImageResponse[];
    productId: number;
    totalImages: number;
    primaryImages: number;
    nonPrimaryImages: number;
}

// Image Upload Response
export interface ProductImageUploadResponse {
    images: ProductImageResponse[];
}