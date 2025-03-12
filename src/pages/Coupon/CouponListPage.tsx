import CouponDataTable from '../../components/coupon/CouponDataTable';
import {useCoupons, useCouponStatusFilters, useCouponTypeFilters, useCouponStatistics} from '../../hooks/couponHooks';
import {
    CouponResponseDTO,
    CouponPageRequest,
    CouponFilters,
    CouponType,
    PageResponse
} from '@/types';
import React, {useState, useEffect, useCallback} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {
    Download, Plus, Search, X, RefreshCw,
    Filter, Tag, Trash2, Percent, DollarSign,
    CheckCircle, XCircle
} from 'lucide-react';

// Debug info type
interface DebugInfo {
    dataFetched: boolean;
    lastError: string | null;
    couponsLoaded: boolean;
    couponsCount: number;
    statusUpdateResponse?: { success: boolean };
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    coupon: CouponResponseDTO | null;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({
          isOpen,
          coupon,
          onCancel,
          onConfirm
      }) => {
    if (!isOpen || !coupon) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div
                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400"/>
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Xác nhận xóa mã giảm giá
                                </h3>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn xóa mã giảm giá <span
                                        className="font-medium text-gray-900 dark:text-gray-100">{coupon.code}</span>?
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

// Status Toggle Confirmation Modal
const StatusToggleConfirmationModal: React.FC<{
    isOpen: boolean;
    coupon: CouponResponseDTO | null;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({
          isOpen,
          coupon,
          onCancel,
          onConfirm
      }) => {
    if (!isOpen || !coupon) return null;

    const actionText = coupon.status ? "vô hiệu hóa" : "kích hoạt";
    const statusText = coupon.status ? "không hoạt động" : "hoạt động";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div
                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                {coupon.status ? <XCircle className="h-6 w-6 text-blue-600 dark:text-blue-400"/> :
                                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400"/>}
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Xác nhận {actionText} mã giảm giá
                                </h3>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn {actionText} mã giảm giá <span
                                        className="font-medium text-gray-900 dark:text-gray-100">{coupon.code}</span>?
                                        Mã giảm giá sẽ {statusText} sau khi xác nhận.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Xác nhận
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


interface IProps {
    initialPage?: number;
    initialPageSize?: number;
}

const CouponListPage: React.FC<IProps> = ({
                                              initialPage = 0,
                                              initialPageSize = 10
                                          }) => {
    const navigate = useNavigate();

    // Debug State
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({
        dataFetched: false,
        lastError: null,
        couponsLoaded: false,
        couponsCount: 0
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'expired' | 'fullyUsed' | ''>('');
    const [selectedType, setSelectedType] = useState<CouponType | ''>('');
    const [dateRange, setDateRange] = useState({start: '', end: ''});
    const [sortBy, setSortBy] = useState('couponId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [shouldFetchData, setShouldFetchData] = useState(true);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<CouponResponseDTO | null>(null);
    const [showStatusToggleModal, setShowStatusToggleModal] = useState(false);
    const [couponToToggle, setCouponToToggle] = useState<CouponResponseDTO | null>(null);

    // Hooks
    const {
        couponsPage,
        isLoading,
        error,
        fetchAllCoupons,
        deleteCoupon,
        toggleCouponStatus
    } = useCoupons() as {
        couponsPage: PageResponse<CouponResponseDTO> | null;
        isLoading: boolean;
        error: string | null;
        fetchAllCoupons: (pageRequest: CouponPageRequest) => Promise<PageResponse<CouponResponseDTO> | boolean>;
        deleteCoupon: (id: number) => Promise<boolean>;
        toggleCouponStatus: (id: number) => Promise<boolean>;
    };

    const {statusCounts} = useCouponStatusFilters() as {
        statusCounts: { active: number; inactive: number; expired: number; fullyUsed: number } | null
    };
    const {typeCounts} = useCouponTypeFilters() as {
        typeCounts: { percentage: number; fixedAmount: number } | null
    };
    const {
        couponsCount,
        fetchStatistics
    } = useCouponStatistics() as {
        couponsCount: { total: number; displayText: string };
        fetchStatistics: () => Promise<boolean>;
    };

    // Create a default empty pagination object for when couponsPage is null
    const emptyCouponsPage: PageResponse<CouponResponseDTO> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: true
    };

    // Fetch statistics when component mounts
    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch data with filters
    const fetchData = useCallback(async () => {
        if (!shouldFetchData) return;

        // Set debugging info
        setDebugInfo(prev => ({
            ...prev,
            dataFetched: false,
            lastError: null
        }));

        const pageRequest: CouponPageRequest = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: CouponFilters = {};

        if (debouncedSearchTerm?.trim()) {
            filters.code = debouncedSearchTerm.trim();
        }

        if (selectedStatus === 'active') {
            filters.status = true;
            filters.isExpired = false;
        } else if (selectedStatus === 'inactive') {
            filters.status = false;
        } else if (selectedStatus === 'expired') {
            filters.isExpired = true;
        }

        if (dateRange.start) {
            filters.startDate = dateRange.start;
        }
        if (dateRange.end) {
            filters.endDate = dateRange.end;
        }

        try {
            setShouldFetchData(false);
            console.log("Fetching coupons with filters:", filters);

            // Using the correct page request with filters
            const result = await fetchAllCoupons({...pageRequest, filters});
            console.log("API response:", result);

            // Handle both boolean and PageResponse responses safely
            if (typeof result === 'boolean') {
                // If the result is a boolean, set couponsLoaded based on that value
                setDebugInfo(prev => ({
                    ...prev,
                    dataFetched: true,
                    couponsLoaded: result, // true if successful, false if failed
                    couponsCount: 0
                }));
            } else {
                // If result is a PageResponse object, access content safely
                setDebugInfo(prev => ({
                    ...prev,
                    dataFetched: true,
                    couponsLoaded: result && Array.isArray(result.content) ? result.content.length > 0 : false,
                    couponsCount: result && Array.isArray(result.content) ? result.content.length : 0
                }));
            }

            setRefreshCounter(prev => prev + 1);

            // Fetch statistics after successful data load
            try {
                await fetchStatistics();
            } catch (statsError) {
                console.error('Failed to load statistics:', statsError);
            }

            return result;
        } catch (error) {
            console.error('Error fetching coupons:', error);

            // Update debug info on error
            setDebugInfo(prev => ({
                ...prev,
                dataFetched: true,
                lastError: error instanceof Error ? error.message : String(error),
                couponsLoaded: false
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
        debouncedSearchTerm,
        dateRange,
        sortBy,
        sortDirection,
        fetchAllCoupons,
        fetchStatistics
    ]);

    // Main data fetching effect
    useEffect(() => {
        if (shouldFetchData) {
            fetchData();
        }
    }, [fetchData, shouldFetchData]);

    // Update debug info when coupons change
    useEffect(() => {
        if (couponsPage && couponsPage.content) {
            setDebugInfo(prev => ({
                ...prev,
                couponsLoaded: couponsPage.content && couponsPage.content.length > 0,
                couponsCount: couponsPage.content?.length || 0
            }));
        }
    }, [couponsPage]);

    // Set shouldFetchData to true when filters change
    useEffect(() => {
        setShouldFetchData(true);
    }, [
        currentPage,
        pageSize,
        debouncedSearchTerm,
        selectedStatus,
        selectedType,
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
        setStatusUpdateError(null);
        await fetchStatistics();
        setRefreshCounter(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const handleToggleClick = (id: number) => {
        if (!couponsPage?.content) return;

        const coupon = couponsPage.content.find(p => p.couponId === id);
        if (!coupon) return;

        setCouponToToggle(coupon);
        setShowStatusToggleModal(true);
    };

    const handleConfirmToggle = async () => {
        if (!couponToToggle) return;

        // Clear previous error
        setStatusUpdateError(null);

        try {
            console.log(`Toggling coupon ${couponToToggle.couponId} status from ${couponToToggle.status} to ${!couponToToggle.status}`);
            const success = await toggleCouponStatus(couponToToggle.couponId);

            console.log('Status update result:', success ? 'Success' : 'Failed');

            // Store the result for debugging
            setDebugInfo(prev => ({
                ...prev,
                statusUpdateResponse: {success}
            }));

            if (success) {
                setShouldFetchData(true);
                setShowStatusToggleModal(false);
                setCouponToToggle(null);
            } else {
                setStatusUpdateError("Không thể thay đổi trạng thái mã giảm giá");
            }
        } catch (error) {
            console.error('Error toggling coupon status:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setStatusUpdateError(errorMessage);

            // Show error to user
            alert(`Lỗi: ${errorMessage}`);
        }
    };

    const handleCancelToggle = () => {
        setShowStatusToggleModal(false);
        setCouponToToggle(null);
    };

    const handleDeleteClick = (id: number) => {
        if (!couponsPage?.content) return;

        const coupon = couponsPage.content.find(p => p.couponId === id);
        if (!coupon) return;

        setCouponToDelete(coupon);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!couponToDelete) return;

        try {
            const success = await deleteCoupon(couponToDelete.couponId);

            if (success) {
                setShouldFetchData(true);
                setShowDeleteModal(false);
                setCouponToDelete(null);
                await fetchStatistics(); // Refresh statistics after delete
            } else {
                alert("Không thể xóa mã giảm giá!");
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert(`Lỗi: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setCouponToDelete(null);
    };

    const handleViewCoupon = (coupon: CouponResponseDTO) => {
        navigate(`/admin/marketing/coupons/detail/${coupon.couponId}`);
    };

    const handleFilterChange = (field: string, value: string) => {
        if (field === 'status') {
            setSelectedStatus(value as '' | 'active' | 'inactive' | 'expired' | 'fullyUsed');
        } else if (field === 'type') {
            setSelectedType(value === '' ? '' : value as CouponType);
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
        setSelectedType('');
        setDateRange({start: '', end: ''});
        setSortBy('couponId');
        setSortDirection('desc');
        setCurrentPage(0);
        setIsFilterMenuOpen(false);
        setShouldFetchData(true);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting coupons data...');
        alert('Tính năng xuất dữ liệu đang được phát triển!');
    };

    // Check if data should be displaying but isn't
    const hasLoadingIssue = !isLoading && debugInfo.dataFetched && !debugInfo.couponsLoaded;

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
                            Trạng thái
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedStatus}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                            <option value="expired">Hết hạn</option>
                            <option value="fullyUsed">Đã dùng hết</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Loại
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedType}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">Tất cả loại</option>
                            <option value={CouponType.PERCENTAGE}>Phần trăm</option>
                            <option value={CouponType.FIXED_AMOUNT}>Số tiền cố định</option>
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
                            <option value="couponId">ID</option>
                            <option value="code">Mã giảm giá</option>
                            <option value="type">Loại</option>
                            <option value="value">Giá trị</option>
                            <option value="startDate">Ngày bắt đầu</option>
                            <option value="endDate">Ngày kết thúc</option>
                            <option value="usedCount">Số lần đã dùng</option>
                        </select>
                    </div>

                    {/* Sort Direction */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Thứ tự sắp xếp
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={sortDirection}
                            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="asc">Tăng dần</option>
                            <option value="desc">Giảm dần</option>
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
                        <Tag className="w-6 h-6 text-primary"/> Quản lý mã giảm giá
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Tạo và quản lý các mã giảm giá cho khách hàng
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/marketing/coupons/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5"/>
                        <span>Tạo mã giảm giá</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Tag className="h-5 w-5 text-primary"/>
                            </div>
                            <div>
                                <p className="text-sm text-secondary dark:text-highlight">Tổng số mã giảm giá</p>
                                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">
                                    {couponsCount ? couponsCount.total : 0}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <CheckCircle className="h-5 w-5 text-green-600"/>
                            </div>
                            <div>
                                <p className="text-sm text-secondary dark:text-highlight">Đang hoạt động</p>
                                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">{statusCounts?.active || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Percent className="h-5 w-5 text-blue-600"/>
                            </div>
                            <div>
                                <p className="text-sm text-secondary dark:text-highlight">Mã phần trăm</p>
                                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">{typeCounts?.percentage || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <DollarSign className="h-5 w-5 text-purple-600"/>
                            </div>
                            <div>
                                <p className="text-sm text-secondary dark:text-highlight">Mã số tiền cố định</p>
                                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">{typeCounts?.fixedAmount || 0}</h3>
                            </div>
                        </div>
                    </div>
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
                                placeholder="Tìm kiếm mã giảm giá..."
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
                                {(selectedStatus !== '' || selectedType !== '' || dateRange.start || dateRange.end) && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        {[
                                            selectedStatus !== '',
                                            selectedType !== '',
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

            {/* Error message with retry option if data fails to load */}
            {hasLoadingIssue && error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex justify-between items-center">
                    <div className="text-sm text-red-800 dark:text-red-400">
                        Đã xảy ra lỗi khi tải dữ liệu mã giảm giá. Vui lòng thử lại.
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-800/50 dark:hover:bg-red-800 rounded text-red-800 dark:text-red-200 text-sm transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Coupon Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <CouponDataTable
                        coupons={couponsPage || emptyCouponsPage}
                        onDeleteCoupon={handleDeleteClick}
                        onViewCoupon={handleViewCoupon}
                        onToggleStatus={handleToggleClick}
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
                coupon={couponToDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            {/* Status Toggle Confirmation Modal */}
            <StatusToggleConfirmationModal
                isOpen={showStatusToggleModal}
                coupon={couponToToggle}
                onCancel={handleCancelToggle}
                onConfirm={handleConfirmToggle}
            />
        </div>
    );
};

export default CouponListPage;