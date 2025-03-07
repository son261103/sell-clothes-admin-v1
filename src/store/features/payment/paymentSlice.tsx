import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PaymentService from '../../../services/paymentService';
import type {
    PaymentResponseDTO,
    PaymentCreateDTO,
    PaymentMethodResponseDTO,
    PaymentFilterRequestDTO,
    PaymentPageRequestDTO,
    RefundRequestDTO
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

interface PaymentState {
    payments: PaginatedResponse<PaymentResponseDTO>;
    currentPayment: PaymentResponseDTO | null;
    paymentMethods: PaymentMethodResponseDTO[];
    activePaymentMethods: PaymentMethodResponseDTO[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PaymentState = {
    payments: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentPayment: null,
    paymentMethods: [],
    activePaymentMethods: [],
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

// Async thunk actions - Payments
export const fetchPayments = createAsyncThunk(
    'payment/fetchPayments',
    async (pageRequest: PaymentPageRequestDTO, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getPayments(pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch payments');
            }
            return response.data as PaginatedResponse<PaymentResponseDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchPaymentById = createAsyncThunk(
    'payment/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getPaymentById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchOrderPayment = createAsyncThunk(
    'payment/fetchOrderPayment',
    async (orderId: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getOrderPayment(orderId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch order payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createPayment = createAsyncThunk(
    'payment/create',
    async (paymentData: PaymentCreateDTO, { rejectWithValue }) => {
        try {
            const response = await PaymentService.createPayment(paymentData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createOrderPayment = createAsyncThunk(
    'payment/createOrderPayment',
    async ({ orderId, paymentData }: { orderId: number; paymentData: PaymentCreateDTO }, { rejectWithValue }) => {
        try {
            const response = await PaymentService.createPaymentForOrder(orderId, paymentData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create order payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const confirmPayment = createAsyncThunk(
    'payment/confirm',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.confirmPayment(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to confirm payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const cancelPayment = createAsyncThunk(
    'payment/cancel',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.cancelPayment(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to cancel payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const refundPayment = createAsyncThunk(
    'payment/refund',
    async ({ id, refundData }: { id: number; refundData: RefundRequestDTO }, { rejectWithValue }) => {
        try {
            const response = await PaymentService.refundPayment(id, refundData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to refund payment');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const verifyTransaction = createAsyncThunk(
    'payment/verifyTransaction',
    async (transactionCode: string, { rejectWithValue }) => {
        try {
            const response = await PaymentService.verifyTransaction(transactionCode);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to verify transaction');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const checkPaymentStatus = createAsyncThunk(
    'payment/checkStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.checkPaymentStatus(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to check payment status');
            }
            return { id, status: response.data };
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Payment Method Thunk Actions
export const fetchPaymentMethods = createAsyncThunk(
    'payment/fetchMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getPaymentMethods();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch payment methods');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchActivePaymentMethods = createAsyncThunk(
    'payment/fetchActiveMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getActivePaymentMethods();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch active payment methods');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchPaymentMethodById = createAsyncThunk(
    'payment/fetchMethodById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await PaymentService.getPaymentMethodById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch payment method');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Filter and Search Thunk Actions
export const filterPayments = createAsyncThunk(
    'payment/filter',
    async (
        { filters, pageRequest }: { filters: PaymentFilterRequestDTO; pageRequest: PaymentPageRequestDTO },
        { rejectWithValue }
    ) => {
        try {
            const response = await PaymentService.filterPayments(filters, pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to filter payments');
            }
            return response.data as PaginatedResponse<PaymentResponseDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const searchPayments = createAsyncThunk(
    'payment/search',
    async (
        { keyword, pageRequest }: { keyword: string; pageRequest: PaymentPageRequestDTO },
        { rejectWithValue }
    ) => {
        try {
            const response = await PaymentService.searchPayments(keyword, pageRequest);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to search payments');
            }
            return response.data as PaginatedResponse<PaymentResponseDTO>;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPayment: (state) => {
            state.currentPayment = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Payments
            .addCase(fetchPayments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payments = action.payload;
                state.error = null;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Payment By ID
            .addCase(fetchPaymentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(fetchPaymentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Order Payment
            .addCase(fetchOrderPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderPayment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Payment
            .addCase(createPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;

                // Add to payments list if it's the same page
                if (state.payments.number === 0) {
                    state.payments.content = [action.payload, ...state.payments.content];
                    if (state.payments.content.length > state.payments.size) {
                        state.payments.content.pop();
                    }
                    state.payments.totalElements += 1;
                    state.payments.totalPages = Math.ceil(state.payments.totalElements / state.payments.size);
                    state.payments.empty = state.payments.content.length === 0;
                }

                state.error = null;
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Order Payment
            .addCase(createOrderPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createOrderPayment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(createOrderPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Confirm Payment
            .addCase(confirmPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(confirmPayment.fulfilled, (state, action) => {
                state.isLoading = false;

                // Update in payments list
                state.payments.content = state.payments.content.map(payment =>
                    payment.paymentId === action.payload.paymentId ? action.payload : payment
                );

                // Update current payment
                if (state.currentPayment?.paymentId === action.payload.paymentId) {
                    state.currentPayment = action.payload;
                }

                state.error = null;
            })
            .addCase(confirmPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Cancel Payment
            .addCase(cancelPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(cancelPayment.fulfilled, (state, action) => {
                state.isLoading = false;

                // Update in payments list
                state.payments.content = state.payments.content.map(payment =>
                    payment.paymentId === action.payload.paymentId ? action.payload : payment
                );

                // Update current payment
                if (state.currentPayment?.paymentId === action.payload.paymentId) {
                    state.currentPayment = action.payload;
                }

                state.error = null;
            })
            .addCase(cancelPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Refund Payment
            .addCase(refundPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refundPayment.fulfilled, (state, action) => {
                state.isLoading = false;

                // Update in payments list
                state.payments.content = state.payments.content.map(payment =>
                    payment.paymentId === action.payload.paymentId ? action.payload : payment
                );

                // Update current payment
                if (state.currentPayment?.paymentId === action.payload.paymentId) {
                    state.currentPayment = action.payload;
                }

                state.error = null;
            })
            .addCase(refundPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Verify Transaction
            .addCase(verifyTransaction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyTransaction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(verifyTransaction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Check Payment Status
            .addCase(checkPaymentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state, action) => {
                state.isLoading = false;

                // Update in payments list
                state.payments.content = state.payments.content.map(payment =>
                    payment.paymentId === action.payload.id
                        ? { ...payment, status: action.payload.status }
                        : payment
                );

                // Update current payment
                if (state.currentPayment?.paymentId === action.payload.id) {
                    state.currentPayment = {
                        ...state.currentPayment,
                        status: action.payload.status
                    };
                }

                state.error = null;
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Payment Methods
            .addCase(fetchPaymentMethods.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
                state.isLoading = false;
                state.paymentMethods = action.payload;
                state.error = null;
            })
            .addCase(fetchPaymentMethods.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchActivePaymentMethods.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActivePaymentMethods.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activePaymentMethods = action.payload;
                state.error = null;
            })
            .addCase(fetchActivePaymentMethods.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchPaymentMethodById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentMethodById.fulfilled, (state) => {
                state.isLoading = false;
                // No need to store individual payment method in state
                state.error = null;
            })
            .addCase(fetchPaymentMethodById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Filter and Search
            .addCase(filterPayments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(filterPayments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payments = action.payload;
                state.error = null;
            })
            .addCase(filterPayments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(searchPayments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchPayments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payments = action.payload;
                state.error = null;
            })
            .addCase(searchPayments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentPayment
} = paymentSlice.actions;

export default paymentSlice.reducer;