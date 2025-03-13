import React from 'react';
import { X } from 'lucide-react';
import { ErrorMessageProps } from './types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClear }) => {
    if (!error) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex justify-between items-center">
            <div>{error}</div>
            <button onClick={onClear} className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default ErrorMessage;