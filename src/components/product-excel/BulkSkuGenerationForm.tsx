import React, { useState } from 'react';
import { Tag, Loader2, PlusCircle, X } from 'lucide-react';
import { BulkSkuGenerationFormProps } from './types';

const BulkSkuGenerationForm: React.FC<BulkSkuGenerationFormProps> = ({
                                                                         productName,
                                                                         sizes,
                                                                         colors,
                                                                         handleProductNameChange,
                                                                         handleSizesChange,
                                                                         handleColorsChange,
                                                                         handleGenerateBulkSkuPreview,
                                                                         isLoading
                                                                     }) => {
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('');

    const addSize = () => {
        if (newSize && !sizes.includes(newSize)) {
            const updatedSizes = [...sizes, newSize];
            handleSizesChange(updatedSizes);
            setNewSize('');
        }
    };

    const removeSize = (sizeToRemove: string) => {
        const updatedSizes = sizes.filter(size => size !== sizeToRemove);
        handleSizesChange(updatedSizes);
    };

    const addColor = () => {
        if (newColor && !colors.includes(newColor)) {
            const updatedColors = [...colors, newColor];
            handleColorsChange(updatedColors);
            setNewColor('');
        }
    };

    const removeColor = (colorToRemove: string) => {
        const updatedColors = colors.filter(color => color !== colorToRemove);
        handleColorsChange(updatedColors);
    };

    const handleNewSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSize();
        }
    };

    const handleNewColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addColor();
        }
    };

    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Tạo nhiều mã SKU</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhập thông tin sản phẩm, các kích thước và màu sắc để tạo các mã SKU
            </p>

            <div className="space-y-4">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kích thước * ({sizes.length})
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {sizes.map((size, index) => (
                            <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1">
                                <span className="text-sm">{size}</span>
                                <button
                                    onClick={() => removeSize(size)}
                                    className="ml-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyDown={handleNewSizeKeyDown}
                            placeholder="Thêm kích thước (S, M, L, XL...)"
                            className="flex-1 text-sm h-9 px-3 rounded-l-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        />
                        <button
                            onClick={addSize}
                            disabled={!newSize}
                            className={`h-9 px-3 rounded-r-md bg-primary text-white ${!newSize ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Màu sắc * ({colors.length})
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {colors.map((color, index) => (
                            <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1">
                                <span className="text-sm">{color}</span>
                                <button
                                    onClick={() => removeColor(color)}
                                    className="ml-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onKeyDown={handleNewColorKeyDown}
                            placeholder="Thêm màu sắc (Đỏ, Xanh, Trắng...)"
                            className="flex-1 text-sm h-9 px-3 rounded-l-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        />
                        <button
                            onClick={addColor}
                            disabled={!newColor}
                            className={`h-9 px-3 rounded-r-md bg-primary text-white ${!newColor ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleGenerateBulkSkuPreview}
                        disabled={isLoading || !productName || sizes.length === 0 || colors.length === 0}
                        className={`inline-flex justify-center h-9 px-4 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5 ${
                            isLoading || !productName || sizes.length === 0 || colors.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
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
                                <span>Tạo {sizes.length * colors.length} mã SKU</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkSkuGenerationForm;