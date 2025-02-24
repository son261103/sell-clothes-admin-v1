// Product Create Request interface
export interface ProductCreateRequest {
    categoryId: number;
    brandId: number;
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    thumbnail?: string;
    slug?: string;
    status?: boolean;
}

// Product Update Request interface
export interface ProductUpdateRequest {
    categoryId?: number;
    brandId?: number;
    name?: string;
    description?: string;
    price?: number;
    salePrice?: number;
    thumbnail?: string;
    slug?: string;
    status?: boolean;
}

// Product Filters interface
export interface ProductFilters {
    search?: string;
    categoryId?: number;
    brandId?: number;
    status?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    productId?: number;
}

// Product Page Request interface
export interface ProductPageRequest {
    page?: number;
    size?: number;
    sort?: string;
    filters?: ProductFilters;
}