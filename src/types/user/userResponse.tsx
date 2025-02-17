import { UserStatus} from "./userRequest.tsx";
import {RoleResponse} from "../role/roleResponse.tsx";

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