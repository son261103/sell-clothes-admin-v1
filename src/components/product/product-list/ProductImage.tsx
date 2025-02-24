import React from 'react';
import { Package2 } from 'lucide-react';

interface ProductImageProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    refreshKey?: number;
}

const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
};

const ProductImage: React.FC<ProductImageProps> = ({
                                                       src,
                                                       alt,
                                                       size = 'md',
                                                       refreshKey = 0
                                                   }) => {
    const getImageUrl = (url: string) => {
        const timestamp = new Date().getTime();
        return url.includes('?')
            ? `${url}&t=${timestamp}&v=${refreshKey}`
            : `${url}?t=${timestamp}&v=${refreshKey}`;
    };

    return (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700`}>
            {src ? (
                <img
                    src={getImageUrl(src)}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.png';
                    }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Package2 className="w-6 h-6 text-gray-400"/>
                </div>
            )}
        </div>
    );
};

export default ProductImage;