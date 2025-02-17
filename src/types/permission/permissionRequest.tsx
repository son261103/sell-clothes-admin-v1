export interface PermissionCreateRequest {
    name: string;
    codeName: string;
    description: string;
    groupName: string;
}

export interface PermissionUpdateRequest {
    name?: string;
    codeName?: string;
    description?: string;
    groupName?: string;
}

export interface PermissionFilters {
    search?: string;
    groupName?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}