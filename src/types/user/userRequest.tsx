import {RoleResponse} from "../role/roleResponse.tsx";

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
    roles?: RoleResponse[];
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

// Trong types/index.ts hoặc types/user.ts

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordOtpRequest {
    loginId: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    otp: string;
}

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    avatar: string;
    status: string;
    createdAt: string;
    lastLoginAt: string;
    roles: string[];
    permissions: string[];
    address: string;
    dateOfBirth: string;
    gender: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
}