// paymentHooks.tsx

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchPayments,
    fetchPaymentById,
    fetchOrderPayment,
    createPayment,
    createOrderPayment,
    confirmPayment,
    cancelPayment,
    refundPayment,
    verifyTransaction,
    checkPaymentStatus,
    fetchPaymentMethods,
    fetchActivePaymentMethods,
    fetchPaymentMethodById,
    filterPayments,
    searchPayments,
    clearError,
    clearCurrentPayment
} from '../store/features/payment/paymentSlice';
import {
    selectPaymentsList,
    selectCurrentPayment,
    selectPaymentMethods,
    selectActivePaymentMethods,
    selectPaymentById,
    selectPaymentsByStatus,
    selectPaymentStatusCounts,
    selectPaymentsByMethod,
    selectFilteredPayments,
    selectTotalAmount,
    selectPaymentOperationStatus,
    selectSortedPayments,
    selectIsPaymentsEmpty,
    selectPaymentPageInfo,
    selectRecentPayments,
    selectPaymentMethodDetails,
    selectPaymentsCount
} from '../store/features/payment/PaymentSelectors';
import { PaymentStatus, PaymentCreateDTO, RefundRequestDTO, PaymentResponseDTO, PaymentFilterRequestDTO, PaymentPageRequestDTO } from '@/types';

// Main payment management hook
export const usePayments = () => {
    const dispatch = useAppDispatch();
    const payments = useAppSelector(selectPaymentsList);
    const paymentCount = useAppSelector(selectPaymentsCount);
    const totalAmount = useAppSelector(selectTotalAmount);
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);
    const isEmpty = useAppSelector(selectIsPaymentsEmpty);
    const pageInfo = useAppSelector(selectPaymentPageInfo);

    const handleFetchPayments = useCallback(async (pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }) => {
        try {
            await dispatch(fetchPayments(pageRequest)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreatePayment = useCallback(async (
        paymentData: PaymentCreateDTO
    ): Promise<PaymentResponseDTO | null> => {
        try {
            const result = await dispatch(createPayment(paymentData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleCreateOrderPayment = useCallback(async (
        orderId: number,
        paymentData: PaymentCreateDTO
    ): Promise<PaymentResponseDTO | null> => {
        try {
            const result = await dispatch(createOrderPayment({ orderId, paymentData })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleConfirmPayment = useCallback(async (paymentId: number) => {
        try {
            await dispatch(confirmPayment(paymentId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCancelPayment = useCallback(async (paymentId: number) => {
        try {
            await dispatch(cancelPayment(paymentId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleRefundPayment = useCallback(async (
        paymentId: number,
        refundData: RefundRequestDTO
    ) => {
        try {
            await dispatch(refundPayment({ id: paymentId, refundData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        payments,
        paymentCount,
        totalAmount,
        isLoading,
        error,
        isEmpty,
        pageInfo,
        fetchPayments: handleFetchPayments,
        createPayment: handleCreatePayment,
        createOrderPayment: handleCreateOrderPayment,
        confirmPayment: handleConfirmPayment,
        cancelPayment: handleCancelPayment,
        refundPayment: handleRefundPayment
    };
};

// Hook for finding specific payments
export const usePaymentFinder = (paymentId?: number) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);
    const foundPayment = useAppSelector(paymentId ? (state => selectPaymentById(state, paymentId)) : () => null);

    const handleFetchPaymentById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchPaymentById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchOrderPayment = useCallback(async (orderId: number) => {
        try {
            await dispatch(fetchOrderPayment(orderId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundPayment,
        fetchPaymentById: handleFetchPaymentById,
        fetchOrderPayment: handleFetchOrderPayment
    };
};

// Hook for current payment management
export const useCurrentPayment = () => {
    const dispatch = useAppDispatch();
    const currentPayment = useAppSelector(selectCurrentPayment);
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);

    const handleClearCurrentPayment = useCallback(() => {
        dispatch(clearCurrentPayment());
    }, [dispatch]);

    const handleVerifyTransaction = useCallback(async (transactionCode: string) => {
        try {
            await dispatch(verifyTransaction(transactionCode)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCheckPaymentStatus = useCallback(async (paymentId: number) => {
        try {
            await dispatch(checkPaymentStatus(paymentId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        currentPayment,
        isLoading,
        error,
        clearCurrentPayment: handleClearCurrentPayment,
        verifyTransaction: handleVerifyTransaction,
        checkPaymentStatus: handleCheckPaymentStatus
    };
};

// Hook for payment methods management
export const usePaymentMethods = () => {
    const dispatch = useAppDispatch();
    const paymentMethods = useAppSelector(selectPaymentMethods);
    const activePaymentMethods = useAppSelector(selectActivePaymentMethods);
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);

    const handleFetchPaymentMethods = useCallback(async () => {
        try {
            await dispatch(fetchPaymentMethods()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchActivePaymentMethods = useCallback(async () => {
        try {
            await dispatch(fetchActivePaymentMethods()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchPaymentMethodById = useCallback(async (methodId: number) => {
        try {
            await dispatch(fetchPaymentMethodById(methodId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        paymentMethods,
        activePaymentMethods,
        isLoading,
        error,
        fetchPaymentMethods: handleFetchPaymentMethods,
        fetchActivePaymentMethods: handleFetchActivePaymentMethods,
        fetchPaymentMethodById: handleFetchPaymentMethodById
    };
};

// Hook for getting payment method details
export const usePaymentMethodDetails = (methodId: number) => {
    const paymentMethodDetails = useAppSelector(state => selectPaymentMethodDetails(state, methodId));
    return { paymentMethodDetails };
};

// Hook for payment filtering
export const useFilteredPayments = (filters: PaymentFilters = {}) => {
    const dispatch = useAppDispatch();
    const filteredPayments = useAppSelector(state => selectFilteredPayments(state, filters));
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);

    const handleFilterPayments = useCallback(async (
        filters: PaymentFilterRequestDTO,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ) => {
        try {
            await dispatch(filterPayments({ filters, pageRequest })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        filteredPayments,
        isLoading,
        error,
        filterPayments: handleFilterPayments
    };
};

// Hook for sorted payment lists
type SortOrder = 'asc' | 'desc';

export const useSortedPayments = (sortBy?: keyof PaymentResponseDTO, sortOrder: SortOrder = 'asc') => {
    const sortedPayments = useAppSelector(
        sortBy ? (state => selectSortedPayments(state, sortBy, sortOrder)) : selectPaymentsList
    );

    return {
        sortedPayments
    };
};

// Hook for payment status and statistics
export const usePaymentStats = () => {
    const statusCounts = useAppSelector(selectPaymentStatusCounts);
    const totalAmount = useAppSelector(selectTotalAmount);
    const recentPayments = useAppSelector(selectRecentPayments);

    return {
        statusCounts,
        totalAmount,
        recentPayments
    };
};

// Hook for payment search
export const usePaymentSearch = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectPaymentOperationStatus);

    const handleSearchPayments = useCallback(async (
        keyword: string,
        pageRequest: PaymentPageRequestDTO = { page: 0, size: 10 }
    ) => {
        try {
            await dispatch(searchPayments({ keyword, pageRequest })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        searchPayments: handleSearchPayments
    };
};

// Hook for payments by status or method
export const usePaymentsByCategory = (status?: PaymentStatus, methodId?: number) => {
    const paymentsByStatus = useAppSelector(status ? (state => selectPaymentsByStatus(state, status)) : () => []);
    const paymentsByMethod = useAppSelector(methodId ? (state => selectPaymentsByMethod(state, methodId)) : () => []);

    return {
        paymentsByStatus,
        paymentsByMethod
    };
};

// Hook for error handling
export const usePaymentError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectPaymentOperationStatus).error;

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};

// Re-export PaymentFilters interface for convenience
export interface PaymentFilters {
    status?: PaymentStatus;
    methodId?: number;
    dateRange?: { start: string; end: string };
    search?: string;
    minAmount?: number;
    maxAmount?: number;
}