import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
    status: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
    >
        {status ? (
            <>
                <CheckCircle className="w-3 h-3 mr-1" /> Đang bán
            </>
        ) : (
            <>
                <XCircle className="w-3 h-3 mr-1" /> Ngừng bán
            </>
        )}
    </span>
);