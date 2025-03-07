// User address related interfaces
export interface AddressRequestDTO {
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber: string;
    isDefault?: boolean;
}

export interface UpdateAddressDTO {
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber: string;
    isDefault?: boolean;
}

export interface AddressResponseDTO {
    addressId: number;
    userId: number;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    phoneNumber: string;
    isDefault: boolean;
    fullAddress: string;
}

// Types for address validation
export interface AddressValidationResponse {
    success: boolean;
    message: string;
}

// Types for address count
export interface AddressCountResponse {
    count: number;
}