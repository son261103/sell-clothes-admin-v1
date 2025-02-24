import React from 'react';
import { Trash2, Star, StarOff, ImageOff } from 'lucide-react';
import type { ProductImageResponse } from '@/types';

interface ProductImageGalleryProps {
    images: ProductImageResponse[];
    isLoading: boolean;
    onDelete: (imageId: number, imageUrl: string) => void;
    onSetPrimary: (imageId: number) => void;
}

const ImageLoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="mt-2 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
);

const ImageEmptyState = () => (
    <div className="col-span-full p-8 text-center">
        <ImageOff className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Chưa có hình ảnh nào
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Tải lên hình ảnh đầu tiên cho sản phẩm này.
        </p>
    </div>
);

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
                                                                     images,
                                                                     isLoading,
                                                                     onDelete,
                                                                     onSetPrimary
                                                                 }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, index) => (
                    <ImageLoadingSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (!images.length) {
        return <ImageEmptyState />;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
                <div
                    key={image.imageId}
                    className="group relative bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:scale-105"
                    data-aos="fade-up"
                >
                    {/* Image Container */}
                    <div className="aspect-square relative">
                        <img
                            src={image.imageUrl}
                            alt={`Product image ${image.imageId}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.jpg'; // Replace with your placeholder image
                            }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200">
                            {/* Action Buttons */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => onDelete(image.imageId, image.imageUrl)}
                                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                                    title="Xóa ảnh"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onSetPrimary(image.imageId)}
                                    className={`p-2 rounded-full transition-colors duration-200 ${
                                        image.isPrimary
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                                    title={image.isPrimary ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                                >
                                    {image.isPrimary ? (
                                        <Star className="w-4 h-4" />
                                    ) : (
                                        <StarOff className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {image.imageId}
                            </span>
                            {image.isPrimary && (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                    Ảnh chính
                                </span>
                            )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Thứ tự: {image.displayOrder}
                        </div>
                    </div>

                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-6 h-6 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductImageGallery;