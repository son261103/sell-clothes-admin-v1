import type {BrandResponse, BrandUpdateRequest} from '@/types';
import type {BrandEditTabType} from './BrandEditTabs';
import BrandForm from '../brand-list/BrandForm';
import { Building2, Upload, X, Info } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useState } from 'react';

interface BrandFormData {
    brandId?: number;
    name: string;
    description?: string;
    logoUrl?: string;
    status: boolean;
}

interface BrandEditContentProps {
    activeTab: BrandEditTabType;
    brand: BrandResponse | null;
    onSubmit: (data: BrandUpdateRequest, logoFile?: File) => Promise<void>;
    onDeleteLogo?: () => Promise<void>;
    isLoading: boolean;
}

const BrandEditContent = ({
                              activeTab,
                              brand,
                              onSubmit,
                              onDeleteLogo,
                              isLoading
                          }: BrandEditContentProps) => {
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFormSubmit = async (formData: BrandFormData, logoFile?: File) => {
        try {
            if (!brand) return;

            const updateData: BrandUpdateRequest = {
                name: formData.name,
                description: formData.description,
                status: formData.status
            };

            // Submit form data and logo if provided
            await onSubmit(updateData, logoFile);
        } catch (error) {
            console.error('Error in form submission:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
        }
    };

    const handleLogoDelete = async () => {
        if (!onDeleteLogo) return;

        const toastId = toast.loading('Đang xóa logo...');
        try {
            await onDeleteLogo();
            toast.success('Xóa logo thành công', {id: toastId});
            // Clear preview if there is one
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error deleting logo:', error);
            toast.error('Không thể xóa logo', {id: toastId});
        }
    };

    const handleLogoUpload = async (file: File) => {
        if (!brand) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP và SVG');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file vượt quá 2MB');
            return;
        }

        setUploadingLogo(true);
        try {
            await handleFormSubmit({
                brandId: brand.brandId,
                name: brand.name,
                description: brand.description,
                logoUrl: brand.logoUrl,
                status: brand.status
            }, file);

            // Clear preview after successful upload
            setPreviewUrl(null);
            setSelectedFile(null);
        } finally {
            setUploadingLogo(false);
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

    const handleUploadSelectedFile = async () => {
        if (selectedFile) {
            await handleLogoUpload(selectedFile);
        }
    };

    const cancelPreview = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    switch (activeTab) {
        case 'info':
            return brand ? (
                <BrandForm
                    initialData={brand}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                />
            ) : (
                <div className="text-center text-secondary dark:text-highlight">
                    Không tìm thấy thông tin thương hiệu
                </div>
            );

        case 'logo':
            return brand ? (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left side - Logo display area */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Building2 className="w-5 h-5" /> Logo thương hiệu
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview logo"
                                            className="h-48 w-48 object-contain rounded-lg"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleUploadSelectedFile}
                                                disabled={isLoading || uploadingLogo}
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
                                ) : brand.logoUrl ? (
                                    <div className="relative">
                                        <img
                                            src={brand.logoUrl}
                                            alt={`${brand.name} logo`}
                                            className="h-48 w-48 object-contain rounded-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-logo.png';
                                            }}
                                        />
                                        {onDeleteLogo && (
                                            <button
                                                type="button"
                                                onClick={handleLogoDelete}
                                                disabled={isLoading || uploadingLogo}
                                                className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                                            >
                                                <span className="sr-only">Delete logo</span>
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                        <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Logo information and actions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Info className="w-5 h-5" /> Thông tin logo
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            {brand.logoUrl
                                                ? "Đã có logo"
                                                : "Chưa có logo"}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Định dạng được hỗ trợ</h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            JPG, PNG, WebP, SVG
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
                                        {uploadingLogo ? (
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
                                                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                            onChange={handleFileChange}
                                                            disabled={isLoading || uploadingLogo}
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
                    Không tìm thấy thông tin thương hiệu
                </div>
            );

        case 'settings':
            return (
                <div className="text-center text-secondary dark:text-highlight py-8">
                    Tính năng đang được phát triển
                </div>
            );

        default:
            return null;
    }
};

export default BrandEditContent;