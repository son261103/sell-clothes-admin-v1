export interface BrandResponse {
    brandId: number;
    name: string;
    logoUrl: string;
    description: string;
    status: boolean;
}

// Brand Hierarchy Response interface
export interface BrandHierarchyResponse {
    brands: BrandResponse[];
    totalBrands: number;
    activeBrands: number;
    inactiveBrands: number;
}