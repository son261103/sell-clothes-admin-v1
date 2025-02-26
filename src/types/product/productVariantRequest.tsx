// Product Variant Request interfaces
export interface ProductVariantCreateRequest {
    productId: number;
    size: string;
    color: string;
    sku?: string;
    stockQuantity: number;
    imageUrl?: string;
    status?: boolean;
}

export interface ProductVariantUpdateRequest {
    size?: string;
    color?: string;
    sku?: string;
    stockQuantity?: number;
    imageUrl?: string;
    status?: boolean;
}

export interface VariantDetail {
    size: string;
    color: string;
    stockQuantity: number;
    sku?: string;
}

export interface BulkProductVariantCreateRequest {
    productId: number;
    variants: VariantDetail[];
}

// Product Variant Filters interface
export interface ProductVariantFilters {
    productId?: number;
    size?: string;
    color?: string;
    sku?: string;
    minStock?: number;
    maxStock?: number;
    status?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// Product Variant Page Request interface
export interface ProductVariantPageRequest {
    page?: number;
    size?: number;
    sort?: string;
    filters?: ProductVariantFilters;
}