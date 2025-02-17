import {PermissionResponse} from "../permission/permissionResponse.tsx";

export interface RoleResponse {
    roleId: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    permissions: PermissionResponse[];
}

export interface RoleFilters {
    searchTerm?: string;       // Using searchTerm consistently instead of search
    isActive?: boolean;        // For filtering active status
    sortBy?: keyof RoleResponse;
    sortDirection?: 'asc' | 'desc';
}