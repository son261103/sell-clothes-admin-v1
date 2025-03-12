// order.types.ts
import { PaymentResponseDTO, PaymentStatus } from '@/types/payment/payment.types';
import {CouponDTO, PageRequest} from "@/types";

// Order Status Enum
export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPING = 'SHIPPING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    DELIVERY_FAILED = 'DELIVERY_FAILED',
    CANCELLED = 'CANCELLED'
}

// Basic Order Create Request
export interface OrderCreateRequest {
    userId: number;
    shippingAddressId: number;
    paymentMethodId: number;
    note?: string;
    items: OrderItemRequest[];
    couponCode?: string;
}

// Order Item within an Order
export interface OrderItemRequest {
    productVariantId: number;
    quantity: number;
    price: number;
}

// Order Update Request
export interface OrderUpdateRequest {
    note?: string;
    shippingAddressId?: number;
    status?: OrderStatus;
}

// Update Order Status Request
export interface UpdateOrderStatusDTO {
    status: OrderStatus;
    note?: string;
}

// Order Response
export interface OrderResponse {
    orderId: number;
    orderCode: string;
    userId: number;
    userName: string;
    userEmail: string;
    status: OrderStatus;
    userPhone: string;
    totalAmount: number;
    shippingFee: number;
    discount: number;
    finalAmount: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
    items?: OrderItemResponse[]; // Optional vì API không trả về
    shippingAddress?: ShippingAddressResponse; // Optional
    payment?: PaymentResponseDTO;
    shippingMethod?: ShippingMethodResponse;
    deliveryOtp?: string;
    deliveryOtpExpiry?: string;
    // Thêm các trường từ API
    user?: UserInfo;
    address?: AddressInfo;

    // Thêm thông tin coupon
    coupons?: CouponDTO[];
    subtotalBeforeDiscount?: number;
    totalDiscount?: number;
}

// Thêm interface mới
export interface UserInfo {
    userId: number;
    username: string;
    email: string;
    phone: string;
    avatar?: string;
    fullName?: string;
    name?: string;
}

export interface AddressInfo {
    addressId: number;
    userId: number;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    isDefault: boolean;
}

// Order Item Response
export interface OrderItemResponse {
    orderItemId: number;
    orderId: number;
    productVariantId: number;
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
    subtotal: number;
    productImage?: string;
}

// Order Summary (for listings)
export interface OrderSummaryDTO {
    orderId: number;
    orderCode: string;
    status: OrderStatus;
    statusDescription: string;
    totalAmount: number;
    finalAmount: number;
    shippingFee: number;
    shippingMethodName?: string;
    totalItems: number;
    itemCount: number;
    createdAt: string;
    updatedAt?: string;
    userName?: string;
    userEmail?: string;
    userId?: number;
    paymentStatus?: PaymentStatus;

    // Thêm thông tin coupon
    subtotalBeforeDiscount?: number;
    totalDiscount?: number;
    hasCoupon?: boolean;
}

// Order Filters
export interface OrderFilters {
    status?: OrderStatus;
    userId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    paymentStatus?: PaymentStatus;
    shippingMethodId?: number;
}

// Order Page Request
export interface OrderPageRequest extends PageRequest {
    filters?: OrderFilters;
}

// Order Statistics
export interface OrderStatisticsDTO {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippingOrders: number;
    confirmedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    deliveryFailedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    monthlyOrders: {
        month: string;
        count: number;
        revenue: number;
    }[];
}

// Shipping Related Interfaces
export interface ShippingAddressResponse {
    addressId: number;
    userId: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    isDefault: boolean;
}

export interface ShippingMethodResponse {
    methodId: number;
    name: string;
    description: string;
    basePrice: number;
    pricePerKg: number;
    estimatedDays: string;
    status: boolean;
    provider: string;
    icon?: string;
}

export interface ApplyShippingDTO {
    shippingMethodId: number;
    totalWeight: number;
}