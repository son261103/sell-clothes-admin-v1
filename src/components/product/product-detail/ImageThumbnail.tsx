import React from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface ImageThumbnailProps {
    src: string;
    onClick: () => void;
    onUpdate: () => void;
    onDelete: () => void;
    isActive: boolean;
    isPrimary?: boolean;
    displayOrder?: number;
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
                                                                  src,
                                                                  onClick,
                                                                  onUpdate,
                                                                  onDelete,
                                                                  isActive,
                                                                  isPrimary,
                                                                  displayOrder
                                                              }) => (
    <div className="flex flex-col items-center space-y-2">
        <div
            className={`relative aspect-square w-full max-w-[120px] cursor-pointer rounded-lg overflow-hidden border-2 
                transition-all duration-200 transform hover:scale-105
                ${isActive ? 'border-primary' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
            onClick={onClick}
        >
            <img src={src} alt={`Product thumbnail ${displayOrder}`} className="w-full h-full object-cover" />
            {isPrimary && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">Chính</div>
            )}
            {displayOrder !== undefined && displayOrder !== null && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">{displayOrder}</div>
            )}
        </div>
        <div className="flex justify-center gap-2 w-full">
            <button
                onClick={onUpdate}
                className="bg-primary text-white text-xs px-2 py-0.5 rounded hover:bg-primary/90 transition-colors flex items-center"
                title="Đổi ảnh"
            >
                <Upload className="w-3 h-3 mr-1" />
                Đổi
            </button>
            <button
                onClick={onDelete}
                className="bg-red-600 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600/90 transition-colors flex items-center"
                title="Xóa ảnh"
            >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
            </button>
        </div>
    </div>
);