import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Tag, Edit, Trash2, CheckCircle, XCircle,
    Calendar, Percent, DollarSign, ShoppingBag, Users, AlertCircle,
    Clock, BarChart3, Eye, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useCouponFinder, useCoupons } from '../../hooks/couponHooks';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/Loading';
import { CouponType } from '@/types';

// StatusBadge component for displaying coupon status
const StatusBadge: React.FC<{ status: boolean; isExpired: boolean; isFullyUsed: boolean }> = ({ status, isExpired, isFullyUsed }) => {
    if (isExpired) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Clock className="w-3 h-3 mr-1" />
                Đã hết hạn
            </span>
        );
    }

    if (isFullyUsed) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                <Users className="w-3 h-3 mr-1" />
                Đã dùng hết
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${status
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {status ? (
                <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hoạt động
                </>
            ) : (
                <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Không hoạt động
                </>
            )}
        </span>
    );
};

// Info row component for consistent styling
const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-start py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-1/3 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
        </div>
        <div className="w-2/3 text-sm text-gray-900 dark:text-white">{value}</div>
    </div>
);

// Stat Card component
const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
}> = ({ title, value, icon }) => {
    return (
        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-secondary dark:text-highlight">{title}</p>
                    <h3 className="text-xl font-semibold text-textDark dark:text-textLight">{value}</h3>
                </div>
            </div>
        </div>
    );
};

const CouponDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const couponId = id ? parseInt(id, 10) : 0;
    const navigate = useNavigate();

    const { foundById, fetchCouponById, isLoading: isLoadingCoupon } = useCouponFinder(couponId);
    const { deleteCoupon, toggleCouponStatus, isLoading: isActionLoading } = useCoupons();

    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusToggleModal, setShowStatusToggleModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'usage'>('details');

    // Fetch coupon data on mount
    useEffect(() => {
        const loadCoupon = async () => {
            try {
                if (couponId) {
                    await fetchCouponById(couponId);
                }
            } catch (error) {
                console.error('Error loading coupon:', error);
                setError('Không thể tải thông tin mã giảm giá');
            }
        };

        loadCoupon();
    }, [couponId, fetchCouponById]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchCouponById(couponId);
            setError(null);
        } catch (error) {
            console.error('Error refreshing coupon data:', error);
            setError('Không thể làm mới thông tin mã giảm giá');
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
        }
    }, [couponId, fetchCouponById]);

    // Handle delete coupon
    const handleDeleteCoupon = useCallback(async () => {
        try {
            const success = await deleteCoupon(couponId);

            if (success) {
                toast.success('Xóa mã giảm giá thành công');
                navigate('/admin/coupons/list');
            } else {
                throw new Error('Không thể xóa mã giảm giá');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Đã xảy ra lỗi khi xóa mã giảm giá');
        }
    }, [couponId, deleteCoupon, navigate]);

    // Handle toggle coupon status
    const handleToggleStatus = useCallback(async () => {
        try {
            const success = await toggleCouponStatus(couponId);

            if (success) {
                toast.success(`Mã giảm giá đã được ${foundById?.status ? 'vô hiệu hóa' : 'kích hoạt'}`);
                await fetchCouponById(couponId);
                setShowStatusToggleModal(false);
            } else {
                throw new Error('Không thể thay đổi trạng thái mã giảm giá');
            }
        } catch (error) {
            console.error('Error toggling coupon status:', error);
            toast.error('Đã xảy ra lỗi khi thay đổi trạng thái mã giảm giá');
        }
    }, [couponId, toggleCouponStatus, fetchCouponById, foundById]);

    // Loading and error states
    const isLoading = isLoadingCoupon || isActionLoading || isRefreshing;
    const hasError = !foundById || error;

    // Format date function
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    };

    // Format number function
    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString('vi-VN');
    };

    if (isLoading && !foundById) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (hasError && !isLoading) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6 mt-6">
                <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy mã giảm giá
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {error || 'Mã giảm giá không tồn tại hoặc đã bị xóa.'}
                    </p>
                    <button
                        onClick={() => navigate('/admin/coupons/list')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/coupons/list')}
                            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary transition-colors p-1"
                            aria-label="Quay lại"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {foundById?.code}
                                </h1>
                                <StatusBadge
                                    status={foundById?.status || false}
                                    isExpired={foundById?.isExpired || false}
                                    isFullyUsed={foundById?.isFullyUsed || false}
                                />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {foundById?.type === CouponType.PERCENTAGE
                                    ? `Giảm ${foundById.value}%`
                                    : `Giảm ${formatNumber(foundById?.value)}đ`}
                                {foundById?.minOrderAmount ? ` cho đơn từ ${formatNumber(foundById.minOrderAmount)}đ` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center mt-4 sm:mt-0 space-x-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            disabled={isLoading}
                        >
                            <svg
                                className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Làm mới
                        </button>
                        <button
                            onClick={() => setShowStatusToggleModal(true)}
                            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                                foundById?.status
                                    ? 'border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                    : 'border-green-300 bg-white text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                            }`}
                            disabled={isLoading || (foundById?.isExpired || false) || (foundById?.isFullyUsed || false)}
                        >
                            {foundById?.status ? (
                                <>
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    Vô hiệu hóa
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                    Kích hoạt
                                </>
                            )}
                        </button>
                        <Link
                            to={`/admin/coupons/edit/${couponId}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <Edit className="w-4 h-4 mr-1.5" />
                            Chỉnh sửa
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md bg-white dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Xóa
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        <button
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                activeTab === 'details'
                                    ? 'border-primary text-primary dark:text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('details')}
                        >
                            <Eye className="w-4 h-4 inline mr-1.5" />
                            Chi tiết
                        </button>
                        <button
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                activeTab === 'usage'
                                    ? 'border-primary text-primary dark:text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('usage')}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-1.5" />
                            Thống kê sử dụng
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info - Left Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Thông tin mã giảm giá
                                </h3>
                            </div>

                            <div className="p-6">
                                <InfoRow
                                    label="Mã giảm giá"
                                    value={foundById?.code || ''}
                                    icon={<Tag className="w-4 h-4 text-primary" />}
                                />
                                <InfoRow
                                    label="Loại"
                                    value={
                                        foundById?.type === CouponType.PERCENTAGE
                                            ? 'Giảm theo phần trăm'
                                            : 'Giảm số tiền cố định'
                                    }
                                    icon={
                                        foundById?.type === CouponType.PERCENTAGE
                                            ? <Percent className="w-4 h-4 text-blue-500" />
                                            : <DollarSign className="w-4 h-4 text-green-500" />
                                    }
                                />
                                <InfoRow
                                    label="Giá trị"
                                    value={
                                        foundById?.type === CouponType.PERCENTAGE
                                            ? `${foundById?.value || 0}%`
                                            : `${formatNumber(foundById?.value)}đ`
                                    }
                                    icon={
                                        foundById?.type === CouponType.PERCENTAGE
                                            ? <Percent className="w-4 h-4 text-blue-500" />
                                            : <DollarSign className="w-4 h-4 text-green-500" />
                                    }
                                />
                                {foundById?.type === CouponType.PERCENTAGE && foundById?.maxDiscountAmount && foundById.maxDiscountAmount > 0 && (
                                    <InfoRow
                                        label="Giảm tối đa"
                                        value={`${formatNumber(foundById.maxDiscountAmount)}đ`}
                                        icon={<DollarSign className="w-4 h-4 text-red-500" />}
                                    />
                                )}
                                {foundById?.minOrderAmount && foundById.minOrderAmount > 0 && (
                                    <InfoRow
                                        label="Đơn tối thiểu"
                                        value={`${formatNumber(foundById.minOrderAmount)}đ`}
                                        icon={<ShoppingBag className="w-4 h-4 text-amber-500" />}
                                    />
                                )}
                                <InfoRow
                                    label="Thời gian"
                                    value={
                                        <>
                                            {foundById?.startDate && (
                                                <span className="inline-flex items-center">
                                                    <span className="text-gray-500 dark:text-gray-400 mr-1">Từ:</span>
                                                    {formatDate(foundById.startDate)}
                                                </span>
                                            )}
                                            {foundById?.startDate && foundById?.endDate && (
                                                <span className="mx-2 text-gray-400">|</span>
                                            )}
                                            {foundById?.endDate && (
                                                <span className="inline-flex items-center">
                                                    <span className="text-gray-500 dark:text-gray-400 mr-1">Đến:</span>
                                                    {formatDate(foundById.endDate)}
                                                </span>
                                            )}
                                            {!foundById?.startDate && !foundById?.endDate && 'Không giới hạn thời gian'}
                                        </>
                                    }
                                    icon={<Calendar className="w-4 h-4 text-purple-500" />}
                                />
                                <InfoRow
                                    label="Giới hạn sử dụng"
                                    value={
                                        foundById?.usageLimit && foundById.usageLimit > 0
                                            ? `${foundById?.usedCount || 0}/${foundById.usageLimit} lần`
                                            : 'Không giới hạn'
                                    }
                                    icon={<Users className="w-4 h-4 text-indigo-500" />}
                                />
                                <InfoRow
                                    label="Trạng thái"
                                    value={
                                        <StatusBadge
                                            status={foundById?.status || false}
                                            isExpired={foundById?.isExpired || false}
                                            isFullyUsed={foundById?.isFullyUsed || false}
                                        />
                                    }
                                    icon={
                                        foundById?.status && !(foundById?.isExpired || false) && !(foundById?.isFullyUsed || false)
                                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                                            : <XCircle className="w-4 h-4 text-red-500" />
                                    }
                                />
                                {foundById?.description && (
                                    <div className="py-3">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Mô tả
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            {foundById.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats - Right Column */}
                    <div>
                        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm mb-6">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Thống kê tổng quan
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Tổng lượt sử dụng
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatNumber(foundById?.usedCount)}
                                    </span>
                                </div>

                                {foundById?.usageLimit && foundById.usageLimit > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Tỉ lệ sử dụng
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {Math.round(((foundById?.usedCount || 0) / foundById.usageLimit) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${Math.min(100, Math.round(((foundById?.usedCount || 0) / foundById.usageLimit) * 100))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Trạng thái
                                    </span>
                                    <StatusBadge
                                        status={foundById?.status || false}
                                        isExpired={foundById?.isExpired || false}
                                        isFullyUsed={foundById?.isFullyUsed || false}
                                    />
                                </div>

                                {foundById?.startDate && foundById?.endDate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Thời hạn còn lại
                                        </span>
                                        <span className={`text-sm font-medium ${
                                            foundById?.isExpired
                                                ? 'text-red-500'
                                                : 'text-green-500'
                                        }`}>
                                            {foundById?.isExpired
                                                ? 'Đã hết hạn'
                                                : getRemainingDays(foundById.endDate)
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Hành động nhanh
                                </h3>
                            </div>

                            <div className="p-6 space-y-3">
                                <Link
                                    to={`/admin/marketing/coupons/edit/${couponId}`}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Edit className="w-4 h-4 mr-2 text-blue-500" />
                                        Chỉnh sửa mã giảm giá
                                    </span>
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                </Link>

                                <button
                                    onClick={() => setShowStatusToggleModal(true)}
                                    disabled={isLoading || (foundById?.isExpired || false) || (foundById?.isFullyUsed || false)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        foundById?.status
                                            ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400'
                                            : 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400'
                                    } ${(isLoading || (foundById?.isExpired || false) || (foundById?.isFullyUsed || false)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="flex items-center text-sm font-medium">
                                        {foundById?.status
                                            ? <XCircle className="w-4 h-4 mr-2" />
                                            : <CheckCircle className="w-4 h-4 mr-2" />
                                        }
                                        {foundById?.status ? 'Vô hiệu hóa mã' : 'Kích hoạt mã'}
                                    </span>
                                    <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isLoading}
                                    className={`w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="flex items-center text-sm font-medium">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa mã giảm giá
                                    </span>
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Thống kê sử dụng
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                title="Tổng lượt sử dụng"
                                value={formatNumber(foundById?.usedCount || 0)}
                                icon={<Users className="h-5 w-5 text-primary" />}
                            />

                            <StatCard
                                title="Giảm giá tối đa"
                                value={
                                    foundById?.type === CouponType.PERCENTAGE && foundById?.maxDiscountAmount
                                        ? `${formatNumber(foundById.maxDiscountAmount)}đ`
                                        : foundById?.type === CouponType.FIXED_AMOUNT
                                            ? `${formatNumber(foundById?.value || 0)}đ`
                                            : 'N/A'
                                }
                                icon={<DollarSign className="h-5 w-5 text-green-500" />}
                            />

                            <StatCard
                                title="Đơn hàng tối thiểu"
                                value={
                                    foundById?.minOrderAmount
                                        ? `${formatNumber(foundById.minOrderAmount)}đ`
                                        : 'Không giới hạn'
                                }
                                icon={<ShoppingBag className="h-5 w-5 text-amber-500" />}
                            />
                        </div>

                        {/* This section would typically show usage analytics,
                            recent orders using this coupon, etc. */}
                        <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Đang phát triển
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Tính năng thống kê chi tiết đang được phát triển. Bạn sẽ sớm có thể xem thêm thông tin chi tiết về lượt sử dụng, doanh thu, và các phân tích khác.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCoupon}
                title="Xác nhận xóa mã giảm giá"
                message={`Bạn có chắc chắn muốn xóa mã giảm giá "${foundById?.code || ''}"? Hành động này không thể hoàn tác.`}
                confirmText="Xác nhận xóa"
                cancelText="Hủy"
            />

            <ConfirmationModal
                isOpen={showStatusToggleModal}
                onClose={() => setShowStatusToggleModal(false)}
                onConfirm={handleToggleStatus}
                title={`Xác nhận ${foundById?.status ? 'vô hiệu hóa' : 'kích hoạt'} mã giảm giá`}
                message={`Bạn có chắc chắn muốn ${foundById?.status ? 'vô hiệu hóa' : 'kích hoạt'} mã giảm giá "${foundById?.code || ''}"?`}
                confirmText="Xác nhận"
                cancelText="Hủy"
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 transition-transform duration-300 transform">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Đang xử lý...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to calculate remaining days
function getRemainingDays(endDateStr: string): string {
    const endDate = new Date(endDateStr);
    const today = new Date();

    // Reset time component for accurate day calculation
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Đã hết hạn';
    if (diffDays === 0) return 'Hết hạn hôm nay';
    if (diffDays === 1) return 'Còn 1 ngày';
    return `Còn ${diffDays} ngày`;
}

export default CouponDetailPage;