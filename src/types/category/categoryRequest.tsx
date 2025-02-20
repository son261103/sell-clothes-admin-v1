export interface CategoryCreateRequest {
    name?: string;
    description?: string;
    slug?: string;
    status?: boolean;
    parentId?: number;
}

export interface CategoryUpdateRequest {
    name?: string;
    description?: string;
    slug?: string;
    status?: boolean;
    parentId?: number;
}

export interface SubCategoryUpdateRequest{
    name?: string;
    description?: string;
    slug?: string;
    status?: boolean;
    parentId?: number;
}