import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponService from '@/services/couponService';
import { RootState } from '../../store';
import {
    CouponResponseDTO,
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponPageRequest,
    CouponValidationDTO,
    CouponStatisticsDTO,
    CouponFilters,
    CouponDTO,
    OrderWithCouponDTO,
    CouponPage
} from '@/types';

// State type definition
interface CouponState {
    coupons: CouponPage | null;
    currentCoupon: CouponResponseDTO | null;
    availableCoupons: CouponResponseDTO[] | null;
    publicCoupons: CouponResponseDTO[] | null;
    couponValidation: CouponValidationDTO | null;
    couponStatistics: CouponStatisticsDTO | null;
    orderCoupons: CouponDTO[] | null;
    orderWithCoupon: OrderWithCouponDTO | null;
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: CouponState = {
    coupons: null,
    currentCoupon: null,
    availableCoupons: null,
    publicCoupons: null,
    couponValidation: null,
    couponStatistics: null,
    orderCoupons: null,
    orderWithCoupon: null,
    isLoading: false,
    error: null
};

// Async thunks

// Fetch all coupons with pagination
export const fetchAllCoupons = createAsyncThunk(
    'coupon/fetchAllCoupons',
    async (pageRequest: CouponPageRequest = { page: 0, size: 10 }, { rejectWithValue }) => {
        try {
            const response = await couponService.getAllCoupons(pageRequest);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Fetch coupon by ID
export const fetchCouponById = createAsyncThunk(
    'coupon/fetchCouponById',
    async (couponId: number, { rejectWithValue }) => {
        try {
            const response = await couponService.getCouponById(couponId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Fetch coupon by code
export const fetchCouponByCode = createAsyncThunk(
    'coupon/fetchCouponByCode',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await couponService.getCouponByCode(code);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Create coupon
export const createCoupon = createAsyncThunk(
    'coupon/createCoupon',
    async (couponData: CouponCreateDTO, { rejectWithValue }) => {
        try {
            const response = await couponService.createCoupon(couponData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Update coupon
export const updateCoupon = createAsyncThunk(
    'coupon/updateCoupon',
    async ({ couponId, updateData }: { couponId: number; updateData: CouponUpdateDTO }, { rejectWithValue }) => {
        try {
            const response = await couponService.updateCoupon(couponId, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Delete coupon
export const deleteCoupon = createAsyncThunk(
    'coupon/deleteCoupon',
    async (couponId: number, { rejectWithValue }) => {
        try {
            await couponService.deleteCoupon(couponId);
            return couponId;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Toggle coupon status
export const toggleCouponStatus = createAsyncThunk(
    'coupon/toggleCouponStatus',
    async (couponId: number, { rejectWithValue }) => {
        try {
            const response = await couponService.toggleCouponStatus(couponId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Fetch available coupons
export const fetchAvailableCoupons = createAsyncThunk(
    'coupon/fetchAvailableCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couponService.getAvailableCoupons();
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Fetch public coupons
export const fetchPublicCoupons = createAsyncThunk(
    'coupon/fetchPublicCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couponService.getPublicCoupons();
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Validate coupon (admin)
export const validateCoupon = createAsyncThunk(
    'coupon/validateCoupon',
    async ({ code, orderAmount }: { code: string; orderAmount: number }, { rejectWithValue }) => {
        try {
            const response = await couponService.validateCoupon(code, orderAmount);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Validate coupon (client)
export const validateClientCoupon = createAsyncThunk(
    'coupon/validateClientCoupon',
    async ({ code, orderAmount }: { code: string; orderAmount: number }, { rejectWithValue }) => {
        try {
            const response = await couponService.validateClientCoupon(code, orderAmount);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Get coupon statistics
export const fetchCouponStatistics = createAsyncThunk(
    'coupon/fetchCouponStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couponService.getCouponStatistics();
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Get coupon details by code (client)
export const getCouponDetailsByCode = createAsyncThunk(
    'coupon/getCouponDetailsByCode',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await couponService.getCouponDetailsByCode(code);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Search coupons
export const searchCoupons = createAsyncThunk(
    'coupon/searchCoupons',
    async ({ filters, pageRequest }: { filters: CouponFilters; pageRequest?: CouponPageRequest }, { rejectWithValue }) => {
        try {
            const response = await couponService.searchCoupons(filters, pageRequest);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Check if coupon exists
export const checkCouponExists = createAsyncThunk(
    'coupon/checkCouponExists',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await couponService.checkCouponExists(code);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Fetch valid coupons
export const fetchValidCoupons = createAsyncThunk(
    'coupon/fetchValidCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couponService.getValidCoupons();
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Apply coupon to order
export const applyCouponToOrder = createAsyncThunk(
    'coupon/applyCouponToOrder',
    async ({ orderId, couponCode }: { orderId: number; couponCode: string }, { rejectWithValue }) => {
        try {
            const response = await couponService.applyCouponToOrder(orderId, couponCode);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Remove coupon from order
export const removeCouponFromOrder = createAsyncThunk(
    'coupon/removeCouponFromOrder',
    async ({ orderId, couponCode }: { orderId: number; couponCode: string }, { rejectWithValue }) => {
        try {
            const response = await couponService.removeCouponFromOrder(orderId, couponCode);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Get coupons for an order
export const getOrderCoupons = createAsyncThunk(
    'coupon/getOrderCoupons',
    async (orderId: number, { rejectWithValue }) => {
        try {
            const response = await couponService.getOrderCoupons(orderId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
        }
    }
);

// Slice
const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCoupon: (state) => {
            state.currentCoupon = null;
        },
        clearCouponValidation: (state) => {
            state.couponValidation = null;
        },
        clearOrderCoupons: (state) => {
            state.orderCoupons = null;
            state.orderWithCoupon = null;
        }
    },
    extraReducers: (builder) => {
        // fetchAllCoupons
        builder.addCase(fetchAllCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAllCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            // The API only returns content, totalElements, and totalPages
            // We need to add the missing pagination properties
            const responseData = action.payload || { content: [], totalElements: 0, totalPages: 0 };
            state.coupons = {
                content: responseData.content || [],
                totalElements: responseData.totalElements || 0,
                totalPages: responseData.totalPages || 0,
                number: 0,  // Default values for missing properties
                size: 10,
                first: true,
                last: true,
                empty: (responseData.content || []).length === 0
            };
        });
        builder.addCase(fetchAllCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchCouponById
        builder.addCase(fetchCouponById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCouponById.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCoupon = action.payload;
        });
        builder.addCase(fetchCouponById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchCouponByCode
        builder.addCase(fetchCouponByCode.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCouponByCode.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCoupon = action.payload;
        });
        builder.addCase(fetchCouponByCode.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // createCoupon
        builder.addCase(createCoupon.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createCoupon.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCoupon = action.payload;

            // Add to coupons array if exists
            if (state.coupons) {
                // Create a fresh copy with all necessary pagination properties
                const currentContent = state.coupons.content || [];

                state.coupons = {
                    content: [action.payload, ...currentContent],
                    totalElements: (state.coupons.totalElements || 0) + 1,
                    totalPages: state.coupons.totalPages || 1,
                    number: 0,
                    size: 10,
                    first: true,
                    last: currentContent.length < 9, // If we have less than page size-1, we're on the last page
                    empty: false
                };
            }
        });
        builder.addCase(createCoupon.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // updateCoupon
        builder.addCase(updateCoupon.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateCoupon.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCoupon = action.payload;

            // Update in coupons array if exists
            if (state.coupons) {
                const currentContent = state.coupons.content || [];
                const updatedContent = currentContent.map(coupon =>
                    coupon.couponId === action.payload.couponId ? action.payload : coupon
                );

                state.coupons = {
                    content: updatedContent,
                    totalElements: state.coupons.totalElements || updatedContent.length,
                    totalPages: state.coupons.totalPages || 1,
                    number: 0,
                    size: 10,
                    first: true,
                    last: true,
                    empty: updatedContent.length === 0
                };
            }
        });
        builder.addCase(updateCoupon.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // deleteCoupon
        builder.addCase(deleteCoupon.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(deleteCoupon.fulfilled, (state, action) => {
            state.isLoading = false;

            // Remove from coupons array if exists
            if (state.coupons) {
                const currentContent = state.coupons.content || [];
                const filteredContent = currentContent.filter(
                    coupon => coupon.couponId !== action.payload
                );

                state.coupons = {
                    content: filteredContent,
                    totalElements: Math.max(0, (state.coupons.totalElements || 1) - 1),
                    totalPages: state.coupons.totalPages || 1,
                    number: 0,
                    size: 10,
                    first: true,
                    last: true,
                    empty: filteredContent.length === 0
                };
            }

            // Clear current coupon if it's the deleted one
            if (state.currentCoupon && state.currentCoupon.couponId === action.payload) {
                state.currentCoupon = null;
            }
        });
        builder.addCase(deleteCoupon.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // toggleCouponStatus
        builder.addCase(toggleCouponStatus.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(toggleCouponStatus.fulfilled, (state, action) => {
            state.isLoading = false;

            // Update current coupon if it's the toggled one
            if (state.currentCoupon && state.currentCoupon.couponId === action.payload.couponId) {
                state.currentCoupon = action.payload;
            }

            // Update in coupons array if exists
            if (state.coupons) {
                const currentContent = state.coupons.content || [];
                const updatedContent = currentContent.map(coupon =>
                    coupon.couponId === action.payload.couponId ? action.payload : coupon
                );

                state.coupons = {
                    content: updatedContent,
                    totalElements: state.coupons.totalElements || updatedContent.length,
                    totalPages: state.coupons.totalPages || 1,
                    number: 0,
                    size: 10,
                    first: true,
                    last: true,
                    empty: updatedContent.length === 0
                };
            }
        });
        builder.addCase(toggleCouponStatus.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchAvailableCoupons
        builder.addCase(fetchAvailableCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            state.availableCoupons = action.payload;
        });
        builder.addCase(fetchAvailableCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchPublicCoupons
        builder.addCase(fetchPublicCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchPublicCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            state.publicCoupons = action.payload;
        });
        builder.addCase(fetchPublicCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // validateCoupon
        builder.addCase(validateCoupon.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(validateCoupon.fulfilled, (state, action) => {
            state.isLoading = false;
            state.couponValidation = action.payload;
        });
        builder.addCase(validateCoupon.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // validateClientCoupon
        builder.addCase(validateClientCoupon.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(validateClientCoupon.fulfilled, (state, action) => {
            state.isLoading = false;
            state.couponValidation = action.payload;
        });
        builder.addCase(validateClientCoupon.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchCouponStatistics
        builder.addCase(fetchCouponStatistics.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCouponStatistics.fulfilled, (state, action) => {
            state.isLoading = false;
            state.couponStatistics = action.payload;
        });
        builder.addCase(fetchCouponStatistics.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // getCouponDetailsByCode
        builder.addCase(getCouponDetailsByCode.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getCouponDetailsByCode.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCoupon = action.payload;
        });
        builder.addCase(getCouponDetailsByCode.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // searchCoupons
        builder.addCase(searchCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(searchCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            // The API only returns content, totalElements, and totalPages
            // We need to add the missing pagination properties
            const responseData = action.payload || { content: [], totalElements: 0, totalPages: 0 };
            state.coupons = {
                content: responseData.content || [],
                totalElements: responseData.totalElements || 0,
                totalPages: responseData.totalPages || 0,
                number: 0,  // Default values for missing properties
                size: 10,
                first: true,
                last: true,
                empty: (responseData.content || []).length === 0
            };
        });
        builder.addCase(searchCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // checkCouponExists
        builder.addCase(checkCouponExists.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(checkCouponExists.fulfilled, (state) => {
            state.isLoading = false;
            // We don't store the result in state as it's just a boolean check
        });
        builder.addCase(checkCouponExists.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // fetchValidCoupons
        builder.addCase(fetchValidCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchValidCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            state.availableCoupons = action.payload;
        });
        builder.addCase(fetchValidCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // applyCouponToOrder
        builder.addCase(applyCouponToOrder.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(applyCouponToOrder.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orderWithCoupon = action.payload;
            state.orderCoupons = action.payload.coupons;
        });
        builder.addCase(applyCouponToOrder.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // removeCouponFromOrder
        builder.addCase(removeCouponFromOrder.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(removeCouponFromOrder.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orderWithCoupon = action.payload;
            state.orderCoupons = action.payload.coupons;
        });
        builder.addCase(removeCouponFromOrder.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // getOrderCoupons
        builder.addCase(getOrderCoupons.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getOrderCoupons.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orderCoupons = action.payload;
        });
        builder.addCase(getOrderCoupons.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

// Export actions
export const {
    clearError,
    clearCurrentCoupon,
    clearCouponValidation,
    clearOrderCoupons
} = couponSlice.actions;

// Export selector
export const selectCoupon = (state: RootState) => state.coupon;

export default couponSlice.reducer;