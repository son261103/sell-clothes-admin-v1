import React from 'react';

interface LoadingProps {
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="text-white">Đang xử lý...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-4">
            <div className="loading loading-spinner loading-md text-primary"></div>
        </div>
    );
};

export default Loading;