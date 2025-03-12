import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import { CouponResponseDTO, CouponType, CouponPage } from '@/types';

// Basic selectors
export const selectCouponState = (state: RootState) => state.coupon;

export const selectCouponsPage = createSelector(
    [selectCouponState],
    (state): CouponPage => ({
        content: state.coupons?.content || [],
        totalPages: state.coupons?.totalPages || 0,
        totalElements: state.coupons?.totalElements || 0,
        size: state.coupons?.size || 10,
        number: state.coupons?.number || 0,
        first: state.coupons?.first || true,
        last: state.coupons?.last || true,
        empty: state.coupons?.empty || true
    })
);

export const selectCouponsList = createSelector(
    [selectCouponsPage],
    (coupons) => {
        if (!coupons.content || !Array.isArray(coupons.content)) {
            return [];
        }

        return coupons.content.map(coupon => {
            if (!coupon) return null;

            const formattedValue = coupon.type === CouponType.PERCENTAGE ?
                `${coupon.value}%` :
                `${coupon.value.toLocaleString('vi-VN')}đ`;

            return {
                ...coupon,
                formattedValue,
                formattedMinOrderAmount: coupon.minOrderAmount ?
                    `${coupon.minOrderAmount.toLocaleString('vi-VN')}đ` : '-',
                formattedMaxDiscountAmount: coupon.maxDiscountAmount ?
                    `${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ` : '-',
                displayName: `${coupon.code} (${formattedValue})`,
                statusDisplay: coupon.status ? 'Đang hoạt động' : 'Không hoạt động',
                expiryStatus: coupon.isExpired ? 'Hết hạn' :
                    (coupon.endDate ? `Hết hạn vào ${new Date(coupon.endDate).toLocaleDateString('vi-VN')}` : 'Không giới hạn'),
                usageDisplay: coupon.usageLimit ?
                    `${coupon.usedCount}/${coupon.usageLimit}` :
                    `${coupon.usedCount}/Không giới hạn`
            };
        }).filter(Boolean);
    }
);

export const selectAvailableCoupons = createSelector(
    [selectCouponState],
    (state) => state.availableCoupons || []
);

export const selectFormattedAvailableCoupons = createSelector(
    [selectAvailableCoupons],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        return coupons.map(coupon => {
            if (!coupon) return null;

            const formattedValue = coupon.type === CouponType.PERCENTAGE ?
                `${coupon.value}%` :
                `${coupon.value.toLocaleString('vi-VN')}đ`;

            return {
                ...coupon,
                formattedValue,
                formattedMinOrderAmount: coupon.minOrderAmount ?
                    `${coupon.minOrderAmount.toLocaleString('vi-VN')}đ` : '-',
                formattedMaxDiscountAmount: coupon.maxDiscountAmount ?
                    `${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ` : '-',
                displayName: `${coupon.code} (${formattedValue})`,
                expiryDisplay: coupon.endDate ?
                    `Có hiệu lực đến ${new Date(coupon.endDate).toLocaleDateString('vi-VN')}` :
                    'Không giới hạn thời gian'
            };
        }).filter(Boolean);
    }
);

export const selectPublicCoupons = createSelector(
    [selectCouponState],
    (state) => state.publicCoupons || []
);

export const selectFormattedPublicCoupons = createSelector(
    [selectPublicCoupons],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        return coupons.map(coupon => {
            if (!coupon) return null;

            const formattedValue = coupon.type === CouponType.PERCENTAGE ?
                `${coupon.value}%` :
                `${coupon.value.toLocaleString('vi-VN')}đ`;

            // Calculate days left to expiry
            let daysLeft = -1;
            if (coupon.endDate) {
                const endDate = new Date(coupon.endDate).getTime();
                const today = new Date().getTime();
                daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            }

            return {
                ...coupon,
                formattedValue,
                formattedMinOrderAmount: coupon.minOrderAmount ?
                    `${coupon.minOrderAmount.toLocaleString('vi-VN')}đ` : '-',
                formattedMaxDiscountAmount: coupon.maxDiscountAmount ?
                    `${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ` : '-',
                displayName: `${coupon.code} (${formattedValue})`,
                expiryDisplay: coupon.endDate ?
                    `Có hiệu lực đến ${new Date(coupon.endDate).toLocaleDateString('vi-VN')}` :
                    'Không giới hạn thời gian',
                daysLeft: daysLeft > 0 ? daysLeft : undefined,
                daysLeftDisplay: daysLeft > 0 ?
                    `Còn ${daysLeft} ${daysLeft === 1 ? 'ngày' : 'ngày'}` :
                    undefined,
                urgency: daysLeft <= 3 && daysLeft > 0 ? 'Sắp hết hạn!' : undefined
            };
        }).filter(Boolean);
    }
);

export const selectCurrentCoupon = createSelector(
    [selectCouponState],
    (state) => state.currentCoupon
);

export const selectFormattedCurrentCoupon = createSelector(
    [selectCurrentCoupon],
    (coupon) => {
        if (!coupon) return null;

        const formattedValue = coupon.type === CouponType.PERCENTAGE ?
            `${coupon.value}%` :
            `${coupon.value.toLocaleString('vi-VN')}đ`;

        return {
            ...coupon,
            formattedValue,
            formattedMinOrderAmount: coupon.minOrderAmount ?
                `${coupon.minOrderAmount.toLocaleString('vi-VN')}đ` : '-',
            formattedMaxDiscountAmount: coupon.maxDiscountAmount ?
                `${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ` : '-',
            displayName: `${coupon.code} (${formattedValue})`,
            statusDisplay: coupon.status ? 'Đang hoạt động' : 'Không hoạt động',
            expiryStatus: coupon.isExpired ? 'Hết hạn' :
                (coupon.endDate ? `Hết hạn vào ${new Date(coupon.endDate).toLocaleDateString('vi-VN')}` : 'Không giới hạn'),
            usageDisplay: coupon.usageLimit ?
                `${coupon.usedCount}/${coupon.usageLimit}` :
                `${coupon.usedCount}/Không giới hạn`,
            startDateFormatted: coupon.startDate ?
                new Date(coupon.startDate).toLocaleDateString('vi-VN') : '-',
            endDateFormatted: coupon.endDate ?
                new Date(coupon.endDate).toLocaleDateString('vi-VN') : '-',
            isActive: coupon.status && !coupon.isExpired && !coupon.isFullyUsed,
            statusText: !coupon.status ? 'Không hoạt động' :
                coupon.isExpired ? 'Hết hạn' :
                    coupon.isFullyUsed ? 'Đã dùng hết' : 'Đang hoạt động'
        };
    }
);

export const selectCouponValidation = createSelector(
    [selectCouponState],
    (state) => state.couponValidation
);

export const selectFormattedCouponValidation = createSelector(
    [selectCouponValidation],
    (validation) => {
        if (!validation) return null;

        return {
            ...validation,
            formattedDiscountAmount: validation.discountAmount ?
                `${validation.discountAmount.toLocaleString('vi-VN')}đ` : '0đ',
            statusClass: validation.valid ? 'success' : 'error',
            statusText: validation.valid ? 'Mã giảm giá hợp lệ' : 'Mã giảm giá không hợp lệ'
        };
    }
);

export const selectCouponStatistics = createSelector(
    [selectCouponState],
    (state) => state.couponStatistics
);

export const selectFormattedCouponStatistics = createSelector(
    [selectCouponStatistics],
    (statistics) => {
        if (!statistics) return null;

        return {
            ...statistics,
            activePercentage: statistics.totalCoupons ?
                (statistics.activeCoupons / statistics.totalCoupons * 100).toFixed(1) : '0',
            expiredPercentage: statistics.totalCoupons ?
                (statistics.expiredCoupons / statistics.totalCoupons * 100).toFixed(1) : '0',
            fullyUsedPercentage: statistics.totalCoupons ?
                (statistics.fullyUsedCoupons / statistics.totalCoupons * 100).toFixed(1) : '0'
        };
    }
);

export const selectIsLoading = createSelector(
    [selectCouponState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectCouponState],
    (state) => state.error
);

// Pagination selectors
export const selectCouponPageInfo = createSelector(
    [selectCouponsPage],
    (coupons) => ({
        totalPages: coupons.totalPages,
        totalElements: coupons.totalElements,
        size: coupons.size,
        number: coupons.number,
        first: coupons.first,
        last: coupons.last,
        empty: coupons.empty,
        hasNext: !coupons.last,
        hasPrevious: !coupons.first
    })
);

// Coupon information selectors
export const selectCouponById = createSelector(
    [selectCouponsList, (_: RootState, couponId: number) => couponId],
    (coupons, couponId) => {
        const found = coupons.find(c => c?.couponId === couponId);
        return found || null;
    }
);

export const selectCouponByCode = createSelector(
    [selectCouponsList, (_: RootState, code: string) => code],
    (coupons, code) => {
        const found = coupons.find(c => c?.code === code);
        return found || null;
    }
);

// Status and type based selectors
export const selectActiveCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => coupon?.status && !coupon.isExpired && !coupon.isFullyUsed)
);

export const selectInactiveCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => !coupon?.status)
);

export const selectExpiredCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => coupon?.isExpired)
);

export const selectFullyUsedCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => coupon?.isFullyUsed)
);

export const selectPercentageCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => coupon?.type === CouponType.PERCENTAGE)
);

export const selectFixedAmountCoupons = createSelector(
    [selectCouponsList],
    (coupons) => coupons.filter(coupon => coupon?.type === CouponType.FIXED_AMOUNT)
);

// Search and filter selectors
interface CouponFilters {
    code?: string;
    status?: boolean;
    isExpired?: boolean;
    startDate?: string;
    endDate?: string;
    type?: CouponType;
    isFullyUsed?: boolean;
}

export const selectFilteredCoupons = createSelector(
    [selectCouponsList, (_: RootState, filters: CouponFilters) => filters],
    (coupons, filters) => {
        if (!coupons || !Array.isArray(coupons) || !filters) {
            return coupons || [];
        }

        return coupons.filter(coupon => {
            if (!coupon) return false;

            const matchesCode = !filters.code || coupon.code.toLowerCase().includes(filters.code.toLowerCase());
            const matchesStatus = filters.status === undefined || coupon.status === filters.status;
            const matchesExpiry = filters.isExpired === undefined || coupon.isExpired === filters.isExpired;
            const matchesType = !filters.type || coupon.type === filters.type;
            const matchesFullyUsed = filters.isFullyUsed === undefined || coupon.isFullyUsed === filters.isFullyUsed;

            let matchesDateRange = true;
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate).getTime();
                const endDate = new Date(filters.endDate).getTime();

                if (coupon.startDate) {
                    const couponStartDate = new Date(coupon.startDate).getTime();
                    matchesDateRange = couponStartDate >= startDate && couponStartDate <= endDate;
                }

                if (matchesDateRange && coupon.endDate) {
                    const couponEndDate = new Date(coupon.endDate).getTime();
                    matchesDateRange = couponEndDate >= startDate && couponEndDate <= endDate;
                }
            }

            return matchesCode && matchesStatus && matchesExpiry && matchesType && matchesFullyUsed && matchesDateRange;
        });
    }
);

// Count selectors
export const selectCouponsCount = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Tổng cộng: ${pageInfo.totalElements} mã giảm giá`
    })
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectCouponOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Đang tải...' : error ? 'Đã xảy ra lỗi' : 'Thành công'
    })
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedCoupons = createSelector(
    [
        selectCouponsList,
        (_: RootState, sortBy: keyof CouponResponseDTO) => sortBy,
        (_: RootState, __: keyof CouponResponseDTO, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (coupons, sortBy, sortOrder) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        return [...coupons]
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

                if (sortBy === 'startDate' || sortBy === 'endDate') {
                    const dateA = aVal ? new Date(String(aVal)).getTime() : 0;
                    const dateB = bVal ? new Date(String(bVal)).getTime() : 0;
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            })
            .map((c, index) => {
                if (!c) return null;
                return {
                    ...c,
                    sortIndex: index + 1,
                    sortedBy: sortBy
                };
            }).filter(Boolean);
    }
);

// Empty state selector
export const selectIsCouponsEmpty = createSelector(
    [selectCouponPageInfo, selectCouponsList],
    (pageInfo, coupons) => ({
        isEmpty: pageInfo.empty || !coupons || coupons.length === 0,
        message: pageInfo.empty ? 'Không tìm thấy mã giảm giá' : 'Đã tìm thấy mã giảm giá'
    })
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        isFirst: pageInfo.first,
        canNavigatePrevious: !pageInfo.first
    })
);

export const selectIsLastPage = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        isLast: pageInfo.last,
        canNavigateNext: !pageInfo.last
    })
);

export const selectCurrentPage = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        current: pageInfo.number,
        displayText: `Trang ${pageInfo.number + 1} / ${pageInfo.totalPages}`
    })
);

export const selectPageSize = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        size: pageInfo.size,
        displayText: `Hiển thị ${pageInfo.size} mục mỗi trang`
    })
);

export const selectTotalPages = createSelector(
    [selectCouponPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalPages,
        displayText: `Tổng số trang: ${pageInfo.totalPages}`
    })
);

// Date selectors
export const selectRecentCoupons = createSelector(
    [selectCouponsList],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        const now = new Date().getTime();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

        return coupons
            .filter(coupon => {
                if (!coupon) return false;

                const createdOrUpdated = coupon.startDate ?
                    new Date(coupon.startDate).getTime() > oneWeekAgo :
                    false;

                return createdOrUpdated;
            })
            .slice(0, 5);
    }
);

export const selectExpiringCoupons = createSelector(
    [selectActiveCoupons],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        const now = new Date().getTime();
        const oneWeekLater = now + (7 * 24 * 60 * 60 * 1000);

        return coupons
            .filter(coupon => {
                if (!coupon || !coupon.endDate) return false;

                const expiryDate = new Date(coupon.endDate).getTime();
                return expiryDate > now && expiryDate < oneWeekLater;
            })
            .sort((a, b) => {
                if (!a || !b || !a.endDate || !b.endDate) return 0;
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            })
            .map(coupon => {
                if (!coupon || !coupon.endDate) return null;

                const expiryDate = new Date(coupon.endDate).getTime();
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                return {
                    ...coupon,
                    daysLeft,
                    daysLeftDisplay: `Còn ${daysLeft} ${daysLeft === 1 ? 'ngày' : 'ngày'}`
                };
            })
            .filter(Boolean);
    }
);

// Statistics selectors
export const selectCouponTypeCounts = createSelector(
    [selectCouponsList],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return {
                percentage: 0,
                fixedAmount: 0
            };
        }

        return {
            percentage: coupons.filter(c => c?.type === CouponType.PERCENTAGE).length,
            fixedAmount: coupons.filter(c => c?.type === CouponType.FIXED_AMOUNT).length
        };
    }
);

export const selectCouponStatusCounts = createSelector(
    [selectCouponsList],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return {
                active: 0,
                inactive: 0,
                expired: 0,
                fullyUsed: 0
            };
        }

        return {
            active: coupons.filter(c => c?.status && !c.isExpired && !c.isFullyUsed).length,
            inactive: coupons.filter(c => !c?.status).length,
            expired: coupons.filter(c => c?.isExpired).length,
            fullyUsed: coupons.filter(c => c?.isFullyUsed).length
        };
    }
);

// Dashboard summary selectors
export const selectCouponSummary = createSelector(
    [selectCouponStatistics, selectCouponsList],
    (statistics, coupons) => {
        if (!statistics || !coupons) {
            return {
                totalCoupons: 0,
                activeCoupons: 0,
                activePercentage: '0%',
                expiredCoupons: 0,
                expiredPercentage: '0%',
                fullyUsedCoupons: 0,
                fullyUsedPercentage: '0%',
                percentageCoupons: 0,
                fixedAmountCoupons: 0
            };
        }

        const percentageCoupons = coupons.filter(c => c?.type === CouponType.PERCENTAGE).length;
        const fixedAmountCoupons = coupons.filter(c => c?.type === CouponType.FIXED_AMOUNT).length;

        return {
            totalCoupons: statistics.totalCoupons,
            activeCoupons: statistics.activeCoupons,
            activePercentage: `${(statistics.activeCoupons / statistics.totalCoupons * 100).toFixed(1)}%`,
            expiredCoupons: statistics.expiredCoupons,
            expiredPercentage: `${(statistics.expiredCoupons / statistics.totalCoupons * 100).toFixed(1)}%`,
            fullyUsedCoupons: statistics.fullyUsedCoupons,
            fullyUsedPercentage: `${(statistics.fullyUsedCoupons / statistics.totalCoupons * 100).toFixed(1)}%`,
            percentageCoupons,
            fixedAmountCoupons
        };
    }
);

// Order coupon selectors
export const selectOrderCoupons = createSelector(
    [selectCouponState],
    (state) => state.orderCoupons || []
);

export const selectFormattedOrderCoupons = createSelector(
    [selectOrderCoupons],
    (coupons) => {
        if (!coupons || !Array.isArray(coupons)) {
            return [];
        }

        return coupons.map(coupon => {
            if (!coupon) return null;

            const formattedValue = coupon.type === CouponType.PERCENTAGE ?
                `${coupon.discountAmount}%` :
                `${coupon.discountAmount.toLocaleString('vi-VN')}đ`;

            return {
                ...coupon,
                formattedValue,
                displayName: `${coupon.code} (${formattedValue})`,
            };
        }).filter(Boolean);
    }
);

export const selectOrderWithCoupon = createSelector(
    [selectCouponState],
    (state) => state.orderWithCoupon
);

export const selectOrderDiscount = createSelector(
    [selectOrderWithCoupon],
    (orderWithCoupon) => {
        if (!orderWithCoupon) return 0;
        return orderWithCoupon.totalDiscount;
    }
);

export const selectFormattedOrderDiscount = createSelector(
    [selectOrderDiscount],
    (discount) => {
        return `${discount.toLocaleString('vi-VN')}đ`;
    }
);

export const selectSubtotalBeforeDiscount = createSelector(
    [selectOrderWithCoupon],
    (orderWithCoupon) => {
        if (!orderWithCoupon) return 0;
        return orderWithCoupon.subtotalBeforeDiscount;
    }
);

export const selectFormattedSubtotalBeforeDiscount = createSelector(
    [selectSubtotalBeforeDiscount],
    (subtotal) => {
        return `${subtotal.toLocaleString('vi-VN')}đ`;
    }
);

export const selectHasAppliedCoupons = createSelector(
    [selectOrderCoupons],
    (coupons) => {
        return coupons && coupons.length > 0;
    }
);

export const selectTotalOrderCoupons = createSelector(
    [selectOrderCoupons],
    (coupons) => {
        return coupons ? coupons.length : 0;
    }
);