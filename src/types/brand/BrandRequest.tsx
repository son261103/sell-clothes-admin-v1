import {BrandResponse} from "@/types/brand/BrandResponse.tsx";

export interface BrandCreateRequest {
    name: string;
    logoUrl?: string;
    description?: string;
    status?: boolean;
}

// Brand Update Request interface
export interface BrandUpdateRequest {
    name?: string;
    logoUrl?: string;
    description?: string;
    status?: boolean;
}

// Brand Filters interface
export interface BrandFilters {
    search?: string;
    status?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// Brand Page Request interface
export interface BrandPageRequest {
    page?: number;
    size?: number;
    sort?: string;
    filters?: BrandFilters;
}

// Brand Logo Update Request interface
export interface BrandLogoUpdateRequest {
    logo: File;
    oldUrl: string;
}

// Brand Page Response interface
export interface BrandPageResponse {
    content: BrandResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}