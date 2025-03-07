import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import { OrderSummaryDTO, OrderStatus, PaymentStatus } from '@/types';

// Basic selectors
export const selectOrderState = (state: RootState) => state.order;

export const selectOrdersPage = createSelector(
    [selectOrderState],
    (state) => ({
        content: state.orders?.content || [],
        totalPages: state.orders?.totalPages || 0,
        totalElements: state.orders?.totalElements || 0,
        size: state.orders?.size || 10,
        number: state.orders?.number || 0,
        first: state.orders?.first || true,
        last: state.orders?.last || true,
        empty: state.orders?.empty || true
    })
);

export const selectOrdersList = createSelector(
    [selectOrdersPage],
    (orders) => {
        if (!orders.content || !Array.isArray(orders.content)) {
            return [];
        }

        return orders.content.map(order => {
            if (!order) return null;
            return {
                ...order,
                displayName: `#${order.orderCode || ''} - ${order.userName || ''}`,
                statusDisplay: order.status ? (order.status.charAt(0) + order.status.slice(1).toLowerCase()) : '-',
                formattedAmount: typeof order.finalAmount === 'number' ? `$${order.finalAmount.toFixed(2)}` : '$0.00'
            };
        }).filter(Boolean);
    }
);

export const selectCurrentOrder = createSelector(
    [selectOrderState],
    (state) => {
        if (!state.currentOrder) return null;

        return {
            ...state.currentOrder,
            displayName: `#${state.currentOrder.orderCode || ''} - ${state.currentOrder.userName || ''}`,
            statusDisplay: state.currentOrder.status ?
                state.currentOrder.status.charAt(0) + state.currentOrder.status.slice(1).toLowerCase() :
                '-',
            formattedAmount: typeof state.currentOrder.finalAmount === 'number' ?
                `$${state.currentOrder.finalAmount.toFixed(2)}` :
                '$0.00'
        };
    }
);

export const selectUserOrdersPage = createSelector(
    [selectOrderState],
    (state) => ({
        content: state.userOrders?.content || [],
        totalPages: state.userOrders?.totalPages || 0,
        totalElements: state.userOrders?.totalElements || 0,
        size: state.userOrders?.size || 10,
        number: state.userOrders?.number || 0,
        first: state.userOrders?.first || true,
        last: state.userOrders?.last || true,
        empty: state.userOrders?.empty || true
    })
);

export const selectUserOrdersList = createSelector(
    [selectUserOrdersPage],
    (orders) => {
        if (!orders.content || !Array.isArray(orders.content)) {
            return [];
        }

        return orders.content.map(order => {
            if (!order) return null;
            return {
                ...order,
                displayName: `#${order.orderCode || ''}`,
                statusDisplay: order.status ? (order.status.charAt(0) + order.status.slice(1).toLowerCase()) : '-',
                formattedAmount: typeof order.finalAmount === 'number' ? `$${order.finalAmount.toFixed(2)}` : '$0.00'
            };
        }).filter(Boolean);
    }
);

export const selectOrderStatistics = createSelector(
    [selectOrderState],
    (state) => state.orderStatistics
);

export const selectIsLoading = createSelector(
    [selectOrderState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectOrderState],
    (state) => state.error
);

// Pagination selectors
export const selectOrderPageInfo = createSelector(
    [selectOrdersPage],
    (orders) => ({
        totalPages: orders.totalPages,
        totalElements: orders.totalElements,
        size: orders.size,
        number: orders.number,
        first: orders.first,
        last: orders.last,
        empty: orders.empty,
        hasNext: !orders.last,
        hasPrevious: !orders.first
    })
);

export const selectUserOrderPageInfo = createSelector(
    [selectUserOrdersPage],
    (orders) => ({
        totalPages: orders.totalPages,
        totalElements: orders.totalElements,
        size: orders.size,
        number: orders.number,
        first: orders.first,
        last: orders.last,
        empty: orders.empty,
        hasNext: !orders.last,
        hasPrevious: !orders.first
    })
);

// Order information selectors
export const selectOrderById = createSelector(
    [selectOrdersList, (_: RootState, orderId: number) => orderId],
    (orders, orderId) => {
        const found = orders.find(o => o?.orderId === orderId);
        return found ? {
            ...found,
            formattedId: `ORD-${orderId}`
        } : null;
    }
);

export const selectOrderByCode = createSelector(
    [selectOrdersList, (_: RootState, orderCode: string) => orderCode],
    (orders, orderCode) => {
        const found = orders.find(o => o?.orderCode === orderCode);
        return found ? {
            ...found,
            formattedCode: orderCode.toUpperCase()
        } : null;
    }
);

// Status-based selectors
export const selectOrdersByStatus = createSelector(
    [selectOrdersList, (_: RootState, status: OrderStatus) => status],
    (orders, status) => {
        if (!orders || !Array.isArray(orders)) {
            return [];
        }

        return orders
            .filter(o => o?.status === status)
            .map(o => {
                if (!o) return null;
                return {
                    ...o,
                    statusDisplay: status.charAt(0) + status.slice(1).toLowerCase(),
                    statusCount: orders.filter(order => order?.status === status).length
                };
            }).filter(Boolean);
    }
);

export const selectOrderStatusCounts = createSelector(
    [selectOrdersList],
    (orders) => {
        if (!orders || !Array.isArray(orders)) {
            return [];
        }

        const statusCounts: { [key in OrderStatus]?: number } = {};

        orders.forEach(order => {
            if (order && order.status) {
                statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            }
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as OrderStatus,
            count,
            percentage: orders.length ? (count / orders.length * 100).toFixed(1) + '%' : '0%'
        }));
    }
);

// User-based selectors
export const selectOrdersByUser = createSelector(
    [selectOrdersList, (_: RootState, userId: number) => userId],
    (orders, userId) => {
        if (!orders || !Array.isArray(orders)) {
            return [];
        }

        return orders
            .filter(o => o?.userId === userId)
            .map(o => {
                if (!o) return null;
                return {
                    ...o,
                    userDisplayName: `User #${userId}`,
                    orderCount: orders.filter(order => order?.userId === userId).length
                };
            }).filter(Boolean);
    }
);

// Search and filter selectors
interface OrderFilters {
    status?: OrderStatus;
    userId?: number;
    dateRange?: { start: string; end: string };
    search?: string;
    paymentStatus?: PaymentStatus;
}

export const selectFilteredOrders = createSelector(
    [selectOrdersList, (_: RootState, filters: OrderFilters) => filters],
    (orders, filters) => {
        if (!orders || !Array.isArray(orders) || !filters) {
            return orders || [];
        }

        return orders.filter(order => {
            if (!order) return false;

            const matchesStatus = !filters.status || order.status === filters.status;

            const matchesUser = !filters.userId || order.userId === filters.userId;

            let matchesDateRange = true;
            if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
                const orderDate = new Date(order.createdAt).getTime();
                const startDate = new Date(filters.dateRange.start).getTime();
                const endDate = new Date(filters.dateRange.end).getTime();
                matchesDateRange = orderDate >= startDate && orderDate <= endDate;
            }

            const searchTerm = filters.search?.toLowerCase();
            const matchesSearch = !searchTerm ||
                (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm)) ||
                (order.userName && order.userName.toLowerCase().includes(searchTerm)) ||
                (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm));

            const matchesPaymentStatus = !filters.paymentStatus ||
                order.paymentStatus === filters.paymentStatus;

            return matchesStatus && matchesUser && matchesDateRange && matchesSearch && matchesPaymentStatus;
        });
    }
);

// Count selectors
export const selectOrdersCount = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Total: ${pageInfo.totalElements} orders`
    })
);

// Revenue selectors
export const selectTotalRevenue = createSelector(
    [selectOrdersList],
    (orders) => {
        if (!orders || !Array.isArray(orders)) {
            return {
                revenue: 0,
                formattedRevenue: '$0.00',
                orderCount: 0,
                averageOrderValue: 0
            };
        }

        const completedOrders = orders.filter(o =>
            o && (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CONFIRMED)
        );

        const total = completedOrders.reduce((sum, order) => sum + (order?.finalAmount || 0), 0);

        return {
            revenue: total,
            formattedRevenue: `$${total.toFixed(2)}`,
            orderCount: completedOrders.length,
            averageOrderValue: completedOrders.length ? total / completedOrders.length : 0
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

export const selectOrderOperationStatus = createSelector(
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

export const selectSortedOrders = createSelector(
    [
        selectOrdersList,
        (_: RootState, sortBy: keyof OrderSummaryDTO) => sortBy,
        (_: RootState, __: keyof OrderSummaryDTO, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (orders, sortBy, sortOrder) => {
        if (!orders || !Array.isArray(orders)) {
            return [];
        }

        return [...orders]
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
            .map((o, index) => {
                if (!o) return null;
                return {
                    ...o,
                    sortIndex: index + 1,
                    sortedBy: sortBy
                };
            }).filter(Boolean);
    }
);

// Empty state selector
export const selectIsOrdersEmpty = createSelector(
    [selectOrderPageInfo, selectOrdersList],
    (pageInfo, orders) => ({
        isEmpty: pageInfo.empty || !orders || orders.length === 0,
        message: pageInfo.empty ? 'No orders found' : 'Orders available'
    })
);

export const selectIsUserOrdersEmpty = createSelector(
    [selectUserOrderPageInfo, selectUserOrdersList],
    (pageInfo, orders) => ({
        isEmpty: pageInfo.empty || !orders || orders.length === 0,
        message: pageInfo.empty ? 'No orders found' : 'Orders available'
    })
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        isFirst: pageInfo.first,
        canNavigatePrevious: !pageInfo.first
    })
);

export const selectIsLastPage = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        isLast: pageInfo.last,
        canNavigateNext: !pageInfo.last
    })
);

export const selectCurrentPage = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        current: pageInfo.number,
        displayText: `Page ${pageInfo.number + 1} of ${pageInfo.totalPages}`
    })
);

export const selectPageSize = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        size: pageInfo.size,
        displayText: `Showing ${pageInfo.size} items per page`
    })
);

export const selectTotalPages = createSelector(
    [selectOrderPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalPages,
        displayText: `Total pages: ${pageInfo.totalPages}`
    })
);

// Date selectors
export const selectRecentOrders = createSelector(
    [selectOrdersList],
    (orders) => {
        if (!orders || !Array.isArray(orders)) {
            return [];
        }

        return [...orders]
            .sort((a, b) => {
                if (!a || !b) return 0;
                if (!a.createdAt || !b.createdAt) return 0;
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            })
            .slice(0, 5)
            .map(o => {
                if (!o) return null;
                if (!o.createdAt) return null;

                return {
                    ...o,
                    formattedCreatedAt: new Date(o.createdAt).toLocaleDateString(),
                    isRecent: new Date().getTime() - new Date(o.createdAt).getTime() < 24 * 60 * 60 * 1000
                };
            }).filter(Boolean);
    }
);

// Order items selectors
export const selectOrderItems = createSelector(
    [selectCurrentOrder],
    (order) => {
        if (!order || !order.items || !Array.isArray(order.items)) {
            return [];
        }

        return order.items.map(item => {
            if (!item) return null;

            return {
                ...item,
                displayName: `${item.productName || ''} - ${item.variantName || ''}`,
                formattedPrice: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '$0.00',
                formattedSubtotal: typeof item.subtotal === 'number' ? `$${item.subtotal.toFixed(2)}` : '$0.00'
            };
        }).filter(Boolean);
    }
);

export const selectTotalItems = createSelector(
    [selectOrderItems],
    (items) => {
        if (!items || !Array.isArray(items)) {
            return {
                count: 0,
                totalQuantity: 0,
                totalValue: 0,
                formattedTotalValue: '$0.00'
            };
        }

        return {
            count: items.length,
            totalQuantity: items.reduce((sum, item) => sum + (item?.quantity || 0), 0),
            totalValue: items.reduce((sum, item) => sum + (item?.subtotal || 0), 0),
            formattedTotalValue: `$${items.reduce((sum, item) => sum + (item?.subtotal || 0), 0).toFixed(2)}`
        };
    }
);

// Statistics selectors
export const selectOrdersStatistics = createSelector(
    [selectOrderStatistics],
    (statistics) => {
        if (!statistics) return null;

        return {
            ...statistics,
            formattedTotalRevenue: typeof statistics.totalRevenue === 'number' ?
                `$${statistics.totalRevenue.toFixed(2)}` : '$0.00',
            formattedAverageOrderValue: typeof statistics.averageOrderValue === 'number' ?
                `$${statistics.averageOrderValue.toFixed(2)}` : '$0.00',
            monthlyData: statistics.monthlyOrders?.map(month => ({
                ...month,
                formattedRevenue: typeof month.revenue === 'number' ?
                    `$${month.revenue.toFixed(2)}` : '$0.00'
            })) || []
        };
    }
);

export const selectRevenueByMonth = createSelector(
    [selectOrdersStatistics],
    (statistics) => {
        if (!statistics || !statistics.monthlyOrders) return [];

        return statistics.monthlyOrders.map(month => ({
            month: month.month,
            revenue: month.revenue || 0,
            formattedRevenue: typeof month.revenue === 'number' ?
                `$${month.revenue.toFixed(2)}` : '$0.00',
            count: month.count || 0
        })) || [];
    }
);

export const selectOrdersByMonth = createSelector(
    [selectOrdersStatistics],
    (statistics) => {
        if (!statistics || !statistics.monthlyOrders) return [];

        return statistics.monthlyOrders.map(month => ({
            month: month.month,
            count: month.count || 0,
            revenue: month.revenue || 0
        })) || [];
    }
);

// Shipping selectors
export const selectShippingDetails = createSelector(
    [selectCurrentOrder],
    (order) => {
        if (!order || !order.shippingAddress) return null;

        return {
            ...order.shippingAddress,
            fullAddress: `${order.shippingAddress.address || ''}, ${order.shippingAddress.ward || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.province || ''}`,
            contactInfo: `${order.shippingAddress.fullName || ''} - ${order.shippingAddress.phone || ''}`
        };
    }
);

// Payment selectors
export const selectPaymentDetails = createSelector(
    [selectCurrentOrder],
    (order) => {
        if (!order || !order.payment) return null;

        return {
            ...order.payment,
            statusDisplay: order.payment.status ?
                (order.payment.status.charAt(0) + order.payment.status.slice(1).toLowerCase()) :
                '-',
            formattedAmount: typeof order.payment.amount === 'number' ?
                `$${order.payment.amount.toFixed(2)}` : '$0.00',
            formattedCreatedAt: order.payment.createdAt ?
                new Date(order.payment.createdAt).toLocaleString() : '-',
            formattedUpdatedAt: order.payment.updatedAt ?
                new Date(order.payment.updatedAt).toLocaleString() : '-'
        };
    }
);