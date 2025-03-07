// src/components/order/detail/ErrorState.tsx
import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
    errorMessage: string;
    onRetry: () => void;
    onBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage, onRetry, onBack }) => {
    return (
        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{errorMessage}</p>
            <div className="flex justify-center gap-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Thử lại
                </button>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            </div>
        </div>
    );
};

export default ErrorState;