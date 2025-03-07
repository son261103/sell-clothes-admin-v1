import React, { useState } from 'react';
import { Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { OrderSummaryDTO, OrderStatus } from '@/types';
import OrderStatusWorkflowPopup from './OrderStatusWorkflowPopup';

interface OrderActionButtonsProps {
    order: OrderSummaryDTO;
    onView: (order: OrderSummaryDTO) => void;
    onDelete: (order: OrderSummaryDTO) => void;
    onStatusChange: (id: number, newStatus: OrderStatus) => void;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
                                                                   order,
                                                                   onView,
                                                                   onDelete,
                                                                   onStatusChange
                                                               }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isWorkflowPopupOpen, setIsWorkflowPopupOpen] = useState(false);

    const handleViewClick = () => {
        onView(order);
    };

    const handleDeleteClick = () => {
        onDelete(order);
    };

    const handleStatusChange = (newStatus: OrderStatus) => {
        onStatusChange(order.orderId, newStatus);
        setIsDropdownOpen(false);
    };

    const handleOpenWorkflowPopup = () => {
        setIsDropdownOpen(false);
        setIsWorkflowPopupOpen(true);
    };

    return (
        <div className="relative flex items-center gap-2">
            <button
                onClick={handleViewClick}
                className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                title="Xem chi tiết"
            >
                <Eye className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-7 w-7 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    title="Thao tác khác"
                >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20">
                            <div className="py-1">
                                <button
                                    onClick={handleOpenWorkflowPopup}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Cập nhật trạng thái
                                </button>

                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa đơn hàng
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Order Status Workflow Popup */}
            <OrderStatusWorkflowPopup
                isOpen={isWorkflowPopupOpen}
                currentStatus={order.status}
                onClose={() => setIsWorkflowPopupOpen(false)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
};

export default OrderActionButtons;