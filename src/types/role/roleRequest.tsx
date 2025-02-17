export interface RoleCreateRequest {
    name: string;
    description: string;
    permissions: number[]; // Array of permission IDs
}

export interface RoleUpdateRequest {
    name?: string;
    description?: string;
}

