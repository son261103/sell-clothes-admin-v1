import React from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { SkuGenerationFormProps } from './types';

const SkuGenerationForm: React.FC<SkuGenerationFormProps> = ({
                                                                 productName,
                                                                 size,
                                                                 color,
                                                                 handleProductNameChange,
                                                                 handleSizeChange,
                                                                 handleColorChange,
                                                                 handleGenerateSkuPreview,
                                                                 isLoading
                                                             }) => {
    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Tạo mã SKU</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhập thông tin sản phẩm để tạo mã SKU mẫu
            </p>

            <div className="space-y-3">
                <div>
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên sản phẩm *
                    </label>
                    <input
                        id="product-name"
                        type="text"
                        value={productName}
                        onChange={(e) => handleProductNameChange(e.target.value)}
                        placeholder="Áo thun nam"
                        className="w-full text-sm h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Tên sản phẩm sẽ được sử dụng để tạo phần đầu của mã SKU
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kích thước *
                        </label>
                        <input
                            id="size"
                            type="text"
                            value={size}
                            onChange={(e) => handleSizeChange(e.target.value)}
                            placeholder="S, M, L, XL, XXL"
                            className="w-full text-sm h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Màu sắc *
                        </label>
                        <input
                            id="color"
                            type="text"
                            value={color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            placeholder="Đỏ, Xanh, Trắng"
                            className="w-full text-sm h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleGenerateSkuPreview}
                        disabled={isLoading || !productName || !size || !color}
                        className={`inline-flex justify-center h-9 px-4 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5 ${
                            isLoading || !productName || !size || !color ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Đang tạo...</span>
                            </>
                        ) : (
                            <>
                                <Tag className="h-3.5 w-3.5" />
                                <span>Tạo mã SKU</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkuGenerationForm;