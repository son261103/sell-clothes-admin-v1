import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import OrderService from '../../../services/orderService';
import { OrderStatus } from '@/types'; // Import OrderStatus as a regular import, not a type import
import type {
    OrderResponse,
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderSummaryDTO,
    OrderPageRequest,
    OrderStatisticsDTO,
    UpdateOrderStatusDTO,
    ApplyShippingDTO,
} from '@/types';

// Define a type for paginated responses
interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

interface OrderState {
    orders: PaginatedResponse<OrderSummaryDTO>;
    currentOrder: OrderResponse | null;
    orderStatistics: OrderStatisticsDTO | null;
    userOrders: PaginatedResponse<OrderSummaryDTO>;
    isLoading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentOrder: null,
    orderStatistics: null,
    userOrders: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    isLoading: false,
    error: null
};

// Error handler
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'An unexpected error occurred';
};

// Async thunk actions - User side
export const fetchMyOrders = createAsyncThunk(
    'order/fetchMyOrders',
    async (pageRequest: OrderPageRequest, { rejectWithValue }) => {
        try {
            const response = await OrderService.getMyOrders(pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch orders');
            }
            return response.data as PaginatedResponse<OrderSummaryDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'order/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await OrderService.getOrderById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData: OrderCreateRequest, { rejectWithValue }) => {
        try {
            const response = await OrderService.createOrder(orderData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateOrder = createAsyncThunk(
    'order/update',
    async ({ id, updateData }: { id: number; updateData: OrderUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await OrderService.updateOrder(id, updateData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async ({ orderId, reason }: { orderId: number; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await OrderService.cancelOrder(orderId, reason);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to cancel order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const confirmOrder = createAsyncThunk(
    'order/confirm',
    async (orderId: number, { rejectWithValue }) => {
        try {
            const response = await OrderService.confirmOrder(orderId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to confirm order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk actions - Admin side
export const fetchAllOrders = createAsyncThunk(
    'order/fetchAll',
    async (pageRequest: OrderPageRequest, { rejectWithValue }) => {
        try {
            const response = await OrderService.getAllOrders(pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch orders');
            }
            return response.data as PaginatedResponse<OrderSummaryDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchOrderByIdAdmin = createAsyncThunk(
    'order/fetchByIdAdmin',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await OrderService.getOrderByIdAdmin(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchUserOrders = createAsyncThunk(
    'order/fetchUserOrders',
    async ({ userId, pageRequest }: { userId: number; pageRequest: OrderPageRequest }, { rejectWithValue }) => {
        try {
            const response = await OrderService.getUserOrders(userId, pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch user orders');
            }
            return response.data as PaginatedResponse<OrderSummaryDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ orderId, statusData }: { orderId: number; statusData: UpdateOrderStatusDTO }, { rejectWithValue }) => {
        try {
            const response = await OrderService.updateOrderStatus(orderId, statusData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update order status');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateOrderShipping = createAsyncThunk(
    'order/updateShipping',
    async ({ orderId, shippingData }: { orderId: number; shippingData: ApplyShippingDTO }, { rejectWithValue }) => {
        try {
            const response = await OrderService.updateOrderShipping(orderId, shippingData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update order shipping');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchOrderStatistics = createAsyncThunk(
    'order/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await OrderService.getOrderStatistics();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order statistics');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'order/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await OrderService.deleteOrder(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete order');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const searchOrdersAdmin = createAsyncThunk(
    'order/searchAdmin',
    async ({ keyword, pageRequest }: { keyword: string; pageRequest: OrderPageRequest }, { rejectWithValue }) => {
        try {
            const response = await OrderService.searchOrdersAdmin(keyword, pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to search orders');
            }
            return response.data as PaginatedResponse<OrderSummaryDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const filterOrdersAdmin = createAsyncThunk(
    'order/filterAdmin',
    async (pageRequest: OrderPageRequest, { rejectWithValue }) => {
        try {
            const response = await OrderService.filterOrdersAdmin(pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to filter orders');
            }
            return response.data as PaginatedResponse<OrderSummaryDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userOrders = action.payload;
                state.error = null;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Order By ID
            .addCase(fetchOrderById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add to user orders if it's the same page
                if (state.userOrders.number === 0) {
                    // Convert OrderResponse to OrderSummaryDTO format for userOrders
                    const summaryItem: OrderSummaryDTO = {
                        orderId: action.payload.orderId,
                        orderCode: action.payload.orderCode,
                        userId: action.payload.userId,
                        userName: action.payload.userName,
                        userEmail: action.payload.userEmail,
                        userPhone: action.payload.userPhone,
                        status: action.payload.status,
                        totalAmount: action.payload.totalAmount,
                        finalAmount: action.payload.finalAmount,
                        itemCount: action.payload.items?.length || 0,
                        createdAt: action.payload.createdAt,
                        updatedAt: action.payload.updatedAt,
                        paymentStatus: action.payload.payment?.status,
                        shippingMethodName: action.payload.shippingMethod?.name
                    };

                    state.userOrders.content = [summaryItem, ...state.userOrders.content];
                    if (state.userOrders.content.length > state.userOrders.size) {
                        state.userOrders.content.pop();
                    }
                    state.userOrders.totalElements += 1;
                    state.userOrders.totalPages = Math.ceil(state.userOrders.totalElements / state.userOrders.size);
                    state.userOrders.empty = state.userOrders.content.length === 0;
                }
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Order
            .addCase(updateOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in user orders if exists
                state.userOrders.content = state.userOrders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            status: action.payload.status,
                            updatedAt: action.payload.updatedAt
                        }
                        : order
                );

                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Cancel Order
            .addCase(cancelOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in user orders if exists
                state.userOrders.content = state.userOrders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            status: OrderStatus.CANCELLED,
                            updatedAt: action.payload.updatedAt
                        }
                        : order
                );

                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Confirm Order
            .addCase(confirmOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(confirmOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in user orders if exists
                state.userOrders.content = state.userOrders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            status: OrderStatus.CONFIRMED,
                            updatedAt: action.payload.updatedAt
                        }
                        : order
                );

                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(confirmOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch All Orders (Admin)
            .addCase(fetchAllOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Order By ID (Admin)
            .addCase(fetchOrderByIdAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderByIdAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderByIdAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch User Orders (Admin)
            .addCase(fetchUserOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userOrders = action.payload;
                state.error = null;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Order Status (Admin)
            .addCase(updateOrderStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in orders list if exists
                state.orders.content = state.orders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            status: action.payload.status,
                            updatedAt: action.payload.updatedAt
                        }
                        : order
                );

                // Update in user orders if exists
                state.userOrders.content = state.userOrders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            status: action.payload.status,
                            updatedAt: action.payload.updatedAt
                        }
                        : order
                );

                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Order Shipping (Admin)
            .addCase(updateOrderShipping.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrderShipping.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update current order if it's the same
                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }

                // Update in orders list if exists
                state.orders.content = state.orders.content.map(order =>
                    order.orderId === action.payload.orderId
                        ? {
                            ...order,
                            updatedAt: action.payload.updatedAt,
                            shippingMethodName: action.payload.shippingMethod?.name
                        }
                        : order
                );

                state.error = null;
            })
            .addCase(updateOrderShipping.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Order Statistics
            .addCase(fetchOrderStatistics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderStatistics = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderStatistics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Order
            .addCase(deleteOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove from orders list
                state.orders.content = state.orders.content.filter(
                    order => order.orderId !== action.payload
                );
                state.orders.totalElements -= 1;
                state.orders.totalPages = Math.ceil(state.orders.totalElements / state.orders.size);
                state.orders.empty = state.orders.content.length === 0;

                // Remove from user orders if exists
                state.userOrders.content = state.userOrders.content.filter(
                    order => order.orderId !== action.payload
                );
                if (state.userOrders.content.length < state.userOrders.totalElements) {
                    state.userOrders.totalElements -= 1;
                    state.userOrders.totalPages = Math.ceil(state.userOrders.totalElements / state.userOrders.size);
                    state.userOrders.empty = state.userOrders.content.length === 0;
                }

                // Clear current order if it's the same
                if (state.currentOrder?.orderId === action.payload) {
                    state.currentOrder = null;
                }

                state.error = null;
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Search Orders Admin
            .addCase(searchOrdersAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchOrdersAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(searchOrdersAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Filter Orders Admin
            .addCase(filterOrdersAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(filterOrdersAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(filterOrdersAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentOrder
} = orderSlice.actions;

export default orderSlice.reducer;