import React from 'react';
import { Images, Plus, ImageIcon } from 'lucide-react';
import { ImageThumbnail } from './ImageThumbnail';
import { ProductImageHierarchyResponse } from '@/types'; // Đảm bảo import đúng đường dẫn

interface ProductImagesSectionProps {
    imageList: { imageUrl: string; isPrimary?: boolean; displayOrder?: number; imageId: number }[];
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    setIsImageViewerOpen: (open: boolean) => void;
    handleAddNewImage: () => void;
    handleUpdateImage: (imageId: number) => () => void;
    handleDeleteImage: (imageId: number) => () => void;
    imageStats?: ProductImageHierarchyResponse | null; // Đúng type từ interface
}

export const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
                                                                              imageList,
                                                                              selectedImageIndex,
                                                                              setSelectedImageIndex,
                                                                              setIsImageViewerOpen,
                                                                              handleAddNewImage,
                                                                              handleUpdateImage,
                                                                              handleDeleteImage,
                                                                              imageStats
                                                                          }) => (
    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Images className="w-5 h-5 text-primary" /> Hình ảnh sản phẩm
                </h2>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">Tổng số: {imageList.length} ảnh</div>
                    <button
                        onClick={handleAddNewImage}
                        className="inline-flex items-center px-2 py-1 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        title="Thêm ảnh mới"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Thêm ảnh
                    </button>
                </div>
            </div>

            {imageList.length > 0 ? (
                <div className="space-y-4">
                    <div
                        className="aspect-video relative rounded-lg overflow-hidden border dark:border-gray-700 cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-800"
                        onClick={() => setIsImageViewerOpen(true)}
                    >
                        <img src={imageList[selectedImageIndex].imageUrl} alt="Main product image" className="w-full h-full object-contain" />
                    </div>

                    {imageStats && (
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>Ảnh chính: {imageStats.primaryImages}</div>
                            <div>Ảnh phụ: {imageStats.nonPrimaryImages}</div>
                            <div>Tổng số ảnh: {imageStats.totalImages}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                        {imageList.map((img, index) => (
                            <ImageThumbnail
                                key={img.imageId}
                                src={img.imageUrl}
                                onClick={() => setSelectedImageIndex(index)}
                                onUpdate={handleUpdateImage(img.imageId)}
                                onDelete={handleDeleteImage(img.imageId)}
                                isActive={selectedImageIndex === index}
                                isPrimary={img.isPrimary}
                                displayOrder={img.displayOrder}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có hình ảnh</p>
                </div>
            )}
        </div>
    </div>
);