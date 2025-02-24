import React from 'react';
import type { ProductResponse } from '@/types';
import { formatPrice } from '@/utils/format';
import { Package2 } from 'lucide-react';
import ProductMobileActions from './ProductMobileActions';

interface ProductMobileViewProps {
    product: ProductResponse;
    onEdit: (product: ProductResponse) => void;
    onDelete: (product: ProductResponse) => void;
    onStatusChange: (id: number) => void;
    refreshKey: number;
    onRefreshImage: () => void;
    getStatusBadgeClass: (status: boolean) => string;
}

const ProductMobileView: React.FC<ProductMobileViewProps> = ({
                                                                 product,
                                                                 onEdit,
                                                                 onDelete,
                                                                 onStatusChange,
                                                                 refreshKey,
                                                                 onRefreshImage,
                                                                 getStatusBadgeClass
                                                             }) => {
    const getImageUrl = (url: string | undefined) => {
        if (!url) return undefined;
        const timestamp = new Date().getTime();
        if (url.includes('?')) {
            return `${url}&t=${timestamp}&v=${refreshKey}`;
        }
        return `${url}?t=${timestamp}&v=${refreshKey}`;
    };

    return (
        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {product.thumbnail ? (
                            <img
                                src={getImageUrl(product.thumbnail)}
                                alt={product.name}
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
                    <div>
                        <h3 className="font-medium text-base text-textDark dark:text-textLight">
                            {product.name}
                        </h3>
                        <div className="mt-1">
                            <span className={getStatusBadgeClass(product.status)}>
                                {product.status ? 'Hoạt động' : 'Vô hiệu'}
                            </span>
                        </div>
                    </div>
                </div>
                <ProductMobileActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onRefreshImage={onRefreshImage}
                />
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Giá bán:
                    </div>
                    <div className="text-sm font-medium text-primary">
                        {formatPrice(product.price)}
                    </div>
                </div>
                {product.salePrice && (
                    <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Giá khuyến mãi:
                        </div>
                        <div className="text-sm font-medium text-red-600">
                            {formatPrice(product.salePrice)}
                        </div>
                    </div>
                )}
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {product.description || 'Không có mô tả'}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                        {product.category.name} • {product.brand.name}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductMobileView;