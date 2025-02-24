import { useState } from 'react';
import type { ProductResponse, ProductUpdateRequest } from '@/types';
import type { ProductEditTabType } from './ProductEditTabs';
import { Package2, Upload, X, FileText, Settings, Info } from 'lucide-react';
import { toast } from "react-hot-toast";
import ProductForm from './ProductForm';

interface ProductFormData {
    productId?: number;
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    categoryId: number;
    brandId: number;
    thumbnail?: string;
    status: boolean;
}

interface ProductEditContentProps {
    activeTab: ProductEditTabType;
    product: ProductResponse | null;
    onSubmit: (data: ProductUpdateRequest, thumbnailFile?: File) => Promise<void>;
    isLoading: boolean;
}

const ProductEditContent = ({
                                activeTab,
                                product,
                                onSubmit,
                                isLoading
                            }: ProductEditContentProps) => {
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState(product?.description || '');
    const [dragActive, setDragActive] = useState(false);

    const handleFormSubmit = async (formData: ProductFormData, thumbnailFile?: File) => {
        try {
            if (!product) return;

            const updateData: ProductUpdateRequest = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                salePrice: formData.salePrice,
                categoryId: formData.categoryId,
                brandId: formData.brandId,
                status: formData.status
            };

            await onSubmit(updateData, thumbnailFile);
        } catch (error) {
            console.error('Error in form submission:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
        }
    };

    const convertProductToFormData = (product: ProductResponse): ProductFormData => {
        return {
            productId: product.productId,
            name: product.name,
            description: product.description,
            price: product.price,
            salePrice: product.salePrice,
            categoryId: product.category.categoryId,
            brandId: product.brand.brandId,
            thumbnail: product.thumbnail,
            status: product.status
        };
    };

    const handleThumbnailUpload = async (file: File) => {
        if (!product) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPG, PNG và WebP');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file vượt quá 2MB');
            return;
        }

        setUploadingThumbnail(true);
        try {
            const formData = convertProductToFormData(product);
            await handleFormSubmit(formData, file);
            setPreviewUrl(null);
            setSelectedFile(null);
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleUploadSelectedFile = async () => {
        if (selectedFile) {
            await handleThumbnailUpload(selectedFile);
        }
    };

    const cancelPreview = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        if (product) {
            const formData = convertProductToFormData(product);
            handleFormSubmit({
                ...formData,
                description: value
            });
        }
    };

    const handleSEOTitleChange = (value: string) => {
        if (product) {
            const formData = convertProductToFormData(product);
            handleFormSubmit({
                ...formData,
                name: value
            });
        }
    };

    const handleSEODescriptionChange = (value: string) => {
        if (product) {
            const formData = convertProductToFormData(product);
            handleFormSubmit({
                ...formData,
                description: value
            });
        }
    };

    const handleStatusToggle = () => {
        if (product) {
            const formData = convertProductToFormData(product);
            handleFormSubmit({
                ...formData,
                status: !product.status
            });
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                toast.error('Chỉ chấp nhận file hình ảnh');
                return;
            }

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước file vượt quá 2MB');
                return;
            }

            previewFile(file);
        }
    };

    const previewFile = (file: File) => {
        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            previewFile(file);
        }
    };


    switch (activeTab) {
        case 'info':
            return product ? (
                <ProductForm
                    initialData={product}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                />
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin sản phẩm
                </div>
            );

        case 'thumbnail':
            return product ? (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left side - Thumbnail display area */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Package2 className="w-5 h-5" /> Hình ảnh sản phẩm
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview thumbnail"
                                            className="h-48 w-48 object-contain rounded-lg"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleUploadSelectedFile}
                                                disabled={isLoading || uploadingThumbnail}
                                                className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 flex items-center gap-1"
                                            >
                                                <Upload className="w-3 h-3" />
                                                Tải lên
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelPreview}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" />
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : product.thumbnail ? (
                                    <div className="relative">
                                        <img
                                            src={product.thumbnail}
                                            alt={`${product.name} thumbnail`}
                                            className="h-48 w-48 object-contain rounded-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-product.png';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                        <Package2 className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Thumbnail information and actions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Info className="w-5 h-5" /> Thông tin hình ảnh
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            {product.thumbnail
                                                ? "Đã có ảnh đại diện"
                                                : "Chưa có ảnh đại diện"}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Định dạng được hỗ trợ</h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            JPG, PNG, WebP
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Kích thước tối đa</h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            2MB
                                        </p>
                                    </div>

                                    <div
                                        className={`mt-6 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors
                                            ${dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                                        }`}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {uploadingThumbnail ? (
                                            <div className="flex flex-col items-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    Đang tải lên...
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-4">
                                                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                                                    Kéo và thả file vào đây hoặc
                                                    <label
                                                        htmlFor="logo-upload"
                                                        className="ml-1 font-medium text-primary hover:text-primary/90 cursor-pointer"
                                                    >
                                                        chọn từ thiết bị
                                                        <input
                                                            id="logo-upload"
                                                            name="logo-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={handleFileChange}
                                                            disabled={isLoading || uploadingThumbnail}
                                                        />
                                                    </label>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedFile && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thông tin file</h4>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <li><span className="font-medium">Tên:</span> {selectedFile.name}</li>
                                        <li><span className="font-medium">Kích thước:</span> {(selectedFile.size / 1024).toFixed(1)} KB</li>
                                        <li><span className="font-medium">Loại:</span> {selectedFile.type}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin sản phẩm
                </div>
            );

        case 'description':
            return product ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Mô tả sản phẩm
                    </h3>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <textarea
                                rows={10}
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                                         text-gray-900 dark:text-gray-100 text-sm
                                         focus:ring-2 focus:ring-primary/40 focus:border-primary
                                         transition-colors duration-200"
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Nhập mô tả sản phẩm..."
                            />
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Số ký tự: {description.length}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Hướng dẫn viết mô tả sản phẩm
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Mô tả chi tiết đặc điểm, tính năng và lợi ích của sản phẩm</li>
                            <li>• Sử dụng các điểm đánh dấu hoặc số thứ tự để liệt kê thông tin</li>
                            <li>• Cung cấp thông số kỹ thuật và thông tin quan trọng</li>
                            <li>• Đề cập đến các ứng dụng và cách sử dụng sản phẩm</li>
                            <li>• Tránh sử dụng từ ngữ phức tạp hoặc thuật ngữ chuyên ngành</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin sản phẩm
                </div>
            );

        case 'settings':
            return product ? (
                <div className="space-y-6">
                    <div className="grid gap-6">
                        {/* SEO Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Cài đặt SEO
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="space-y-4">
                                    {/* Meta Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700
                                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                     focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                            placeholder="Meta title cho SEO..."
                                            value={product.name}
                                            onChange={(e) => handleSEOTitleChange(e.target.value)}
                                        />
                                    </div>

                                    {/* URL Slug */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            URL Slug
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700
                                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                     focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                            placeholder="url-slug"
                                            value={product.slug || ''}
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            URL slug được tự động tạo từ tên sản phẩm
                                        </p>
                                    </div>

                                    {/* Meta Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Meta Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="mt-1 w-full p-3 rounded-md border border-gray-200 dark:border-gray-700
                                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                     focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                            placeholder="Meta description cho SEO..."
                                            value={product.description || ''}
                                            onChange={(e) => handleSEODescriptionChange(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Cài đặt nâng cao
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="space-y-4">
                                    {/* Status Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Trạng thái sản phẩm
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Hiển thị hoặc ẩn sản phẩm trên website
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                                                      border-2 border-transparent transition-colors duration-200 ease-in-out 
                                                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                                      ${product.status ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            role="switch"
                                            aria-checked={product.status}
                                            onClick={handleStatusToggle}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full 
                                                          bg-white shadow ring-0 transition duration-200 ease-in-out
                                                          ${product.status ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Created At */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Ngày tạo
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(product.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    {/* Updated At */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Cập nhật lần cuối
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(product.updatedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                                            Vùng nguy hiểm
                                        </h4>
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400
                                                         bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100
                                                         dark:hover:bg-red-900/40 transition-colors duration-200"
                                                onClick={() => {
                                                    // Handle delete product
                                                    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${product.name}?`)) {
                                                        console.log('Delete product:', product.productId);
                                                        // Thực hiện xóa sản phẩm ở đây
                                                    }
                                                }}
                                            >
                                                Xóa sản phẩm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin sản phẩm
                </div>
            );

        default:
            return null;
    }
};

export default ProductEditContent;