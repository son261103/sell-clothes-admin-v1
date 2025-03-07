import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import OrderItemService from '../../../services/orderItemService';
import type {
    OrderItemResponse,
    OrderItemRequest,
    OrderItemUpdateRequest,
    BestsellingVariantDTO,
    BestsellingProductDTO,
    ProductSalesDataDTO
} from '@/types';

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

interface OrderItemState {
    orderItems: OrderItemResponse[];
    currentOrderItem: OrderItemResponse | null;
    bestsellingVariants: BestsellingVariantDTO[];
    bestsellingProducts: BestsellingProductDTO[];
    productSalesData: ProductSalesDataDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: OrderItemState = {
    orderItems: [],
    currentOrderItem: null,
    bestsellingVariants: [],
    bestsellingProducts: [],
    productSalesData: null,
    isLoading: false,
    error: null
};

// Async thunk for getting all items for an order
export const fetchOrderItems = createAsyncThunk(
    'orderItem/fetchItems',
    async (orderId: number, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.getOrderItems(orderId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order items');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for getting a specific order item
export const fetchOrderItem = createAsyncThunk(
    'orderItem/fetchItem',
    async ({ orderId, itemId }: { orderId: number; itemId: number }, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.getOrderItem(orderId, itemId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order item');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for adding an item to an order
export const addOrderItem = createAsyncThunk(
    'orderItem/add',
    async ({ orderId, item }: { orderId: number; item: OrderItemRequest }, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.addOrderItem(orderId, item);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to add order item');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for updating an existing order item
export const updateOrderItem = createAsyncThunk(
    'orderItem/update',
    async ({ orderId, itemId, updateData }: { orderId: number; itemId: number; updateData: OrderItemUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.updateOrderItem(orderId, itemId, updateData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update order item');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for removing an item from an order
export const removeOrderItem = createAsyncThunk(
    'orderItem/remove',
    async ({ orderId, itemId }: { orderId: number; itemId: number }, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.removeOrderItem(orderId, itemId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to remove order item');
            }
            return { orderId, itemId };
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Admin methods

// Async thunk for getting bestselling variants
export const fetchBestsellingVariants = createAsyncThunk(
    'orderItem/bestsellingVariants',
    async (limit: number = 10, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.getBestsellingVariants(limit);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch bestselling variants');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for getting bestselling products
export const fetchBestsellingProducts = createAsyncThunk(
    'orderItem/bestsellingProducts',
    async (limit: number = 10, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.getBestsellingProducts(limit);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch bestselling products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for getting sales data for a specific product
export const fetchProductSalesData = createAsyncThunk(
    'orderItem/productSalesData',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.getProductSalesData(productId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch product sales data');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Async thunk for restoring inventory for a cancelled order
export const restoreInventory = createAsyncThunk(
    'orderItem/restoreInventory',
    async (orderId: number, { rejectWithValue }) => {
        try {
            const response = await OrderItemService.restoreInventory(orderId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to restore inventory');
            }
            return orderId;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const orderItemSlice = createSlice({
    name: 'orderItem',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentOrderItem: (state) => {
            state.currentOrderItem = null;
        },
        clearOrderItems: (state) => {
            state.orderItems = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchOrderItems
            .addCase(fetchOrderItems.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderItems.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderItems = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderItems.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // fetchOrderItem
            .addCase(fetchOrderItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrderItem = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // addOrderItem
            .addCase(addOrderItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addOrderItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderItems.push(action.payload);
                state.currentOrderItem = action.payload;
                state.error = null;
            })
            .addCase(addOrderItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // updateOrderItem
            .addCase(updateOrderItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrderItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderItems = state.orderItems.map(item =>
                    item.orderItemId === action.payload.orderItemId ? action.payload : item
                );
                state.currentOrderItem = action.payload;
                state.error = null;
            })
            .addCase(updateOrderItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // removeOrderItem
            .addCase(removeOrderItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeOrderItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderItems = state.orderItems.filter(
                    item => item.orderItemId !== action.payload.itemId
                );
                if (state.currentOrderItem?.orderItemId === action.payload.itemId) {
                    state.currentOrderItem = null;
                }
                state.error = null;
            })
            .addCase(removeOrderItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // fetchBestsellingVariants
            .addCase(fetchBestsellingVariants.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBestsellingVariants.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bestsellingVariants = action.payload;
                state.error = null;
            })
            .addCase(fetchBestsellingVariants.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // fetchBestsellingProducts
            .addCase(fetchBestsellingProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBestsellingProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bestsellingProducts = action.payload;
                state.error = null;
            })
            .addCase(fetchBestsellingProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // fetchProductSalesData
            .addCase(fetchProductSalesData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductSalesData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.productSalesData = action.payload;
                state.error = null;
            })
            .addCase(fetchProductSalesData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // restoreInventory
            .addCase(restoreInventory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(restoreInventory.fulfilled, (state) => {
                state.isLoading = false;
                // No state changes needed as this is just an operation on the backend
                state.error = null;
            })
            .addCase(restoreInventory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentOrderItem,
    clearOrderItems
} = orderItemSlice.actions;

export default orderItemSlice.reducer;