import React, { useState } from 'react';
import { Info, Tag } from 'lucide-react';
import {
    useProductExcel,
    useProductExcelBulkSkuGeneration,
    useProductExcelSkuGeneration
} from '../../hooks/productExcelHooks';
import BulkSkuGenerationForm from './BulkSkuGenerationForm';
import BulkSkuPreviewCard from './BulkSkuPreviewCard';
import SkuGenerationForm from './SkuGenerationForm';
import SkuPreviewCard from './SkuPreviewCard';
import ErrorMessage from './ErrorMessage';
import InfoModal from './InfoModal';

const BulkSkuTab: React.FC = () => {
    // State
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [productName, setProductName] = useState('');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Hooks
    const { error: generalError, clearError } = useProductExcel();

    // Single SKU generation
    const {
        skuPreview,
        isLoading: isLoadingSku,
        generateSkuPreview,
        clearSkuPreview
    } = useProductExcelSkuGeneration();

    // Bulk SKU generation
    const {
        bulkSkuPreview,
        isLoading: isLoadingBulkSku,
        generateBulkSkuPreview,
        clearBulkSkuPreview
    } = useProductExcelBulkSkuGeneration();

    // Handlers
    const handleGenerateSkuPreview = async () => {
        if (!productName || !size || !color) return;

        await generateSkuPreview({
            productName,
            size,
            color
        });
    };

    const handleGenerateBulkSkuPreview = async () => {
        if (!productName || sizes.length === 0 || colors.length === 0) return;

        await generateBulkSkuPreview({
            productName,
            sizes,
            colors
        });
    };

    const toggleMode = () => {
        setIsBulkMode(!isBulkMode);
        // Clear previews when switching modes
        clearSkuPreview();
        clearBulkSkuPreview();
    };

    // Modal content
    const renderInfoContent = () => (
        <div className="space-y-4">
            <h4 className="font-medium">Hướng dẫn tạo mã SKU</h4>
            <p>
                Tính năng này giúp bạn tạo mã SKU cho sản phẩm dựa trên tên sản phẩm, kích thước và màu sắc.
                Mã SKU được tạo theo định dạng: <code>[MÃ_SP]-[KÍCH_THƯỚC]-[MÀU_SẮC]</code>
            </p>

            <div className="space-y-2">
                <p><strong>Cách tạo mã SKU:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Nhập tên sản phẩm (ví dụ: "Áo thun nam")</li>
                    <li>Nhập kích thước (ví dụ: "S", "M", "L", "XL")</li>
                    <li>Nhập màu sắc (ví dụ: "Đỏ", "Xanh", "Trắng")</li>
                    <li>Nhấn nút "Tạo mã SKU"</li>
                </ol>

                <p className="mt-3"><strong>Chế độ tạo hàng loạt:</strong></p>
                <p>
                    Nếu bạn cần tạo nhiều mã SKU cùng lúc, hãy chuyển sang chế độ "Tạo hàng loạt",
                    sau đó thêm nhiều kích thước và màu sắc để tạo tất cả các tổ hợp SKU có thể.
                </p>

                <p className="mt-3"><strong>Sử dụng mã SKU:</strong></p>
                <p>
                    Mã SKU được tạo ra có thể sử dụng trực tiếp trong file Excel khi nhập sản phẩm.
                    Đường dẫn thư mục hình ảnh cũng được tạo tự động giúp bạn tổ chức hình ảnh trong file ZIP.
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-start">
                    <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-primary">Tạo mã SKU</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Công cụ tạo mã SKU tự động dựa trên tên sản phẩm, kích thước và màu sắc.
                            Bạn có thể tạo một mã SKU đơn lẻ hoặc nhiều mã SKU cùng lúc.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Công cụ tạo mã SKU</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleMode}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        {isBulkMode ? 'Chế độ đơn lẻ' : 'Chế độ hàng loạt'}
                    </button>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <Info className="h-3.5 w-3.5" />
                        <span>Hướng dẫn</span>
                    </button>
                </div>
            </div>

            {isBulkMode ? (
                <>
                    <BulkSkuGenerationForm
                        productName={productName}
                        sizes={sizes}
                        colors={colors}
                        handleProductNameChange={setProductName}
                        handleSizesChange={setSizes}
                        handleColorsChange={setColors}
                        handleGenerateBulkSkuPreview={handleGenerateBulkSkuPreview}
                        isLoading={isLoadingBulkSku}
                    />
                    <BulkSkuPreviewCard
                        bulkSkuPreview={bulkSkuPreview}
                        isLoading={isLoadingBulkSku}
                    />
                </>
            ) : (
                <>
                    <SkuGenerationForm
                        productName={productName}
                        size={size}
                        color={color}
                        handleProductNameChange={setProductName}
                        handleSizeChange={setSize}
                        handleColorChange={setColor}
                        handleGenerateSkuPreview={handleGenerateSkuPreview}
                        isLoading={isLoadingSku}
                    />
                    <SkuPreviewCard
                        skuPreview={skuPreview}
                        isLoading={isLoadingSku}
                    />
                </>
            )}

            {/* Error Message */}
            <ErrorMessage error={generalError} onClear={clearError} />

            {/* Info Modal */}
            <InfoModal
                isOpen={showInfoModal}
                title="Hướng dẫn tạo mã SKU"
                content={renderInfoContent()}
                onClose={() => setShowInfoModal(false)}
            />
        </div>
    );
};

export default BulkSkuTab;