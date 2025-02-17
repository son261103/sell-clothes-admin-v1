export type UserStatus = 'ACTIVE' | 'LOCKED' | 'BANNER' | 'PENDING';

export interface UserFilters {
    search?: string;
    status?: UserStatus;
    role?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
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

export interface UserData {
    userId?: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    password?: string;
    status?: UserStatus;
}