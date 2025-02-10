import {RoleResponse, UserStatus} from "./userRequest.tsx";

export interface UserResponse {
    userId: number;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    lastLoginAt?: string;
    fullName: string;
    status: UserStatus;
    roles: RoleResponse[];
}

export interface UserCheckResponse {
    success: boolean;
    message: string;
}

export interface UserLoginUpdateResponse {
    success: boolean;
    message: string;
}

// Form Data Interfaces for File Upload
export interface UserCreateFormData {
    user: string;
    avatar?: File;
}

export interface UserUpdateFormData {
    user: string;
    avatar?: File;
}