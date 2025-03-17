

// order-item.types.ts
export interface OrderItemUpdateRequest {
    quantity?: number;
    price?: number;
    note?: string;
}

export interface BestsellingVariantDTO {
    variantId: number;
    productId: number;
    productName: string;
    size: string;
    color: string;
    quantitySold: number;
}

export interface BestsellingProductDTO {
    productId: number;
    productName: string;
    productImage?: string;
    totalQuantitySold: number;
}

export interface ProductSalesDataDTO {
    productId: number;
    totalQuantitySold: number;
    totalRevenue: number;
    variantSales: VariantSalesDTO[];
}

export interface VariantSalesDTO {
    variantId: number;
    size: string;
    color: string;
    quantitySold: number;
}