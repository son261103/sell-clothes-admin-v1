import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    BarChart2,
    ShoppingBag,
    Users,
    RefreshCw,
    DollarSign,
    Package,
    Clock,
    Tag
} from 'lucide-react';
import { useOrderStatistics } from '../../hooks/orderHooks';
import { useProducts, useProductFeatures } from '../../hooks/productHooks';
import { useUsers } from '../../hooks/userHooks';
import { useOrderRevenue } from '../../hooks/orderHooks';
import { OrderStatus } from '@/types';

// Components
import RevenueChart from '../../components/dashboard/RevenueChart';
import SalesComparisonChart from '../../components/dashboard/SalesComparisonChart';
import TopSellingProductsTable from '../../components/dashboard/TopSellingProductsTable';
import StatCard from '../../components/dashboard/StatCard';
import OrderStatusDistributionChart from '../../components/dashboard/OrderStatusDistributionChart';

const StatisticsPage: React.FC = () => {
    // State for time period selection
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadingError, setHasLoadingError] = useState(false);

    // Hooks for data fetching
    const {
        orderStatistics,
        fetchStatistics,
        isLoading: isLoadingStats,
        recentOrders
    } = useOrderStatistics();

    const {
        revenueByMonth,
        ordersByMonth
    } = useOrderRevenue();

    const {
        fetchAllProducts,
        isLoading: isLoadingProducts
    } = useProducts();

    // Create a wrapped hook to handle the missing isLoading property
    const productFeaturesHook = useProductFeatures();
    const {
        featuredProducts,
        fetchFeaturedProducts
    } = productFeaturesHook;
    // Provide a fallback for the isLoading property
    const isLoadingFeatured = false;

    const {
        usersCountByStatus,
        fetchAllUsers,
        isLoading: isLoadingUsers
    } = useUsers();

    // Initial data fetching
    useEffect(() => {
        const loadData = async () => {
            try {
                setHasLoadingError(false);

                // Fetch all required data
                const statsPromise = fetchStatistics();
                const productsPromise = fetchAllProducts();
                const featuredPromise = fetchFeaturedProducts(5);
                const usersPromise = fetchAllUsers();

                const results = await Promise.allSettled([
                    statsPromise,
                    productsPromise,
                    featuredPromise,
                    usersPromise
                ]);

                // Check if any promises failed
                const hasError = results.some(result => result.status === 'rejected');
                if (hasError) {
                    setHasLoadingError(true);
                    console.error("Error loading data:", results);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setHasLoadingError(true);
            }
        };

        loadData();
    }, [fetchStatistics, fetchAllProducts, fetchFeaturedProducts, fetchAllUsers]);

    // Handle refresh button click
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchStatistics(),
                fetchAllProducts(),
                fetchFeaturedProducts(5),
                fetchAllUsers()
            ]);
            setHasLoadingError(false);
        } catch (error) {
            console.error("Error refreshing data:", error);
            setHasLoadingError(true);
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
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

    // Process data based on selected period
    const processedData = useMemo(() => {
        if (!orderStatistics || !ordersByMonth || !revenueByMonth) {
            return {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                completionRate: 0,
                cancelRate: 0,
                ordersChange: 0,
                revenueChange: 0,
                aovChange: 0
            };
        }

        const {
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            averageOrderValue,
            pendingOrders,
            processingOrders,
            shippingOrders
        } = orderStatistics;

        // Calculate metrics
        const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
        const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

        // Calculate changes based on available data
        // Here we're just using dummy values, in a real app you'd compare with previous periods
        const ordersChange = 15.2;
        const revenueChange = 22.8;
        const aovChange = 5.4;

        return {
            totalOrders,
            totalRevenue,
            averageOrderValue,
            completionRate,
            cancelRate,
            ordersChange,
            revenueChange,
            aovChange,
            pendingOrders,
            processingOrders,
            shippingOrders,
            completedOrders
        };
    }, [orderStatistics, ordersByMonth, revenueByMonth, selectedPeriod]);

    // Loading state
    const isLoading = isLoadingStats || isLoadingProducts || isLoadingFeatured || isLoadingUsers || isRefreshing;

    return (
        <div className="space-y-6 pb-10">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary"/> Thống kê
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Tổng quan về hoạt động kinh doanh
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {(['day', 'week', 'month', 'year'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${
                                    selectedPeriod === period
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-textDark dark:text-textLight'
                                }`}
                            >
                                {period === 'day' && 'Ngày'}
                                {period === 'week' && 'Tuần'}
                                {period === 'month' && 'Tháng'}
                                {period === 'year' && 'Năm'}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRefresh}
                        className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                            isRefreshing
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-100 dark:bg-gray-800 text-textDark dark:text-textLight hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        disabled={isRefreshing}
                        aria-label="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Loading Error Alert */}
            {hasLoadingError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-red-800 dark:text-red-400">
                        Lỗi tải dữ liệu
                    </h3>
                    <div className="text-sm text-red-800 dark:text-red-400">
                        Không thể tải một số dữ liệu thống kê. Vui lòng thử lại sau.
                        <button
                            onClick={handleRefresh}
                            className="mt-2 px-3 py-1 bg-red-200 dark:bg-red-800 rounded text-red-800 dark:text-red-200 block"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <StatCard
                    icon={<DollarSign className="h-5 w-5" />}
                    title="Doanh thu"
                    value={formatCurrency(processedData.totalRevenue || 0)}
                    change={processedData.revenueChange || 0}
                    loading={isLoading}
                    color="primary"
                />

                {/* Total Orders */}
                <StatCard
                    icon={<ShoppingBag className="h-5 w-5" />}
                    title="Đơn hàng"
                    value={processedData.totalOrders || 0}
                    change={processedData.ordersChange || 0}
                    loading={isLoading}
                    color="accent"
                />

                {/* Average Order Value */}
                <StatCard
                    icon={<BarChart2 className="h-5 w-5" />}
                    title="Giá trị đơn hàng TB"
                    value={formatCurrency(processedData.averageOrderValue || 0)}
                    change={processedData.aovChange || 0}
                    loading={isLoading}
                    color="success"
                />

                {/* Total Customers */}
                <StatCard
                    icon={<Users className="h-5 w-5" />}
                    title="Khách hàng"
                    value={usersCountByStatus?.ACTIVE || 0}
                    change={7.8} // Dummy value, replace with actual calculation
                    loading={isLoading}
                    color="info"
                />
            </div>

            {/* Order Status Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Pending Orders */}
                <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    title="Đơn chờ xử lý"
                    value={processedData.pendingOrders || 0}
                    loading={isLoading}
                    color="warning"
                    hideChange
                />

                {/* Processing Orders */}
                <StatCard
                    icon={<Package className="h-5 w-5" />}
                    title="Đơn đang xử lý"
                    value={processedData.processingOrders || 0}
                    loading={isLoading}
                    color="info"
                    hideChange
                />

                {/* Shipping Orders */}
                <StatCard
                    icon={<ShoppingBag className="h-5 w-5" />}
                    title="Đơn đang giao"
                    value={processedData.shippingOrders || 0}
                    loading={isLoading}
                    color="secondary"
                    hideChange
                />

                {/* Completed Orders */}
                <StatCard
                    icon={<Tag className="h-5 w-5" />}
                    title="Đơn hoàn thành"
                    value={processedData.completedOrders || 0}
                    loading={isLoading}
                    color="success"
                    hideChange
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <motion.div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-textDark dark:text-textLight">
                            Doanh thu theo thời gian
                        </h2>
                        <p className="text-sm text-secondary dark:text-highlight mb-4">
                            Biểu đồ doanh thu {selectedPeriod === 'day' ? 'trong ngày' : selectedPeriod === 'week' ? 'trong tuần' : selectedPeriod === 'month' ? 'trong tháng' : 'trong năm'}
                        </p>

                        <div className="h-80">
                            <RevenueChart
                                data={revenueByMonth || []}
                                isLoading={isLoading}
                                period={selectedPeriod}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Order Status Distribution */}
                <motion.div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-textDark dark:text-textLight">
                            Phân bố trạng thái đơn hàng
                        </h2>
                        <p className="text-sm text-secondary dark:text-highlight mb-4">
                            Tỷ lệ các trạng thái đơn hàng
                        </p>

                        <div className="h-80">
                            <OrderStatusDistributionChart
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
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* More Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Comparison */}
                <motion.div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-textDark dark:text-textLight">
                            So sánh doanh số
                        </h2>
                        <p className="text-sm text-secondary dark:text-highlight mb-4">
                            So sánh đơn hàng và doanh thu theo thời gian
                        </p>

                        <div className="h-80">
                            <SalesComparisonChart
                                orders={ordersByMonth || []}
                                revenue={revenueByMonth || []}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Top Selling Products */}
                <motion.div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-textDark dark:text-textLight">
                            Sản phẩm bán chạy
                        </h2>
                        <p className="text-sm text-secondary dark:text-highlight mb-4">
                            Top sản phẩm bán chạy nhất
                        </p>

                        <div className="h-80 overflow-auto">
                            <TopSellingProductsTable
                                products={featuredProducts || []}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div
                className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight">
                        Đơn hàng gần đây
                    </h2>
                    <p className="text-sm text-secondary dark:text-highlight mb-4">
                        Các đơn hàng mới nhất trong hệ thống
                    </p>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Mã đơn
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ngày tạo
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
                            ) : recentOrders && recentOrders.length > 0 ? (
                                // Actual data
                                recentOrders.map((order) => (
                                    order && (
                                        <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                                                {formatCurrency(order.finalAmount || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                        </tr>
                                    )
                                ))
                            ) : (
                                // No data
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Không có dữ liệu đơn hàng gần đây
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StatisticsPage;