// Product Variant Response interfaces
import {ProductResponse} from "@/types";

export interface ProductVariantResponse {
    variantId: number;
    product: ProductResponse;
    size: string;
    color: string;
    sku: string;
    stockQuantity: number;
    imageUrl?: string;
    status: boolean;
}

export interface ProductVariantHierarchyResponse {
    variants: ProductVariantResponse[];
    productId: number;
    totalVariants: number;
    activeVariants: number;
    inactiveVariants: number;
    totalStock: number;
    stockBySize: Record<string, number>;
    stockByColor: Record<string, number>;
}

// Product Variant Page Response interface
export interface ProductVariantPageResponse {
    content: ProductVariantResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}