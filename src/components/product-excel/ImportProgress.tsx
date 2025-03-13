import React, { useEffect, useState } from 'react';
import { Loader2, Clock, CheckCircle } from 'lucide-react';

// Match the type structure from progressInfo
interface ProgressInfo {
    percentComplete: number;
    processedItems: number;
    totalItems: number;
    inProgress?: boolean;
    jobId?: string;
    startTime?: string;
    estimatedEndTime?: string;
    currentStatus?: string;
    errors?: string[];
    message?: string;
}

interface ImportProgressProps {
    isImporting: boolean;
    progress: ProgressInfo | null | undefined;
    pollProgress: () => Promise<void>;
    onComplete?: () => void;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
                                                           isImporting,
                                                           progress,
                                                           pollProgress,
                                                           onComplete
                                                       }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Start polling when importing begins
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let timer: NodeJS.Timeout | null = null;

        if (isImporting) {
            // Reset states
            setElapsedTime(0);
            setIsComplete(false);

            // Set up polling interval for progress
            interval = setInterval(() => {
                pollProgress();
            }, 2000);

            // Set up timer for elapsed time
            timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (progress?.percentComplete === 100) {
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timer) clearInterval(timer);
        };
    }, [isImporting, pollProgress, progress?.percentComplete, onComplete]);

    if (!isImporting && !isComplete) return null;

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Estimate remaining time based on progress
    const estimateRemaining = () => {
        if (!progress || progress.percentComplete === 0) return '...';
        const totalTimeEstimate = (elapsedTime / progress.percentComplete) * 100;
        const remaining = Math.max(0, totalTimeEstimate - elapsedTime);
        return formatTime(Math.round(remaining));
    };

    // Use default values if progress is null or undefined
    const percentComplete = progress?.percentComplete || 0;
    const processedItems = progress?.processedItems || 0;
    const totalItems = progress?.totalItems || 0;
    const statusMessage = progress?.currentStatus || 'Đang nhập dữ liệu...';

    return (
        <div className="border rounded-md p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    {isComplete ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                        <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                    )}
                    <h3 className="font-medium">
                        {isComplete
                            ? 'Nhập dữ liệu hoàn tất'
                            : statusMessage}
                    </h3>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
            {isComplete
                ? `Thời gian: ${formatTime(elapsedTime)}`
                : `Còn lại: ~${estimateRemaining()}`}
          </span>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span>{percentComplete}% hoàn thành</span>
                    <span>
            {processedItems} / {totalItems} mục
          </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${percentComplete}%` }}
                    ></div>
                </div>
            </div>

            {progress?.errors && progress.errors.length > 0 && (
                <div className="mt-2 border-l-2 border-amber-500 pl-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-r-md">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Cảnh báo:</p>
                    <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-300 space-y-1 mt-1">
                        {progress.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isImporting && (
                <p className="text-xs text-gray-500 italic">
                    Quá trình nhập có thể mất vài phút. Vui lòng không đóng cửa sổ này.
                </p>
            )}
        </div>
    );
};

export default ImportProgress;