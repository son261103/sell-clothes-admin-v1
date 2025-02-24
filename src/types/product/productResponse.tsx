// Product Response interface
export interface ProductResponse {
    productId: number;
    category: {
        categoryId: number;
        name: string;
        description?: string;
        status: boolean;
    };
    brand: {
        brandId: number;
        name: string;
        logoUrl?: string;
        description?: string;
        status: boolean;
    };
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    thumbnail?: string;
    slug: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

// Product Page Response interface
export interface ProductPageResponse {
    content: ProductResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Product Hierarchy Response interface
export interface ProductHierarchyResponse {
    products: ProductResponse[];
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
}