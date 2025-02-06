export type UserStatus = 'ACTIVE' | 'LOCKED' | 'BANNER' | 'PENDING';

export interface RoleResponse {
    roleId: number;
    name: string;
    description?: string;
}

export interface UserCreateRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    status?: UserStatus;
}

export interface UserUpdateRequest {
    username?: string;
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    avatar?: string;
    status?: UserStatus;
}

export interface UserStatusUpdateRequest {
    status: string;
}