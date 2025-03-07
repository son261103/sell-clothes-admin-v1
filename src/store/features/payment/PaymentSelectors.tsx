// paymentSelectors.ts

import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import { PaymentResponseDTO, PaymentStatus } from '@/types';

// Basic selectors
export const selectPaymentState = (state: RootState) => state.payment;

export const selectPaymentsPage = createSelector(
    [selectPaymentState],
    (state) => ({
        content: state.payments?.content || [],
        totalPages: state.payments?.totalPages || 0,
        totalElements: state.payments?.totalElements || 0,
        size: state.payments?.size || 10,
        number: state.payments?.number || 0,
        first: state.payments?.first || true,
        last: state.payments?.last || true,
        empty: state.payments?.empty || true
    })
);

export const selectPaymentsList = createSelector(
    [selectPaymentsPage],
    (payments) => {
        if (!payments.content || !Array.isArray(payments.content)) {
            return [];
        }

        return payments.content.map(payment => {
            if (!payment) return null;
            return {
                ...payment,
                displayName: `#${payment.paymentId} - ${payment.methodName || ''}`,
                statusDisplay: payment.status ? (payment.status.charAt(0) + payment.status.slice(1).toLowerCase()) : '-',
                formattedAmount: typeof payment.amount === 'number' ? `$${payment.amount.toFixed(2)}` : '$0.00'
            };
        }).filter(Boolean);
    }
);

export const selectCurrentPayment = createSelector(
    [selectPaymentState],
    (state) => {
        if (!state.currentPayment) return null;

        return {
            ...state.currentPayment,
            displayName: `#${state.currentPayment.paymentId} - ${state.currentPayment.methodName || ''}`,
            statusDisplay: state.currentPayment.status ?
                state.currentPayment.status.charAt(0) + state.currentPayment.status.slice(1).toLowerCase() :
                '-',
            formattedAmount: typeof state.currentPayment.amount === 'number' ?
                `$${state.currentPayment.amount.toFixed(2)}` : '$0.00'
        };
    }
);

export const selectPaymentMethods = createSelector(
    [selectPaymentState],
    (state) => state.paymentMethods || []
);

export const selectActivePaymentMethods = createSelector(
    [selectPaymentState],
    (state) => state.activePaymentMethods || []
);

export const selectIsLoading = createSelector(
    [selectPaymentState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectPaymentState],
    (state) => state.error
);

// Pagination selectors
export const selectPaymentPageInfo = createSelector(
    [selectPaymentsPage],
    (payments) => ({
        totalPages: payments.totalPages,
        totalElements: payments.totalElements,
        size: payments.size,
        number: payments.number,
        first: payments.first,
        last: payments.last,
        empty: payments.empty,
        hasNext: !payments.last,
        hasPrevious: !payments.first
    })
);

// Payment information selectors
export const selectPaymentById = createSelector(
    [selectPaymentsList, (_: RootState, paymentId: number) => paymentId],
    (payments, paymentId) => {
        const found = payments.find(p => p?.paymentId === paymentId);
        return found ? {
            ...found,
            formattedId: `PAY-${paymentId}`
        } : null;
    }
);

// Status-based selectors
export const selectPaymentsByStatus = createSelector(
    [selectPaymentsList, (_: RootState, status: PaymentStatus) => status],
    (payments, status) => {
        if (!payments || !Array.isArray(payments)) {
            return [];
        }

        return payments
            .filter(p => p?.status === status)
            .map(p => {
                if (!p) return null;
                return {
                    ...p,
                    statusDisplay: status.charAt(0) + status.slice(1).toLowerCase(),
                    statusCount: payments.filter(payment => payment?.status === status).length
                };
            }).filter(Boolean);
    }
);

export const selectPaymentStatusCounts = createSelector(
    [selectPaymentsList],
    (payments) => {
        if (!payments || !Array.isArray(payments)) {
            return [];
        }

        const statusCounts: { [key in PaymentStatus]?: number } = {};

        payments.forEach(payment => {
            if (payment && payment.status) {
                statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
            }
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as PaymentStatus,
            count,
            percentage: payments.length ? (count / payments.length * 100).toFixed(1) + '%' : '0%'
        }));
    }
);

// Method-based selectors
export const selectPaymentsByMethod = createSelector(
    [selectPaymentsList, (_: RootState, methodId: number) => methodId],
    (payments, methodId) => {
        if (!payments || !Array.isArray(payments)) {
            return [];
        }

        return payments
            .filter(p => p?.methodId === methodId)
            .map(p => {
                if (!p) return null;
                return {
                    ...p,
                    methodCount: payments.filter(payment => payment?.methodId === methodId).length
                };
            }).filter(Boolean);
    }
);

// Search and filter selectors
interface PaymentFilters {
    status?: PaymentStatus;
    methodId?: number;
    dateRange?: { start: string; end: string };
    search?: string;
    minAmount?: number;
    maxAmount?: number;
}

export const selectFilteredPayments = createSelector(
    [selectPaymentsList, (_: RootState, filters: PaymentFilters) => filters],
    (payments, filters) => {
        if (!payments || !Array.isArray(payments) || !filters) {
            return payments || [];
        }

        return payments.filter(payment => {
            if (!payment) return false;

            const matchesStatus = !filters.status || payment.status === filters.status;

            const matchesMethod = !filters.methodId || payment.methodId === filters.methodId;

            let matchesDateRange = true;
            if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
                const paymentDate = new Date(payment.createdAt).getTime();
                const startDate = new Date(filters.dateRange.start).getTime();
                const endDate = new Date(filters.dateRange.end).getTime();
                matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
            }

            const searchTerm = filters.search?.toLowerCase();
            const matchesSearch = !searchTerm ||
                (payment.paymentId.toString().includes(searchTerm)) ||
                (payment.methodName && payment.methodName.toLowerCase().includes(searchTerm)) ||
                (payment.transactionCode && payment.transactionCode.toLowerCase().includes(searchTerm));

            const matchesAmountRange =
                (!filters.minAmount || payment.amount >= filters.minAmount) &&
                (!filters.maxAmount || payment.amount <= filters.maxAmount);

            return matchesStatus && matchesMethod && matchesDateRange && matchesSearch && matchesAmountRange;
        });
    }
);

// Count selectors
export const selectPaymentsCount = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Total: ${pageInfo.totalElements} payments`
    })
);

// Amount selectors
export const selectTotalAmount = createSelector(
    [selectPaymentsList],
    (payments) => {
        if (!payments || !Array.isArray(payments)) {
            return {
                amount: 0,
                formattedAmount: '$0.00',
                paymentCount: 0,
                averagePaymentValue: 0
            };
        }

        const completedPayments = payments.filter(p =>
            p && (p.status === PaymentStatus.COMPLETED || p.status === PaymentStatus.REFUNDED)
        );

        const total = completedPayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0);

        return {
            amount: total,
            formattedAmount: `$${total.toFixed(2)}`,
            paymentCount: completedPayments.length,
            averagePaymentValue: completedPayments.length ? total / completedPayments.length : 0
        };
    }
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectPaymentOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Loading...' : error ? 'Error occurred' : 'Success'
    })
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedPayments = createSelector(
    [
        selectPaymentsList,
        (_: RootState, sortBy: keyof PaymentResponseDTO) => sortBy,
        (_: RootState, __: keyof PaymentResponseDTO, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (payments, sortBy, sortOrder) => {
        if (!payments || !Array.isArray(payments)) {
            return [];
        }

        return [...payments]
            .sort((a, b) => {
                if (!a || !b) return 0;

                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (aVal === bVal) return 0;
                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                    return sortOrder === 'asc'
                        ? new Date(String(aVal)).getTime() - new Date(String(bVal)).getTime()
                        : new Date(String(bVal)).getTime() - new Date(String(aVal)).getTime();
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            })
            .map((p, index) => {
                if (!p) return null;
                return {
                    ...p,
                    sortIndex: index + 1,
                    sortedBy: sortBy
                };
            }).filter(Boolean);
    }
);

// Empty state selector
export const selectIsPaymentsEmpty = createSelector(
    [selectPaymentPageInfo, selectPaymentsList],
    (pageInfo, payments) => ({
        isEmpty: pageInfo.empty || !payments || payments.length === 0,
        message: pageInfo.empty ? 'No payments found' : 'Payments available'
    })
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        isFirst: pageInfo.first,
        canNavigatePrevious: !pageInfo.first
    })
);

export const selectIsLastPage = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        isLast: pageInfo.last,
        canNavigateNext: !pageInfo.last
    })
);

export const selectCurrentPage = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        current: pageInfo.number,
        displayText: `Page ${pageInfo.number + 1} of ${pageInfo.totalPages}`
    })
);

export const selectPageSize = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        size: pageInfo.size,
        displayText: `Showing ${pageInfo.size} items per page`
    })
);

export const selectTotalPages = createSelector(
    [selectPaymentPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalPages,
        displayText: `Total pages: ${pageInfo.totalPages}`
    })
);

// Date selectors
export const selectRecentPayments = createSelector(
    [selectPaymentsList],
    (payments) => {
        if (!payments || !Array.isArray(payments)) {
            return [];
        }

        return [...payments]
            .sort((a, b) => {
                if (!a || !b) return 0;
                if (!a.createdAt || !b.createdAt) return 0;
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            })
            .slice(0, 5)
            .map(p => {
                if (!p) return null;
                if (!p.createdAt) return null;

                return {
                    ...p,
                    formattedCreatedAt: new Date(p.createdAt).toLocaleDateString(),
                    isRecent: new Date().getTime() - new Date(p.createdAt).getTime() < 24 * 60 * 60 * 1000
                };
            }).filter(Boolean);
    }
);

// Payment method selectors
export const selectPaymentMethodDetails = createSelector(
    [selectPaymentMethods, (_: RootState, methodId: number) => methodId],
    (methods, methodId) => {
        const method = methods.find(m => m.methodId === methodId);
        if (!method) return null;

        return {
            ...method,
            statusDisplay: method.status ? 'Active' : 'Inactive',
            formattedProcessingFee: typeof method.processingFee === 'number' ?
                `$${method.processingFee.toFixed(2)}` : 'N/A'
        };
    }
);