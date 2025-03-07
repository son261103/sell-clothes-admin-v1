import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    Download, Plus, Search, X, RefreshCw,
    Filter, ShoppingBag, Trash2,
} from 'lucide-react';

import OrderDataTable from '../../components/order/OrderDataTable';
import OrderStatusWorkflowPopup from '../../components/order/order-list/OrderStatusWorkflowPopup.tsx';
import { useOrders } from '../../hooks/orderHooks';
import { useUsers, useUserFinder } from '../../hooks/userHooks'; // Import the user hooks
import {
    OrderSummaryDTO,
    OrderPageRequest,
    OrderFilters,
    OrderStatus,
    UpdateOrderStatusDTO,
    PaymentStatus,
    PageResponse
} from '@/types';

// Extended type for user details in cache
interface CachedUserInfo {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    [key: string]: unknown;
}

// Debug info type
interface DebugInfo {
    dataFetched: boolean;
    lastError: string | null;
    ordersLoaded: boolean;
    ordersCount: number;
    statusUpdateResponse?: { success: boolean };
    userDetails?: Record<number, CachedUserInfo>;
}

interface IProps {
    initialPage?: number;
    initialPageSize?: number;
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    order: OrderSummaryDTO | null;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({
          isOpen,
          order,
          onCancel,
          onConfirm
      }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Xác nhận xóa đơn hàng
                                </h3>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn xóa đơn hàng <span className="font-medium text-gray-900 dark:text-gray-100">{order.orderCode || `ORD-${order.orderId}`}</span>?
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Xác nhận xóa
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderListPage: React.FC<IProps> = ({
                                             initialPage = 0,
                                             initialPageSize = 10
                                         }) => {
    const navigate = useNavigate();

    // Debug State
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({
        dataFetched: false,
        lastError: null,
        ordersLoaded: false,
        ordersCount: 0,
        userDetails: {}
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | ''>('');
    const [dateRange, setDateRange] = useState({start: '', end: ''});
    const [sortBy, setSortBy] = useState('orderId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // User information cache
    const [userInfoCache, setUserInfoCache] = useState<Record<number, CachedUserInfo>>({});

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [shouldFetchData, setShouldFetchData] = useState(true);

    // Delete confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<OrderSummaryDTO | null>(null);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // Status workflow popup state
    const [showStatusWorkflow, setShowStatusWorkflow] = useState(false);
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<OrderSummaryDTO | null>(null);

    // Hooks
    const {
        ordersPage,
        isLoading,
        error,
        fetchAllOrders,
        deleteOrder,
        updateOrderStatus
    } = useOrders();

    // Use the users hook to get user data directly
    const { usersList } = useUsers();
    const { fetchUserById } = useUserFinder();

    // Fallback for empty PageResponse
    const emptyPageResponse: PageResponse<OrderSummaryDTO> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: true
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch user information for orders
    const fetchUserInfo = useCallback(async (orders: OrderSummaryDTO[]) => {
        if (!orders || orders.length === 0) return;

        // Filter out orders where we already have user info
        const ordersNeedingUserInfo = orders.filter(order =>
            order.userId && !userInfoCache[order.userId]
        );

        if (ordersNeedingUserInfo.length === 0) return;

        console.log(`Fetching user info for ${ordersNeedingUserInfo.length} orders`);

        // Create a copy of the current cache
        const newUserInfo = { ...userInfoCache };

        // For each order that needs user info
        for (const order of ordersNeedingUserInfo) {
            if (!order.userId) continue;

            try {
                // Call the API to fetch the user - the hook returns true/false, not user data
                // We'll need to handle this differently
                await fetchUserById(order.userId);

                // Since we don't get user data directly, we'll use what we have in the order
                // or try to find the user in usersList
                const userFromList = usersList?.find(user => user.userId === order.userId);

                if (userFromList) {
                    newUserInfo[order.userId] = {
                        userId: order.userId,
                        fullName: userFromList.fullName || 'Khách hàng',
                        email: userFromList.email || 'Không có email',
                        phone: userFromList.phone || 'Không có SĐT'
                    };
                    console.log(`Found user ${order.userId} in usersList:`, userFromList);
                } else {
                    // If we can't find the user, use what we have in the order
                    newUserInfo[order.userId] = {
                        userId: order.userId,
                        fullName: order.userName || 'Khách hàng',
                        email: order.userEmail || 'Không có email',
                        phone: order.userPhone || 'Không có SĐT'
                    };
                    console.log(`Created placeholder for user ${order.userId}`);
                }
            } catch (error) {
                console.error(`Error fetching user with ID ${order.userId}:`, error);
            }
        }

        // Update the cache with new user info
        setUserInfoCache(newUserInfo);

        // Update debug info
        setDebugInfo(prev => ({
            ...prev,
            userDetails: newUserInfo
        }));

        return newUserInfo;
    }, [fetchUserById, userInfoCache, usersList]);

    // Process orders data to ensure all fields are available
    const processOrdersData = useCallback((orders: PageResponse<OrderSummaryDTO> | null): PageResponse<OrderSummaryDTO & { totalItems?: number }> => {
        if (!orders || !orders.content) return emptyPageResponse as PageResponse<OrderSummaryDTO & { totalItems?: number }>;

        const processedContent = orders.content.map((order: OrderSummaryDTO) => {
            // Get user info from cache if available
            const userInfo = order.userId ? userInfoCache[order.userId] : null;

            // Log the available data for debugging
            console.log(`Processing order ${order.orderId} with userInfo:`,
                userInfo ? 'Available' : 'Not available',
                userInfo ? `(${userInfo.fullName})` : '');

            // Create processed order with enhanced information
            const processedOrder: OrderSummaryDTO & { totalItems?: number } = {
                ...order,
                orderCode: order.orderCode || `${order.orderId}`,
                // Use user info from cache if available, otherwise use defaults from order
                userName: userInfo?.fullName || order.userName || 'Khách hàng',
                userEmail: userInfo?.email || order.userEmail || 'Không có email',
                userPhone: userInfo?.phone || order.userPhone || 'Không có SĐT',
                finalAmount: order.finalAmount || 0,
                itemCount: order.itemCount || 0,
                // Add totalItems property
                totalItems: order.itemCount || 0
            };

            return processedOrder;
        });

        return {
            ...orders,
            content: processedContent
        };
    }, [userInfoCache]);

    // Fetch data with filters
    const fetchData = useCallback(async () => {
        if (!shouldFetchData) return;

        // Set debugging info
        setDebugInfo(prev => ({
            ...prev,
            dataFetched: false,
            lastError: null
        }));

        const pageRequest: OrderPageRequest = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: OrderFilters = {};

        if (debouncedSearchTerm?.trim()) {
            filters.search = debouncedSearchTerm.trim();
        }
        if (selectedStatus !== '') {
            filters.status = selectedStatus;
        }
        if (selectedPaymentStatus !== '') {
            filters.paymentStatus = selectedPaymentStatus;
        }
        if (dateRange.start) {
            filters.startDate = dateRange.start;
        }
        if (dateRange.end) {
            filters.endDate = dateRange.end;
        }

        try {
            setShouldFetchData(false);
            console.log("Fetching orders with filters:", filters);
            const result = await fetchAllOrders({...pageRequest, filters});

            // If we got orders, fetch user information
            if (result && ordersPage?.content?.length > 0) {
                await fetchUserInfo(ordersPage.content);
            }

            setRefreshCounter(prev => prev + 1);

            // Update debug info on success
            setDebugInfo(prev => ({
                ...prev,
                dataFetched: true,
                ordersLoaded: result && ordersPage?.content?.length > 0,
                ordersCount: ordersPage?.content?.length || 0
            }));

            return result;
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Update debug info on error
            setDebugInfo(prev => ({
                ...prev,
                dataFetched: true,
                lastError: error instanceof Error ? error.message : String(error),
                ordersLoaded: false
            }));
            // Set to fetch again after error
            setTimeout(() => setShouldFetchData(true), 3000);
            return false;
        }
    }, [
        shouldFetchData,
        currentPage,
        pageSize,
        selectedStatus,
        selectedPaymentStatus,
        debouncedSearchTerm,
        dateRange,
        sortBy,
        sortDirection,
        fetchAllOrders,
        ordersPage,
        fetchUserInfo
    ]);

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Main data fetching effect
    useEffect(() => {
        if (shouldFetchData) {
            fetchData();
        }
    }, [fetchData, shouldFetchData]);

    // Update debug info when orders change
    useEffect(() => {
        if (ordersPage) {
            setDebugInfo(prev => ({
                ...prev,
                ordersLoaded: !!ordersPage.content && ordersPage.content.length > 0,
                ordersCount: ordersPage.content?.length || 0
            }));
        }
    }, [ordersPage]);

    // Set shouldFetchData to true when filters change
    useEffect(() => {
        setShouldFetchData(true);
    }, [
        currentPage,
        pageSize,
        debouncedSearchTerm,
        selectedStatus,
        selectedPaymentStatus,
        dateRange,
        sortBy,
        sortDirection
    ]);

    // Click outside handler for filter menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const filterMenu = document.getElementById('filter-menu');
            const filterButton = document.getElementById('filter-button');
            if (filterMenu && filterButton &&
                !filterMenu.contains(event.target as Node) &&
                !filterButton.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handlers
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setShouldFetchData(true);
        setRefreshCounter(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const handleStatusChange = async (id: number, newStatus: OrderStatus) => {
        if (!ordersPage?.content) return;

        const orderToUpdate = ordersPage.content.find(p => p.orderId === id);
        if (!orderToUpdate) return;

        // Clear previous error
        setStatusUpdateError(null);

        const statusData: UpdateOrderStatusDTO = {
            status: newStatus,
            note: `Status changed to ${newStatus} by admin`  // Adding a note might help with validation
        };

        try {
            console.log(`Updating order ${id} status to ${newStatus}`, statusData);
            // The hook returns true/false, not a response object
            const success = await updateOrderStatus(id, statusData);

            console.log('Status update result:', success ? 'Success' : 'Failed');

            // Store the result for debugging
            setDebugInfo(prev => ({
                ...prev,
                statusUpdateResponse: { success }
            }));

            if (success) {
                setShouldFetchData(true);
            } else {
                setStatusUpdateError("Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setStatusUpdateError(errorMessage);

            // Show error to user
            alert(`Không thể cập nhật trạng thái: ${errorMessage}`);
        }
    };

    // const handleOpenStatusWorkflow = (order: OrderSummaryDTO) => {
    //     setSelectedOrderForStatus(order);
    //     setShowStatusWorkflow(true);
    // };

    const handleCloseStatusWorkflow = () => {
        setShowStatusWorkflow(false);
        setSelectedOrderForStatus(null);
    };

    const handleStatusChangeFromWorkflow = (newStatus: OrderStatus) => {
        if (selectedOrderForStatus) {
            handleStatusChange(selectedOrderForStatus.orderId, newStatus);
            setShowStatusWorkflow(false);
            setSelectedOrderForStatus(null);
        }
    };

    const handleDeleteClick = (id: number) => {
        if (!ordersPage?.content) return;

        const order = ordersPage.content.find(p => p.orderId === id);
        if (!order) return;

        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            const success = await deleteOrder(orderToDelete.orderId);

            if (success) {
                setShouldFetchData(true);
                setShowDeleteModal(false);
                setOrderToDelete(null);
            } else {
                alert("Không thể xóa đơn hàng!");
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert(`Không thể xóa đơn hàng: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setOrderToDelete(null);
    };

    const handleDeleteOrder = async (id: number) => {
        handleDeleteClick(id);
    };

    const handleViewOrder = (order: OrderSummaryDTO) => {
        // Navigate to the detail page with the orderId
        if (order && order.orderId) {
            navigate(`/admin/orders/detail/${order.orderId}`);
        } else {
            console.error('Cannot navigate to order detail - missing orderId', order);
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        if (field === 'status') {
            setSelectedStatus(value === '' ? '' : value as OrderStatus);
        } else if (field === 'paymentStatus') {
            setSelectedPaymentStatus(value === '' ? '' : value as PaymentStatus);
        } else if (field === 'startDate') {
            setDateRange(prev => ({...prev, start: value}));
        } else if (field === 'endDate') {
            setDateRange(prev => ({...prev, end: value}));
        }
        setCurrentPage(0);
    };

    const handleSortChange = (sortField: string) => {
        setSortBy(sortField);
        setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedPaymentStatus('');
        setDateRange({start: '', end: ''});
        setSortBy('orderId');
        setSortDirection('desc');
        setCurrentPage(0);
        setIsFilterMenuOpen(false);
        setShouldFetchData(true);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting orders data...');
    };

    // Check if data should be displaying but isn't
    const hasLoadingIssue = !isLoading && debugInfo.dataFetched && !debugInfo.ordersLoaded;

    // Process orders data before passing to the table
    const processedOrdersPage = processOrdersData(ordersPage);

    // Render filter menu
    const renderFilterMenu = () => (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40"
                style={{zIndex: 40}}
                onClick={() => setIsFilterMenuOpen(false)}
            />
            <div
                id="filter-menu"
                className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 md:w-72 mt-2 p-4 bg-white dark:bg-secondary rounded-xl shadow-lg"
                style={{
                    zIndex: 50,
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}
            >
                <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Trạng thái đơn hàng
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedStatus}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value={OrderStatus.PENDING}>Chờ xử lý</option>
                            <option value={OrderStatus.PROCESSING}>Đang xử lý</option>
                            <option value={OrderStatus.SHIPPING}>Đang giao hàng</option>
                            <option value={OrderStatus.CONFIRMED}>Đã xác nhận</option>
                            <option value={OrderStatus.COMPLETED}>Hoàn thành</option>
                            <option value={OrderStatus.DELIVERY_FAILED}>Giao hàng thất bại</option>
                            <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Trạng thái thanh toán
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedPaymentStatus}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value={PaymentStatus.PENDING}>Chờ thanh toán</option>
                            <option value={PaymentStatus.COMPLETED}>Đã thanh toán</option>
                            <option value={PaymentStatus.FAILED}>Thanh toán thất bại</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Khoảng thời gian
                        </label>
                        <div className="space-y-2">
                            <input
                                type="date"
                                placeholder="Từ ngày"
                                className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                value={dateRange.start}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                            <input
                                type="date"
                                placeholder="Đến ngày"
                                className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                value={dateRange.end}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Sắp xếp theo
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="orderId">ID</option>
                            <option value="orderCode">Mã đơn hàng</option>
                            <option value="userName">Tên khách hàng</option>
                            <option value="createdAt">Ngày tạo</option>
                            <option value="finalAmount">Tổng tiền</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={clearFilters}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-primary"/> Quản lý đơn hàng
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý và xử lý đơn hàng từ khách hàng
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/orders/create"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5"/>
                        <span>Tạo đơn hàng</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-secondary dark:text-highlight"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng..."
                                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setShouldFetchData(true);
                                    }}
                                >
                                    <X className="w-4 h-4 text-secondary dark:text-highlight hover:text-accent dark:hover:text-textLight transition-colors"/>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                                onClick={handleRefresh}
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                    isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                <span className="hidden sm:inline">Làm mới</span>
                            </button>

                            <button
                                id="filter-button"
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                    isFilterMenuOpen ? 'bg-gray-50 dark:bg-gray-700 border-primary dark:border-primary' : ''
                                }`}
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            >
                                <Filter className="w-3.5 h-3.5"/>
                                <span className="hidden sm:inline">Bộ lọc</span>
                                {(selectedStatus !== '' || selectedPaymentStatus !== '' || dateRange.start || dateRange.end) && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        {[
                                            selectedStatus !== '',
                                            selectedPaymentStatus !== '',
                                            dateRange.start,
                                            dateRange.end
                                        ].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleExport}
                                className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5"/>
                                <span className="hidden sm:inline">Xuất danh sách</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Menu */}
                {isFilterMenuOpen && renderFilterMenu()}
            </div>

            {/* Status Update Error */}
            {statusUpdateError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-red-800 dark:text-red-400">
                        Lỗi cập nhật trạng thái
                    </h3>
                    <div className="text-sm text-red-800 dark:text-red-400">
                        {statusUpdateError}
                    </div>
                </div>
            )}

            {/* Debug info */}
            {(error || hasLoadingIssue) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-yellow-800 dark:text-yellow-400">
                        Thông tin trạng thái
                    </h3>
                    <div className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                        <p>Loading state: {isLoading ? 'true' : 'false'}</p>
                        <p>Data fetched: {debugInfo.dataFetched ? 'true' : 'false'}</p>
                        <p>Orders loaded: {debugInfo.ordersLoaded ? 'true' : 'false'}</p>
                        <p>Orders count: {debugInfo.ordersCount}</p>
                        <p>Users cached: {Object.keys(userInfoCache).length}</p>
                        {debugInfo.lastError && <p>Last error: {debugInfo.lastError}</p>}
                        {error && <p>Current error: {error}</p>}
                        <button
                            onClick={handleRefresh}
                            className="px-3 py-1 mt-2 bg-yellow-200 dark:bg-yellow-800 rounded text-yellow-800 dark:text-yellow-200"
                        >
                            Thử tải lại
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Order Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <OrderDataTable
                        orders={processedOrdersPage}
                        onDeleteOrder={handleDeleteOrder}
                        onViewOrder={handleViewOrder}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        forceRefresh={refreshCounter}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                order={orderToDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            {/* Status Workflow Popup */}
            {selectedOrderForStatus && (
                <OrderStatusWorkflowPopup
                    isOpen={showStatusWorkflow}
                    currentStatus={selectedOrderForStatus.status}
                    onClose={handleCloseStatusWorkflow}
                    onStatusChange={handleStatusChangeFromWorkflow}
                />
            )}
        </div>
    );
};

export default OrderListPage;