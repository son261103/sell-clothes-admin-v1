import React from 'react';
import { X, RefreshCw, Minimize2, Maximize2 } from 'lucide-react';
import { RoleResponse } from "../../types";

interface RoleEditHeaderProps {
    onClose: (e?: React.MouseEvent) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    role: RoleResponse | null;
    isCompact: boolean;
    onToggleCompact: () => void;
}

const RoleEditHeader: React.FC<RoleEditHeaderProps> = ({
                                                           onClose,
                                                           onRefresh,
                                                           isRefreshing,
                                                           isMobileView,
                                                           role,
                                                           isCompact,
                                                           onToggleCompact
                                                       }) => {
    const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"
             onClick={(e) => e.stopPropagation()}>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {role?.name}
                    </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {role?.description}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => handleButtonClick(e, onRefresh)}
                    className={`
                        h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 
                        text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                        flex items-center gap-1.5 transition-colors duration-200
                        ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span className={isMobileView ? 'hidden' : ''}>Làm mới</span>
                </button>
                <button
                    onClick={(e) => handleButtonClick(e, onToggleCompact)}
                    className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors duration-200"
                    title={isCompact ? "Mở rộng" : "Thu gọn"}
                >
                    {isCompact ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
                </button>
                <button
                    className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors duration-200"
                    onClick={(e) => handleButtonClick(e, () => onClose(e))}
                    aria-label="Đóng"
                >
                    <X className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
};

export default RoleEditHeader;