import React from 'react';
import { Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { CouponResponseDTO } from '@/types';

interface CouponActionButtonsProps {
    coupon: CouponResponseDTO;
    onView: () => void;
    onDelete: () => void;
    onToggleStatus: () => void;
}

const CouponActionButtons: React.FC<CouponActionButtonsProps> = ({
                                                                     coupon,
                                                                     onView,
                                                                     onDelete,
                                                                     onToggleStatus
                                                                 }) => {
    const isDisabled = coupon.isExpired || coupon.isFullyUsed;

    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={onView}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                title="Xem chi tiết"
            >
                <Eye className="h-4 w-4" />
            </button>

            <button
                onClick={onToggleStatus}
                className={`p-1.5 rounded-md ${
                    isDisabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : coupon.status
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
                disabled={isDisabled}
                title={coupon.status ? "Vô hiệu hóa" : "Kích hoạt"}
            >
                {coupon.status ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>

            <button
                onClick={onDelete}
                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                title="Xóa mã giảm giá"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
};

export default CouponActionButtons;