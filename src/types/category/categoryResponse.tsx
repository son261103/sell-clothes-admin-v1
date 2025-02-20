export interface CategoryResponse {
    categoryId: number;
    name: string;
    parentId?: number;
    description?: string;
    slug: string;
    status: boolean;
}

export interface CategoryHierarchyResponse {
    parent: CategoryResponse;
    subCategories: CategoryResponse[];
    totalSubCategories: number;
    activeSubCategories: number;
    inactiveSubCategories: number;
}

export interface CategoryFilters {
    search?: string;
    status?: boolean;
    parentId?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// Example usage of pagination with categories
export interface CategoryPageRequest {
    page?: number;
    size?: number;
    sort?: string;
    filters?: CategoryFilters;
}

export interface CategoryPageResponse {
    content: CategoryResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}