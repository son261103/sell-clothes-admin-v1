import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
                                                            images,
                                                            currentIndex,
                                                            onClose,
                                                            onPrevious,
                                                            onNext
                                                        }) => {
    if (images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
                title="Đóng"
            >
                <X className="w-6 h-6" />
            </button>
            <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                title="Ảnh trước"
                disabled={images.length <= 1}
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="max-w-4xl max-h-[80vh] p-4">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
                <div className="text-center text-white mt-4">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
            <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                title="Ảnh tiếp theo"
                disabled={images.length <= 1}
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
    );
};