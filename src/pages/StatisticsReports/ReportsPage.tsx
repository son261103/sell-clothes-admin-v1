import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2,
    FileText,
    Download,
    Filter,
    X,
    RefreshCw,
    Printer,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    CreditCard,
    ShoppingBag,
    Users,
    BoxSelect
} from 'lucide-react';
import { useOrderStatistics, useOrders } from '../../hooks/orderHooks';
import { useProducts } from '../../hooks/productHooks';
import { useUsers } from '../../hooks/userHooks';
import { OrderStatus, PaymentStatus } from '@/types';

// Chart components
import RevenueByPeriodChart from '../../components/reports/RevenueByPeriodChart';
import OrderStatusPieChart from '../../components/reports/OrderStatusPieChart';
import SalesBarChart from '../../components/reports/SalesBarChart';
import ProductCategoryChart from '../../components/reports/ProductCategoryChart';

// Date utilities
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getStartOfMonth = (): string => {
    const date = new Date();
    date.setDate(1);
    return formatDate(date);
};

const getCurrentDate = (): string => {
    return formatDate(new Date());
};

// Report types
type ReportType = 'revenue' | 'orders' | 'products' | 'customers';

// Report timeframes
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Report file formats
type FileFormat = 'csv' | 'excel' | 'pdf';

// Main component
const ReportsPage: React.FC = () => {
    // State for report configuration
    const [reportType, setReportType] = useState<ReportType>('revenue');
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
    const [startDate, setStartDate] = useState(getStartOfMonth());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [exportFormat, setExportFormat] = useState<FileFormat>('excel');
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Filter state
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

    // Sorting state
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Expanded sections
    const [expandedSections, setExpandedSections] = useState({
        overview: true,
        charts: true,
        tables: true
    });

    // Data hooks
    const {
        orderStatistics,
        fetchStatistics,
        isLoading: isLoadingStats
    } = useOrderStatistics();

    const {
        productsPage,
        fetchAllProducts,
        isLoading: isLoadingProducts
    } = useProducts();

    const {
        ordersPage,
        fetchAllOrders,
        isLoading: isLoadingOrders
    } = useOrders();

    const {
        usersList,
        fetchAllUsers,
        isLoading: isLoadingUsers
    } = useUsers();

    // Initial data loading
    useEffect(() => {
        const loadData = async () => {
            const statsPromise = fetchStatistics();
            const ordersPromise = fetchAllOrders();
            const productsPromise = fetchAllProducts();
            const usersPromise = fetchAllUsers();

            try {
                await Promise.all([
                    statsPromise,
                    ordersPromise,
                    productsPromise,
                    usersPromise
                ]);
            } catch (error) {
                console.error("Error loading report data:", error);
            }
        };

        loadData();
    }, [fetchStatistics, fetchAllOrders, fetchAllProducts, fetchAllUsers]);

    // Change timeframe and update date range
    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        switch (timeFrame) {
            case 'daily':
                // Today
                setStartDate(formatDate(now));
                setEndDate(formatDate(now));
                break;
            case 'weekly': {
                // Last 7 days
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                setStartDate(formatDate(weekAgo));
                setEndDate(formatDate(now));
                break;
            }
            case 'monthly':
                // Current month
                setStartDate(formatDate(startOfMonth));
                setEndDate(formatDate(now));
                break;
            case 'yearly':
                // Current year
                setStartDate(formatDate(startOfYear));
                setEndDate(formatDate(now));
                break;
            case 'custom':
                // Keep existing custom range
                break;
        }
    }, [timeFrame]);

    // Handle refresh button click
    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await Promise.all([
                fetchStatistics(),
                fetchAllOrders(),
                fetchAllProducts(),
                fetchAllUsers()
            ]);
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
        }
    };

    // Handle export
    const handleExport = () => {
        setIsExporting(true);

        // Simulate export process
        setTimeout(() => {
            setIsExporting(false);
            // In real implementation, this would generate and download the report
            alert(`Đã xuất báo cáo ${reportType} theo định dạng ${exportFormat}`);
        }, 1500);
    };

    // Handle print
    const handlePrint = () => {
        setIsPrinting(true);

        // Simulate print process
        setTimeout(() => {
            setIsPrinting(false);
            window.print();
        }, 500);
    };

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Handle sort change
    const handleSortChange = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Check if all data is loaded
    const isLoading = isLoadingStats || isLoadingOrders || isLoadingProducts || isLoadingUsers || isRefreshing;

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!orderStatistics) {
            return {
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                totalProducts: 0,
                totalCustomers: 0
            };
        }

        const productsCount = productsPage?.totalElements || 0;
        const customersCount = usersList?.length || 0;

        return {
            totalRevenue: orderStatistics.totalRevenue || 0,
            totalOrders: orderStatistics.totalOrders || 0,
            averageOrderValue: orderStatistics.averageOrderValue || 0,
            totalProducts: productsCount,
            totalCustomers: customersCount
        };
    }, [orderStatistics, productsPage, usersList]);

    // Determine report title based on selected type and timeframe
    const reportTitle = useMemo(() => {
        const typeText =
            reportType === 'revenue' ? 'Doanh thu' :
                reportType === 'orders' ? 'Đơn hàng' :
                    reportType === 'products' ? 'Sản phẩm' : 'Khách hàng';

        const timeText =
            timeFrame === 'daily' ? 'Hôm nay' :
                timeFrame === 'weekly' ? '7 ngày qua' :
                    timeFrame === 'monthly' ? 'Tháng này' :
                        timeFrame === 'yearly' ? 'Năm nay' :
                            'Tùy chỉnh';

        return `Báo cáo ${typeText} - ${timeText}`;
    }, [reportType, timeFrame]);

    return (
        <div className="space-y-6 pb-10">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary"/> Báo cáo
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Tạo và xuất báo cáo chi tiết
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
                        className={`h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isRefreshing}
                        aria-label="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-9 px-3 flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            showFilters ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">Bộ lọc</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className={`h-9 px-3 flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            isPrinting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isPrinting}
                    >
                        <Printer className="h-4 w-4" />
                        <span className="text-sm">In báo cáo</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className={`h-9 px-3 flex items-center gap-1.5 rounded-md bg-primary text-white hover:bg-primary/90 ${
                            isExporting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">{isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}</span>
                    </button>
                </div>
            </div>

            {/* Report Configuration */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-textDark dark:text-textLight mb-4">
                    Cấu hình báo cáo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Report Type */}
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                            Loại báo cáo
                        </label>
                        <select
                            id="report-type"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                        >
                            <option value="revenue">Doanh thu</option>
                            <option value="orders">Đơn hàng</option>
                            <option value="products">Sản phẩm</option>
                            <option value="customers">Khách hàng</option>
                        </select>
                    </div>

                    {/* Time Frame */}
                    <div>
                        <label htmlFor="time-frame" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                            Thời gian
                        </label>
                        <select
                            id="time-frame"
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                            className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                        >
                            <option value="daily">Hôm nay</option>
                            <option value="weekly">7 ngày qua</option>
                            <option value="monthly">Tháng này</option>
                            <option value="yearly">Năm nay</option>
                            <option value="custom">Tùy chỉnh</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label htmlFor="start-date" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={timeFrame !== 'custom'}
                                className={`w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm ${
                                    timeFrame !== 'custom' ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>

                        <div className="flex-1">
                            <label htmlFor="end-date" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={timeFrame !== 'custom'}
                                className={`w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm ${
                                    timeFrame !== 'custom' ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>
                    </div>

                    {/* Export Format */}
                    <div>
                        <label htmlFor="export-format" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                            Định dạng xuất
                        </label>
                        <select
                            id="export-format"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as FileFormat)}
                            className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                        >
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="csv">CSV (.csv)</option>
                            <option value="pdf">PDF (.pdf)</option>
                        </select>
                    </div>
                </div>

                {/* Additional Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-textDark dark:text-textLight">
                                Bộ lọc bổ sung
                            </h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-secondary dark:text-highlight hover:text-textDark dark:hover:text-textLight"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Order Status Filter */}
                            {(reportType === 'orders' || reportType === 'revenue') && (
                                <div>
                                    <label htmlFor="status-filter" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Trạng thái đơn hàng
                                    </label>
                                    <select
                                        id="status-filter"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
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
                            )}

                            {/* Payment Status Filter */}
                            {(reportType === 'orders' || reportType === 'revenue') && (
                                <div>
                                    <label htmlFor="payment-status-filter" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Trạng thái thanh toán
                                    </label>
                                    <select
                                        id="payment-status-filter"
                                        value={paymentStatusFilter}
                                        onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | '')}
                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value={PaymentStatus.PENDING}>Chờ thanh toán</option>
                                        <option value={PaymentStatus.PROCESSING}>Đang xử lý</option>
                                        <option value={PaymentStatus.COMPLETED}>Đã thanh toán</option>
                                        <option value={PaymentStatus.FAILED}>Thanh toán thất bại</option>
                                        <option value={PaymentStatus.CANCELLED}>Đã hủy</option>
                                    </select>
                                </div>
                            )}

                            {/* Category Filter */}
                            {reportType === 'products' && (
                                <div>
                                    <label htmlFor="category-filter" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Danh mục sản phẩm
                                    </label>
                                    <select
                                        id="category-filter"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        <option value="1">Thời trang nữ</option>
                                        <option value="2">Thời trang nam</option>
                                        <option value="3">Phụ kiện</option>
                                        <option value="4">Giày dép</option>
                                    </select>
                                </div>
                            )}

                            {/* Sort Options */}
                            <div>
                                <label htmlFor="sort-by" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                    Sắp xếp theo
                                </label>
                                <select
                                    id="sort-by"
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                >
                                    <option value="date">Ngày</option>
                                    <option value="amount">Giá trị</option>
                                    <option value="quantity">Số lượng</option>
                                    <option value="name">Tên</option>
                                </select>
                            </div>

                            {/* Sort Direction */}
                            <div>
                                <label htmlFor="sort-direction" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                    Thứ tự
                                </label>
                                <select
                                    id="sort-direction"
                                    value={sortDirection}
                                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                >
                                    <option value="asc">Tăng dần</option>
                                    <option value="desc">Giảm dần</option>
                                </select>
                            </div>

                            {/* Reset Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setStatusFilter('');
                                        setPaymentStatusFilter('');
                                        setCategoryFilter('');
                                        setSortField('date');
                                        setSortDirection('desc');
                                    }}
                                    className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Title */}
            <div className="print:py-6 print:border-b print:border-gray-300">
                <h1 className="text-2xl font-bold text-textDark dark:text-textLight text-center mb-2">
                    {reportTitle}
                </h1>
                <p className="text-sm text-secondary dark:text-highlight text-center">
                    Thời gian: {startDate} - {endDate}
                </p>
            </div>

            {/* Overview Section */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('overview')}
                >
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary"/> Tổng quan
                    </h2>
                    <button className="text-secondary dark:text-highlight">
                        {expandedSections.overview ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {expandedSections.overview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
                    >
                        {/* Total Revenue */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-secondary dark:text-highlight mb-1">Tổng doanh thu</span>
                            {isLoading ? (
                                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    {formatCurrency(summaryStats.totalRevenue)}
                                </span>
                            )}
                        </div>

                        {/* Total Orders */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-secondary dark:text-highlight mb-1">Tổng đơn hàng</span>
                            {isLoading ? (
                                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-primary" />
                                    {summaryStats.totalOrders}
                                </span>
                            )}
                        </div>

                        {/* Average Order Value */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-secondary dark:text-highlight mb-1">Giá trị TB/đơn</span>
                            {isLoading ? (
                                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-primary" />
                                    {formatCurrency(summaryStats.averageOrderValue)}
                                </span>
                            )}
                        </div>

                        {/* Total Products */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-secondary dark:text-highlight mb-1">Tổng sản phẩm</span>
                            {isLoading ? (
                                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                                    <BoxSelect className="w-4 h-4 text-primary" />
                                    {summaryStats.totalProducts}
                                </span>
                            )}
                        </div>

                        {/* Total Customers */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-secondary dark:text-highlight mb-1">Tổng khách hàng</span>
                            {isLoading ? (
                                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    {summaryStats.totalCustomers}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Charts Section */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('charts')}
                >
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary"/> Biểu đồ
                    </h2>
                    <button className="text-secondary dark:text-highlight">
                        {expandedSections.charts ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {expandedSections.charts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Chart 1: Revenue by Period */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="text-md font-medium text-textDark dark:text-textLight mb-4">
                                Doanh thu theo thời gian
                            </h3>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                ) : (
                                    <RevenueByPeriodChart
                                        data={orderStatistics?.monthlyOrders || []}
                                        timeFrame={timeFrame}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Chart 2: Order Status Distribution */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="text-md font-medium text-textDark dark:text-textLight mb-4">
                                Phân bố trạng thái đơn hàng
                            </h3>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                ) : (
                                    <OrderStatusPieChart
                                        statistics={orderStatistics || {
                                            totalOrders: 0,
                                            pendingOrders: 0,
                                            processingOrders: 0,
                                            shippingOrders: 0,
                                            confirmedOrders: 0,
                                            completedOrders: 0,
                                            cancelledOrders: 0,
                                            deliveryFailedOrders: 0,
                                            totalRevenue: 0,
                                            averageOrderValue: 0,
                                            monthlyOrders: []
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Chart 3: Sales by Category */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="text-md font-medium text-textDark dark:text-textLight mb-4">
                                Doanh số theo danh mục
                            </h3>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                ) : (
                                    <ProductCategoryChart />
                                )}
                            </div>
                        </div>

                        {/* Chart 4: Monthly Sales Comparison */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="text-md font-medium text-textDark dark:text-textLight mb-4">
                                So sánh doanh số theo tháng
                            </h3>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                ) : (
                                    <SalesBarChart
                                        data={orderStatistics?.monthlyOrders || []}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Tables Section */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('tables')}
                >
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary"/> Dữ liệu chi tiết
                    </h2>
                    <button className="text-secondary dark:text-highlight">
                        {expandedSections.tables ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {expandedSections.tables && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                    >
                        {/* Display appropriate table based on report type */}
                        {reportType === 'revenue' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('date')}
                                            >
                                                Ngày
                                                {sortField === 'date' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('orders')}
                                            >
                                                Đơn hàng
                                                {sortField === 'orders' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'orders' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('revenue')}
                                            >
                                                Doanh thu
                                                {sortField === 'revenue' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'revenue' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('average')}
                                            >
                                                TB/Đơn
                                                {sortField === 'average' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'average' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('payment')}
                                            >
                                                Đã thanh toán
                                                {sortField === 'payment' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'payment' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {Array(5).fill(0).map((_, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : orderStatistics?.monthlyOrders && orderStatistics.monthlyOrders.length > 0 ? (
                                        // Example data
                                        orderStatistics.monthlyOrders.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {item.month}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {item.count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {formatCurrency(item.revenue)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {formatCurrency(item.count > 0 ? item.revenue / item.count : 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {formatCurrency(item.revenue * 0.85)} {/* Example: 85% of revenue is paid */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu cho khoảng thời gian đã chọn
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'orders' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('orderCode')}
                                            >
                                                Mã đơn
                                                {sortField === 'orderCode' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'orderCode' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('customer')}
                                            >
                                                Khách hàng
                                                {sortField === 'customer' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'customer' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('status')}
                                            >
                                                Trạng thái
                                                {sortField === 'status' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'status' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('amount')}
                                            >
                                                Tổng tiền
                                                {sortField === 'amount' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'amount' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('date')}
                                            >
                                                Ngày tạo
                                                {sortField === 'date' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {/* Replace with actual order data */}
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {Array(5).fill(0).map((_, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : ordersPage?.content && ordersPage.content.length > 0 ? (
                                        ordersPage.content.map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                    {order.orderCode || `ORD-${order.orderId}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {order.userName || 'Khách hàng'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                    order.status === OrderStatus.SHIPPING ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                                                                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                    }`}>
                                                        {order.status === OrderStatus.COMPLETED ? 'Hoàn thành' :
                                                            order.status === OrderStatus.PENDING ? 'Chờ xử lý' :
                                                                order.status === OrderStatus.PROCESSING ? 'Đang xử lý' :
                                                                    order.status === OrderStatus.SHIPPING ? 'Đang giao' :
                                                                        order.status === OrderStatus.CANCELLED ? 'Đã hủy' :
                                                                            order.status === OrderStatus.CONFIRMED ? 'Đã xác nhận' :
                                                                                order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {formatCurrency(order.finalAmount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu đơn hàng cho khoảng thời gian đã chọn
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'products' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('product')}
                                            >
                                                Sản phẩm
                                                {sortField === 'product' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'product' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('category')}
                                            >
                                                Danh mục
                                                {sortField === 'category' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'category' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('unitsSold')}
                                            >
                                                Đã bán
                                                {sortField === 'unitsSold' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'unitsSold' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('revenue')}
                                            >
                                                Doanh thu
                                                {sortField === 'revenue' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'revenue' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('stock')}
                                            >
                                                Tồn kho
                                                {sortField === 'stock' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'stock' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {/* Replace with actual product data */}
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {Array(5).fill(0).map((_, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : productsPage?.content && productsPage.content.length > 0 ? (
                                        productsPage.content.slice(0, 10).map((product) => (
                                            <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                    {product.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {product.category.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {Math.floor(Math.random() * 100)} {/* Example: Random units sold */}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {formatCurrency(Math.floor(Math.random() * 10000000) + 1000000)} {/* Example: Random revenue */}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                    {Math.floor(Math.random() * 50) + 10} {/* Example: Random stock */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu sản phẩm cho khoảng thời gian đã chọn
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'customers' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('customer')}
                                            >
                                                Khách hàng
                                                {sortField === 'customer' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'customer' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('orders')}
                                            >
                                                Số đơn hàng
                                                {sortField === 'orders' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'orders' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('totalSpent')}
                                            >
                                                Tổng chi tiêu
                                                {sortField === 'totalSpent' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'totalSpent' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('averageOrder')}
                                            >
                                                TB/Đơn
                                                {sortField === 'averageOrder' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'averageOrder' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <button
                                                className="flex items-center"
                                                onClick={() => handleSortChange('lastPurchase')}
                                            >
                                                Lần mua cuối
                                                {sortField === 'lastPurchase' && (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                                )}
                                                {sortField !== 'lastPurchase' && <ArrowUpDown className="w-3 h-3 ml-1" />}
                                            </button>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {/* Replace with actual customer data */}
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {Array(5).fill(0).map((_, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : usersList && usersList.length > 0 ? (
                                        usersList.slice(0, 10).map((user) => {
                                            // Example values for user stats
                                            const orderCount = Math.floor(Math.random() * 10) + 1;
                                            const totalSpent = Math.floor(Math.random() * 10000000) + 1000000;
                                            const averageOrder = totalSpent / orderCount;
                                            const lastPurchase = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

                                            return (
                                                <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                        {user.fullName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                        {orderCount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                        {formatCurrency(totalSpent)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textDark dark:text-textLight">
                                                        {formatCurrency(averageOrder)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {lastPurchase.toLocaleDateString('vi-VN')}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu khách hàng cho khoảng thời gian đã chọn
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Export actions */}
            <div className="flex justify-end mt-6 space-x-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className={`h-10 px-4 flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isPrinting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isPrinting}
                >
                    <Printer className="h-4 w-4" />
                    <span>In báo cáo</span>
                </button>

                <button
                    onClick={handleExport}
                    className={`h-10 px-4 flex items-center gap-2 rounded-md bg-primary text-white hover:bg-primary/90 ${
                        isExporting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isExporting}
                >
                    <Download className="h-4 w-4" />
                    <span>{isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}</span>
                </button>
            </div>
        </div>
    );
};

export default ReportsPage;