import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchAllCoupons,
    fetchCouponById,
    fetchCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    fetchAvailableCoupons,
    fetchPublicCoupons,
    validateCoupon,
    validateClientCoupon,
    fetchCouponStatistics,
    getCouponDetailsByCode,
    searchCoupons,
    checkCouponExists,
    fetchValidCoupons,
    clearError,
    clearCurrentCoupon,
    clearCouponValidation,
    applyCouponToOrder,
    removeCouponFromOrder,
    getOrderCoupons,
    clearOrderCoupons
} from '../store/features/coupon/couponSlice';
import {
    selectCouponsPage,
    selectCouponsList,
    selectCurrentCoupon,
    selectFormattedCurrentCoupon,
    selectAvailableCoupons,
    selectFormattedAvailableCoupons,
    selectPublicCoupons,
    selectFormattedPublicCoupons,
    selectCouponValidation,
    selectFormattedCouponValidation,
    selectCouponStatistics,
    selectFormattedCouponStatistics,
    selectError,
    selectCouponPageInfo,
    selectCouponById,
    selectCouponByCode,
    selectActiveCoupons,
    selectInactiveCoupons,
    selectExpiredCoupons,
    selectFullyUsedCoupons,
    selectPercentageCoupons,
    selectFixedAmountCoupons,
    selectFilteredCoupons,
    selectCouponsCount,
    selectCouponOperationStatus,
    selectSortedCoupons,
    selectIsCouponsEmpty,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectRecentCoupons,
    selectExpiringCoupons,
    selectCouponTypeCounts,
    selectCouponStatusCounts,
    selectCouponSummary,
    selectOrderCoupons,
    selectFormattedOrderCoupons,
    selectOrderWithCoupon,
    selectOrderDiscount,
    selectFormattedOrderDiscount,
    selectSubtotalBeforeDiscount,
    selectFormattedSubtotalBeforeDiscount,
    selectHasAppliedCoupons,
    selectTotalOrderCoupons
} from '../store/features/coupon/couponSelectors';
import type {
    CouponResponseDTO,
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponPageRequest,
    CouponFilters,
    CouponDTO,
    OrderWithCouponDTO
} from '@/types';

// Main coupon management hook
export const useCoupons = () => {
    const dispatch = useAppDispatch();
    const couponsPage = useAppSelector(selectCouponsPage);
    const couponsList = useAppSelector(selectCouponsList);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);
    const pageInfo = useAppSelector(selectCouponPageInfo);
    const couponStats = useAppSelector(selectFormattedCouponStatistics);

    const handleFetchAllCoupons = useCallback(async (
        pageRequest: CouponPageRequest = { page: 0, size: 10, sort: 'code,asc' }
    ) => {
        try {
            await dispatch(fetchAllCoupons(pageRequest)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateCoupon = useCallback(async (
        couponData: CouponCreateDTO
    ): Promise<CouponResponseDTO | null> => {
        try {
            const result = await dispatch(createCoupon(couponData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateCoupon = useCallback(async (
        couponId: number,
        updateData: CouponUpdateDTO
    ) => {
        try {
            await dispatch(updateCoupon({ couponId, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteCoupon = useCallback(async (id: number) => {
        try {
            await dispatch(deleteCoupon(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleToggleCouponStatus = useCallback(async (id: number) => {
        try {
            await dispatch(toggleCouponStatus(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        couponsPage,
        couponsList,
        isLoading,
        error,
        pageInfo,
        couponStats,
        fetchAllCoupons: handleFetchAllCoupons,
        createCoupon: handleCreateCoupon,
        updateCoupon: handleUpdateCoupon,
        deleteCoupon: handleDeleteCoupon,
        toggleCouponStatus: handleToggleCouponStatus
    };
};

// Hook for finding specific coupons
export const useCouponFinder = (couponId?: number, couponCode?: string) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);
    const foundById = useAppSelector(couponId ? (state => selectCouponById(state, couponId)) : () => null);
    const foundByCode = useAppSelector(couponCode ? (state => selectCouponByCode(state, couponCode)) : () => null);

    const handleFetchCouponById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchCouponById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchCouponByCode = useCallback(async (code: string) => {
        try {
            await dispatch(fetchCouponByCode(code)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCheckCouponExists = useCallback(async (code: string) => {
        try {
            await dispatch(checkCouponExists(code)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundById,
        foundByCode,
        fetchCouponById: handleFetchCouponById,
        fetchCouponByCode: handleFetchCouponByCode,
        checkCouponExists: handleCheckCouponExists
    };
};

// Hook for client's coupons
export const useClientCoupons = () => {
    const dispatch = useAppDispatch();
    const availableCoupons = useAppSelector(selectAvailableCoupons);
    const formattedAvailableCoupons = useAppSelector(selectFormattedAvailableCoupons);
    const publicCoupons = useAppSelector(selectPublicCoupons);
    const formattedPublicCoupons = useAppSelector(selectFormattedPublicCoupons);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);

    const handleFetchAvailableCoupons = useCallback(async () => {
        try {
            await dispatch(fetchAvailableCoupons()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchPublicCoupons = useCallback(async () => {
        try {
            await dispatch(fetchPublicCoupons()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchValidCoupons = useCallback(async () => {
        try {
            await dispatch(fetchValidCoupons()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleGetCouponDetailsByCode = useCallback(async (code: string) => {
        try {
            await dispatch(getCouponDetailsByCode(code)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        availableCoupons,
        formattedAvailableCoupons,
        publicCoupons,
        formattedPublicCoupons,
        isLoading,
        error,
        fetchAvailableCoupons: handleFetchAvailableCoupons,
        fetchPublicCoupons: handleFetchPublicCoupons,
        fetchValidCoupons: handleFetchValidCoupons,
        getCouponDetailsByCode: handleGetCouponDetailsByCode
    };
};

// Hook for coupon status filtering
export const useCouponStatusFilters = () => {
    const activeCoupons = useAppSelector(selectActiveCoupons);
    const inactiveCoupons = useAppSelector(selectInactiveCoupons);
    const expiredCoupons = useAppSelector(selectExpiredCoupons);
    const fullyUsedCoupons = useAppSelector(selectFullyUsedCoupons);
    const statusCounts = useAppSelector(selectCouponStatusCounts);

    return {
        activeCoupons,
        inactiveCoupons,
        expiredCoupons,
        fullyUsedCoupons,
        statusCounts
    };
};

// Hook for coupon type filtering
export const useCouponTypeFilters = () => {
    const percentageCoupons = useAppSelector(selectPercentageCoupons);
    const fixedAmountCoupons = useAppSelector(selectFixedAmountCoupons);
    const typeCounts = useAppSelector(selectCouponTypeCounts);

    return {
        percentageCoupons,
        fixedAmountCoupons,
        typeCounts
    };
};

// Hook for coupon validation
export const useCouponValidation = () => {
    const dispatch = useAppDispatch();
    const couponValidation = useAppSelector(selectCouponValidation);
    const formattedCouponValidation = useAppSelector(selectFormattedCouponValidation);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);

    const handleValidateCoupon = useCallback(async (
        code: string,
        orderAmount: number
    ) => {
        try {
            await dispatch(validateCoupon({ code, orderAmount })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleValidateClientCoupon = useCallback(async (
        code: string,
        orderAmount: number
    ) => {
        try {
            await dispatch(validateClientCoupon({ code, orderAmount })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCouponValidation = useCallback(() => {
        dispatch(clearCouponValidation());
    }, [dispatch]);

    return {
        couponValidation,
        formattedCouponValidation,
        isLoading,
        error,
        validateCoupon: handleValidateCoupon,
        validateClientCoupon: handleValidateClientCoupon,
        clearCouponValidation: handleClearCouponValidation
    };
};

// Hook for coupon statistics
export const useCouponStatistics = () => {
    const dispatch = useAppDispatch();
    const couponStatistics = useAppSelector(selectCouponStatistics);
    const formattedCouponStatistics = useAppSelector(selectFormattedCouponStatistics);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);
    const couponsCount = useAppSelector(selectCouponsCount);
    const recentCoupons = useAppSelector(selectRecentCoupons);
    const expiringCoupons = useAppSelector(selectExpiringCoupons);
    const couponSummary = useAppSelector(selectCouponSummary);

    const handleFetchStatistics = useCallback(async () => {
        try {
            await dispatch(fetchCouponStatistics()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        couponStatistics,
        formattedCouponStatistics,
        isLoading,
        error,
        couponsCount,
        recentCoupons,
        expiringCoupons,
        couponSummary,
        fetchStatistics: handleFetchStatistics
    };
};

// Hook for advanced coupon filtering
export const useAdvancedCouponFilters = (filters: CouponFilters = {}) => {
    const filteredCoupons = useAppSelector(state => selectFilteredCoupons(state, filters));
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);
    const dispatch = useAppDispatch();

    const handleSearchCoupons = useCallback(async (
        filters: CouponFilters,
        pageRequest: CouponPageRequest = { page: 0, size: 10 }
    ) => {
        try {
            await dispatch(searchCoupons({ filters, pageRequest })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        filteredCoupons,
        isLoading,
        error,
        searchCoupons: handleSearchCoupons
    };
};

// Hook for sorted coupon lists
export const useSortedCoupons = (sortBy?: keyof CouponResponseDTO, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sortedCoupons = useAppSelector(
        sortBy ? (state => selectSortedCoupons(state, sortBy, sortOrder)) : selectCouponsList
    );

    return {
        sortedCoupons
    };
};

// Hook for current coupon management
export const useCurrentCoupon = () => {
    const dispatch = useAppDispatch();
    const currentCoupon = useAppSelector(selectCurrentCoupon);
    const formattedCurrentCoupon = useAppSelector(selectFormattedCurrentCoupon);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);

    const handleClearCurrentCoupon = useCallback(() => {
        dispatch(clearCurrentCoupon());
    }, [dispatch]);

    return {
        currentCoupon,
        formattedCurrentCoupon,
        isLoading,
        error,
        clearCurrentCoupon: handleClearCurrentCoupon
    };
};

// Hook for pagination
export const useCouponPagination = () => {
    const isFirstPage = useAppSelector(selectIsFirstPage);
    const isLastPage = useAppSelector(selectIsLastPage);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const pageInfo = useAppSelector(selectCouponPageInfo);
    const isEmpty = useAppSelector(selectIsCouponsEmpty);

    return {
        isFirstPage,
        isLastPage,
        currentPage,
        pageSize,
        totalPages,
        pageInfo,
        isEmpty
    };
};

// Hook for error handling
export const useCouponError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};

// Hook for order coupons
export const useOrderCoupons = () => {
    const dispatch = useAppDispatch();
    const orderCoupons = useAppSelector(selectOrderCoupons);
    const formattedOrderCoupons = useAppSelector(selectFormattedOrderCoupons);
    const orderWithCoupon = useAppSelector(selectOrderWithCoupon);
    const orderDiscount = useAppSelector(selectOrderDiscount);
    const formattedOrderDiscount = useAppSelector(selectFormattedOrderDiscount);
    const subtotalBeforeDiscount = useAppSelector(selectSubtotalBeforeDiscount);
    const formattedSubtotalBeforeDiscount = useAppSelector(selectFormattedSubtotalBeforeDiscount);
    const hasAppliedCoupons = useAppSelector(selectHasAppliedCoupons);
    const totalOrderCoupons = useAppSelector(selectTotalOrderCoupons);
    const { isLoading, error } = useAppSelector(selectCouponOperationStatus);

    const handleApplyCouponToOrder = useCallback(async (
        orderId: number,
        couponCode: string
    ): Promise<OrderWithCouponDTO | null> => {
        try {
            const result = await dispatch(applyCouponToOrder({ orderId, couponCode })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleRemoveCouponFromOrder = useCallback(async (
        orderId: number,
        couponCode: string
    ): Promise<OrderWithCouponDTO | null> => {
        try {
            const result = await dispatch(removeCouponFromOrder({ orderId, couponCode })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleGetOrderCoupons = useCallback(async (
        orderId: number
    ): Promise<CouponDTO[] | null> => {
        try {
            const result = await dispatch(getOrderCoupons(orderId)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleClearOrderCoupons = useCallback(() => {
        dispatch(clearOrderCoupons());
    }, [dispatch]);

    return {
        orderCoupons,
        formattedOrderCoupons,
        orderWithCoupon,
        orderDiscount,
        formattedOrderDiscount,
        subtotalBeforeDiscount,
        formattedSubtotalBeforeDiscount,
        hasAppliedCoupons,
        totalOrderCoupons,
        isLoading,
        error,
        applyCouponToOrder: handleApplyCouponToOrder,
        removeCouponFromOrder: handleRemoveCouponFromOrder,
        getOrderCoupons: handleGetOrderCoupons,
        clearOrderCoupons: handleClearOrderCoupons
    };
};