import React from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderEmptyStateProps {
    onRefresh: () => void;
}

const OrderEmptyState: React.FC<OrderEmptyStateProps> = ({ onRefresh }) => {
    return (
        <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Không có đơn hàng nào
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    Không tìm thấy đơn hàng nào trong hệ thống hoặc theo tiêu chí tìm kiếm của bạn.
                    Bạn có thể tạo đơn hàng mới hoặc làm mới để kiểm tra lại.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onRefresh}
                        className="h-9 px-4 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Làm mới</span>
                    </button>

                    <Link
                        to="/admin/orders/create"
                        className="h-9 px-4 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Tạo đơn hàng mới</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderEmptyState;