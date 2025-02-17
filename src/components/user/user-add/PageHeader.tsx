import React from 'react';
import { CircleArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    onCancel: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onCancel }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b aos-init aos-animate">
            <div className="flex items-center gap-4">
                <button
                    onClick={onCancel}
                    className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors"
                    aria-label="Quay lại"
                >
                    <CircleArrowLeft className="w-6 h-6"/>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight">
                        Thêm người dùng mới
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Điền thông tin để tạo tài khoản người dùng mới
                    </p>
                </div>
            </div>
        </div>
    );
};
