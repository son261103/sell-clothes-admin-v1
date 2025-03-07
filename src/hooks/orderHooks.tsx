import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchMyOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    cancelOrder,
    confirmOrder,
    fetchAllOrders,
    fetchOrderByIdAdmin,
    fetchUserOrders,
    updateOrderStatus,
    updateOrderShipping,
    fetchOrderStatistics,
    deleteOrder,
    searchOrdersAdmin,
    filterOrdersAdmin,
    clearError,
    clearCurrentOrder
} from '../store/features/order/orderSlice';
import {
    selectOrdersPage,
    selectOrdersList,
    selectCurrentOrder,
    selectUserOrdersPage,
    selectUserOrdersList,
    selectOrderStatistics,
    selectError,
    selectOrderPageInfo,
    selectUserOrderPageInfo,
    selectOrderById,
    selectOrderByCode,
    selectOrdersByStatus,
    selectOrderStatusCounts,
    selectOrdersByUser,
    selectFilteredOrders,
    selectOrdersCount,
    selectTotalRevenue,
    selectOrderOperationStatus,
    selectSortedOrders,
    selectIsOrdersEmpty,
    selectIsUserOrdersEmpty,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectRecentOrders,
    selectOrderItems,
    selectTotalItems,
    selectOrdersStatistics,
    selectRevenueByMonth,
    selectOrdersByMonth,
    selectShippingDetails,
    selectPaymentDetails
} from '../store/features/order/orderSelectors';
import type {
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderResponse,
    OrderPageRequest,
    OrderSummaryDTO,
    OrderStatus,
    UpdateOrderStatusDTO,
    ApplyShippingDTO,
    OrderFilters
} from '@/types';

// Main order management hook
export const useOrders = () => {
    const dispatch = useAppDispatch();
    const ordersPage = useAppSelector(selectOrdersPage);
    const ordersList = useAppSelector(selectOrdersList);
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);
    const pageInfo = useAppSelector(selectOrderPageInfo);
    const orderStats = useAppSelector(selectOrdersStatistics);

    const handleFetchAllOrders = useCallback(async (
        pageRequest: OrderPageRequest = { page: 0, size: 10, sort: 'createdAt,desc' }
    ) => {
        try {
            await dispatch(fetchAllOrders(pageRequest)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateOrder = useCallback(async (
        orderData: OrderCreateRequest
    ): Promise<OrderResponse | null> => {
        try {
            const result = await dispatch(createOrder(orderData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateOrder = useCallback(async (
        id: number,
        updateData: OrderUpdateRequest
    ) => {
        try {
            await dispatch(updateOrder({ id, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteOrder = useCallback(async (id: number) => {
        try {
            await dispatch(deleteOrder(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateOrderStatus = useCallback(async (
        orderId: number,
        statusData: UpdateOrderStatusDTO
    ) => {
        try {
            await dispatch(updateOrderStatus({ orderId, statusData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        ordersPage,
        ordersList,
        isLoading,
        error,
        pageInfo,
        orderStats,
        fetchAllOrders: handleFetchAllOrders,
        createOrder: handleCreateOrder,
        updateOrder: handleUpdateOrder,
        deleteOrder: handleDeleteOrder,
        updateOrderStatus: handleUpdateOrderStatus
    };
};

// Hook for finding specific orders
export const useOrderFinder = (orderId?: number, orderCode?: string) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);
    const foundById = useAppSelector(orderId ? (state => selectOrderById(state, orderId)) : () => null);
    const foundByCode = useAppSelector(orderCode ? (state => selectOrderByCode(state, orderCode)) : () => null);

    const handleFetchOrderById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchOrderById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchOrderByIdAdmin = useCallback(async (id: number) => {
        try {
            await dispatch(fetchOrderByIdAdmin(id)).unwrap();
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
        fetchOrderById: handleFetchOrderById,
        fetchOrderByIdAdmin: handleFetchOrderByIdAdmin
    };
};

// Hook for user's orders
export const useUserOrders = () => {
    const dispatch = useAppDispatch();
    const userOrdersPage = useAppSelector(selectUserOrdersPage);
    const userOrdersList = useAppSelector(selectUserOrdersList);
    const userPageInfo = useAppSelector(selectUserOrderPageInfo);
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);
    const isEmpty = useAppSelector(selectIsUserOrdersEmpty);

    const handleFetchMyOrders = useCallback(async (
        pageRequest: OrderPageRequest = { page: 0, size: 10, sort: 'createdAt,desc' }
    ) => {
        try {
            await dispatch(fetchMyOrders(pageRequest)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFetchUserOrders = useCallback(async (
        userId: number,
        pageRequest: OrderPageRequest = { page: 0, size: 10, sort: 'createdAt,desc' }
    ) => {
        try {
            await dispatch(fetchUserOrders({ userId, pageRequest })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCancelOrder = useCallback(async (
        orderId: number,
        reason?: string
    ) => {
        try {
            await dispatch(cancelOrder({ orderId, reason })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleConfirmOrder = useCallback(async (orderId: number) => {
        try {
            await dispatch(confirmOrder(orderId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        userOrdersPage,
        userOrdersList,
        userPageInfo,
        isLoading,
        error,
        isEmpty,
        fetchMyOrders: handleFetchMyOrders,
        fetchUserOrders: handleFetchUserOrders,
        cancelOrder: handleCancelOrder,
        confirmOrder: handleConfirmOrder
    };
};

// Hook for order status filtering
export const useOrderStatusFilters = (status?: OrderStatus) => {
    const ordersByStatus = useAppSelector(status ? (state => selectOrdersByStatus(state, status)) : selectOrdersList);
    const statusCounts = useAppSelector(selectOrderStatusCounts);

    return {
        ordersByStatus,
        statusCounts
    };
};

// Hook for order user filtering
export const useOrderUserFilters = (userId?: number) => {
    const ordersByUser = useAppSelector(userId ? (state => selectOrdersByUser(state, userId)) : selectOrdersList);

    return {
        ordersByUser
    };
};

// Hook for order revenue data
export const useOrderRevenue = () => {
    const totalRevenue = useAppSelector(selectTotalRevenue);
    const revenueByMonth = useAppSelector(selectRevenueByMonth);
    const ordersByMonth = useAppSelector(selectOrdersByMonth);

    return {
        totalRevenue,
        revenueByMonth,
        ordersByMonth
    };
};

// Hook for order statistics
export const useOrderStatistics = () => {
    const dispatch = useAppDispatch();
    const orderStatistics = useAppSelector(selectOrderStatistics);
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);
    const ordersCount = useAppSelector(selectOrdersCount);
    const recentOrders = useAppSelector(selectRecentOrders);

    const handleFetchStatistics = useCallback(async () => {
        try {
            await dispatch(fetchOrderStatistics()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        orderStatistics,
        isLoading,
        error,
        ordersCount,
        recentOrders,
        fetchStatistics: handleFetchStatistics
    };
};

// Hook for advanced order filtering
export const useAdvancedOrderFilters = (filters: OrderFilters = {}) => {
    const filteredOrders = useAppSelector(state => selectFilteredOrders(state, filters));
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);
    const dispatch = useAppDispatch();

    const handleSearchOrdersAdmin = useCallback(async (
        keyword: string,
        pageRequest: OrderPageRequest = { page: 0, size: 10 }
    ) => {
        try {
            await dispatch(searchOrdersAdmin({ keyword, pageRequest })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleFilterOrdersAdmin = useCallback(async (
        pageRequest: OrderPageRequest
    ) => {
        try {
            await dispatch(filterOrdersAdmin(pageRequest)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        filteredOrders,
        isLoading,
        error,
        searchOrdersAdmin: handleSearchOrdersAdmin,
        filterOrdersAdmin: handleFilterOrdersAdmin
    };
};

// Hook for sorted order lists
export const useSortedOrders = (sortBy?: keyof OrderSummaryDTO, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sortedOrders = useAppSelector(
        sortBy ? (state => selectSortedOrders(state, sortBy, sortOrder)) : selectOrdersList
    );

    return {
        sortedOrders
    };
};

// Hook for current order management
export const useCurrentOrder = () => {
    const dispatch = useAppDispatch();
    const currentOrder = useAppSelector(selectCurrentOrder);
    const orderItems = useAppSelector(selectOrderItems);
    const totalItems = useAppSelector(selectTotalItems);
    const shippingDetails = useAppSelector(selectShippingDetails);
    const paymentDetails = useAppSelector(selectPaymentDetails);
    const { isLoading, error } = useAppSelector(selectOrderOperationStatus);

    const handleClearCurrentOrder = useCallback(() => {
        dispatch(clearCurrentOrder());
    }, [dispatch]);

    const handleUpdateShipping = useCallback(async (
        orderId: number,
        shippingData: ApplyShippingDTO
    ) => {
        try {
            await dispatch(updateOrderShipping({ orderId, shippingData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        currentOrder,
        orderItems,
        totalItems,
        shippingDetails,
        paymentDetails,
        isLoading,
        error,
        clearCurrentOrder: handleClearCurrentOrder,
        updateShipping: handleUpdateShipping
    };
};

// Hook for pagination
export const useOrderPagination = () => {
    const isFirstPage = useAppSelector(selectIsFirstPage);
    const isLastPage = useAppSelector(selectIsLastPage);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const pageInfo = useAppSelector(selectOrderPageInfo);
    const isEmpty = useAppSelector(selectIsOrdersEmpty);

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
export const useOrderError = () => {
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