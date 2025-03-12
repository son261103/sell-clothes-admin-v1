import React, { useState, useEffect } from 'react';
import { TagIcon, XCircle, Clock, CheckCircle, AlertTriangle, Percent, DollarSign } from 'lucide-react';
import { CouponResponseDTO, CouponType, PageResponse } from '@/types';
import Pagination from '../common/Pagination';
import { formatPrice } from '@/utils/format';

// Components
import CouponActionButtons from './coupon-list/CouponActionButtons';
import CouponLoading from './coupon-list/CouponLoading';
import CouponEmptyState from './coupon-list/CouponEmptyState';

interface CouponDataTableProps {
    coupons: PageResponse<CouponResponseDTO>;
    onDeleteCoupon: (id: number) => void;
    onViewCoupon: (coupon: CouponResponseDTO) => void;
    onToggleStatus: (id: number) => void;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    forceRefresh?: number;
}

const CouponDataTable: React.FC<CouponDataTableProps> = ({
                                                             coupons,
                                                             onDeleteCoupon,
                                                             onViewCoupon,
                                                             onToggleStatus,
                                                             isLoading,
                                                             onRefresh,
                                                             isRefreshing,
                                                             isMobileView,
                                                             onPageChange,
                                                             onPageSizeChange,
                                                             forceRefresh = 0
                                                         }) => {
    const [localRefreshCounter, setLocalRefreshCounter] = useState(0);
    const [hasReceivedData, setHasReceivedData] = useState(false);

    // Debug logging
    useEffect(() => {
        if (coupons?.content?.length > 0) {
            console.log('Received coupon data sample:', coupons.content[0]);
        }
    }, [coupons]);

    useEffect(() => {
        setLocalRefreshCounter(prev => prev + 1);

        // Track if we've received valid data
        if (coupons && coupons.content && coupons.content.length > 0) {
            setHasReceivedData(true);
        }
    }, [coupons, forceRefresh]);

    const handleDeleteClick = (coupon: CouponResponseDTO) => {
        onDeleteCoupon(coupon.couponId);
    };

    const getStatusBadgeClass = (coupon: CouponResponseDTO): string => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";

        if (coupon.isFullyUsed) {
            return `${baseClasses} text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400`;
        } else if (coupon.isExpired) {
            return `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
        } else if (coupon.status) {
            return `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`;
        } else {
            return `${baseClasses} text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400`;
        }
    };

    const getTypeBadgeClass = (type: CouponType): string => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";

        switch (type) {
            case CouponType.PERCENTAGE:
                return `${baseClasses} text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400`;
            case CouponType.FIXED_AMOUNT:
                return `${baseClasses} text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400`;
        }
    };

    const getStatusIcon = (coupon: CouponResponseDTO): JSX.Element => {
        if (coupon.isFullyUsed) {
            return <AlertTriangle className="w-3 h-3" />;
        } else if (coupon.isExpired) {
            return <XCircle className="w-3 h-3" />;
        } else if (coupon.status) {
            return <CheckCircle className="w-3 h-3" />;
        } else {
            return <Clock className="w-3 h-3" />;
        }
    };

    const getTypeIcon = (type: CouponType): JSX.Element => {
        switch (type) {
            case CouponType.PERCENTAGE:
                return <Percent className="w-3 h-3" />;
            case CouponType.FIXED_AMOUNT:
                return <DollarSign className="w-3 h-3" />;
            default:
                return <TagIcon className="w-3 h-3" />;
        }
    };

    const getStatusText = (coupon: CouponResponseDTO): string => {
        if (coupon.isFullyUsed) {
            return "Sử dụng hết";
        } else if (coupon.isExpired) {
            return "Hết hạn";
        } else if (coupon.status) {
            return "Đang hoạt động";
        } else {
            return "Không hoạt động";
        }
    };

    const getTypeText = (type: CouponType): string => {
        switch (type) {
            case CouponType.PERCENTAGE:
                return "Phần trăm";
            case CouponType.FIXED_AMOUNT:
                return "Số tiền cố định";
            default:
                return "Không xác định";
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Không giới hạn';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const formatValue = (coupon: CouponResponseDTO): string => {
        if (coupon.type === CouponType.PERCENTAGE) {
            return `${coupon.value}%`;
        } else {
            return formatPrice(coupon.value);
        }
    };

    const formatUsage = (coupon: CouponResponseDTO): string => {
        if (coupon.usageLimit) {
            return `${coupon.usedCount}/${coupon.usageLimit}`;
        } else {
            return `${coupon.usedCount}/∞`;
        }
    };

    // If we're loading and have never received data, show the loading component
    if (isLoading && !hasReceivedData) {
        return <CouponLoading />;
    }

    // Check if we have valid data to display
    const hasContent = coupons && coupons.content && Array.isArray(coupons.content) && coupons.content.length > 0;

    // If we don't have content (either loading or empty), show appropriate component
    if (!hasContent) {
        // If we're loading but previously had data, or if we're refreshing, show the loading overlay
        if (isLoading || isRefreshing) {
            return <CouponLoading type="overlay" />;
        }

        // Otherwise, show empty state
        return <CouponEmptyState onRefresh={onRefresh} />;
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {coupons.content.map((coupon) => (
                        <div key={`${coupon.couponId}-${localRefreshCounter}`} className="p-4 bg-white dark:bg-secondary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            #{coupon.couponId}
                                        </span>
                                        <span className={getTypeBadgeClass(coupon.type)}>
                                            <div className="flex items-center gap-1">
                                                {getTypeIcon(coupon.type)}
                                                <span>{getTypeText(coupon.type)}</span>
                                            </div>
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-textDark dark:text-textLight mt-1">
                                        {coupon.code}
                                    </h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {coupon.description || 'Không có mô tả'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-primary">
                                        {formatValue(coupon)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatUsage(coupon)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                                <span className={getStatusBadgeClass(coupon)}>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(coupon)}
                                        <span>{getStatusText(coupon)}</span>
                                    </div>
                                </span>

                                <CouponActionButtons
                                    coupon={coupon}
                                    onView={() => onViewCoupon(coupon)}
                                    onDelete={() => handleDeleteClick(coupon)}
                                    onToggleStatus={() => onToggleStatus(coupon.couponId)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={coupons.number}
                        totalPages={coupons.totalPages}
                        onPageChange={onPageChange}
                        pageSize={coupons.size}
                        totalElements={coupons.totalElements}
                        onPageSizeChange={onPageSizeChange}
                    />
                </div>

                {/* Loading Overlay */}
                {isLoading && <CouponLoading type="overlay" />}
            </div>
        );
    }

    return (
        <div className="relative bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="w-16 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700 rounded-tl-xl">ID</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-left border-r border-gray-200 dark:border-gray-700">Mã giảm giá</th>
                        <th className="w-36 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Loại</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-right border-r border-gray-200 dark:border-gray-700">Giá trị</th>
                        <th className="w-48 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-left border-r border-gray-200 dark:border-gray-700">Thời gian hiệu lực</th>
                        <th className="w-32 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Sử dụng</th>
                        <th className="w-36 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Trạng thái</th>
                        <th className="w-40 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center rounded-tr-xl">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {coupons.content.map((coupon) => (
                        <tr
                            key={`${coupon.couponId}-${localRefreshCounter}`}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                                transition-colors duration-200 border-b border-gray-200
                                dark:border-gray-700"
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-textDark dark:text-textLight text-center">
                                    {coupon.couponId}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-textDark dark:text-textLight">
                                    {coupon.code}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {coupon.description || 'Không có mô tả'}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 text-center">
                                    <span className={getTypeBadgeClass(coupon.type)}>
                                        <div className="flex items-center justify-center gap-1">
                                            {getTypeIcon(coupon.type)}
                                            <span>{getTypeText(coupon.type)}</span>
                                        </div>
                                    </span>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-primary text-right">
                                    {formatValue(coupon)}
                                </div>
                                {coupon.minOrderAmount && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        Tối thiểu: {formatPrice(coupon.minOrderAmount)}
                                    </div>
                                )}
                                {coupon.maxDiscountAmount && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        Tối đa: {formatPrice(coupon.maxDiscountAmount)}
                                    </div>
                                )}
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <div>Bắt đầu: {formatDate(coupon.startDate)}</div>
                                    <div>Kết thúc: {formatDate(coupon.endDate)}</div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-center">
                                    {formatUsage(coupon)}
                                </div>
                            </td>
                            <td className="py-1 px-1 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center">
                                        <span className={getStatusBadgeClass(coupon)}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(coupon)}
                                                <span>{getStatusText(coupon)}</span>
                                            </div>
                                        </span>
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex justify-center">
                                    <CouponActionButtons
                                        coupon={coupon}
                                        onView={() => onViewCoupon(coupon)}
                                        onDelete={() => handleDeleteClick(coupon)}
                                        onToggleStatus={() => onToggleStatus(coupon.couponId)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                    currentPage={coupons.number || 0}
                    totalPages={coupons.totalPages || 1}
                    onPageChange={onPageChange}
                    pageSize={coupons.size || 10}
                    totalElements={coupons.totalElements || 0}
                    onPageSizeChange={onPageSizeChange}
                />
            </div>

            {/* Loading Overlay */}
            {isLoading && <CouponLoading type="overlay" />}
        </div>
    );
};

export default CouponDataTable;