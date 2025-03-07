// payment.types.ts

// Payment Status Enum
export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED'
}

// Payment Method Type Enum
export enum PaymentMethodType {
    CREDIT_CARD = 'CREDIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    E_WALLET = 'E_WALLET',
    COD = 'COD',
    PAYPAL = 'PAYPAL',
    MOMO = 'MOMO',
    ZALOPAY = 'ZALOPAY',
    VNPAY = 'VNPAY'
}

// Payment Create Request
export interface PaymentCreateDTO {
    orderId: number;
    methodId: number;
    amount: number;
    bankCode?: string;
    returnUrl?: string;
}

// Payment Update Request
export interface PaymentUpdateDTO {
    status?: PaymentStatus;
    transactionCode?: string;
    note?: string;
}

// Payment Method Create Request
export interface PaymentMethodCreateDTO {
    name: string;
    code: string;
    description?: string;
    status: boolean;
    icon?: string;
    type: PaymentMethodType;
    processingFee?: number;
    processingTime?: string;
}

// Payment Method Update Request
export interface PaymentMethodUpdateDTO {
    name?: string;
    description?: string;
    status?: boolean;
    icon?: string;
    processingFee?: number;
    processingTime?: string;
}

// Payment Response
export interface PaymentResponseDTO {
    paymentId: number;
    orderId: number;
    methodId: number;
    methodName: string;
    methodCode: string;
    amount: number;
    status: PaymentStatus;
    transactionCode?: string;
    paymentUrl?: string;
    createdAt: string;
    updatedAt: string;
    histories?: PaymentHistoryResponseDTO[];
}

// Payment Method Response
export interface PaymentMethodResponseDTO {
    methodId: number;
    name: string;
    code: string;
    description?: string;
    status: boolean;
    icon?: string;
    type: PaymentMethodType;
    processingFee?: number;
    processingTime?: string;
    createdAt: string;
    updatedAt: string;
}

// Payment History Response
export interface PaymentHistoryResponseDTO {
    historyId: number;
    paymentId: number;
    status: PaymentStatus;
    note?: string;
    createdAt: string;
}

// COD Payment Handling
export interface CodConfirmRequestDTO {
    note?: string;
}

export interface CodRejectionRequestDTO {
    reason: 'CUSTOMER_REJECTED' | 'NOT_AVAILABLE' | 'OTHER';
    note?: string;
}

// OTP Confirmation for payment
export interface OtpConfirmRequestDTO {
    otp: string;
}

// Refund Request
export interface RefundRequestDTO {
    amount?: number; // Optional: if not provided, full refund
    reason: string;
}

// Payment Stats
export interface PaymentStatsResponseDTO {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalAmount: number;
    successRate: number;
    methodStats: {
        methodId: number;
        methodName: string;
        count: number;
        amount: number;
    }[];
}

// Payment Filter Request
export interface PaymentFilterRequestDTO {
    status?: PaymentStatus;
    methodId?: number;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    orderId?: number;
}

// Page Request for Payments
export interface PaymentPageRequestDTO {
    page?: number;
    size?: number;
    sort?: string;
    filters?: PaymentFilterRequestDTO;
}