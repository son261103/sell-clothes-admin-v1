import React, {useState, useCallback, ChangeEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    CircleArrowLeft, Building2, AlertCircle,
    Save, X, CheckCircle, XCircle, Upload
} from 'lucide-react';
import {toast} from 'react-hot-toast';

import ConfirmationModal from '../../components/common/ConfirmationModal';
import {useBrands} from '../../hooks/brandHooks';
import type {BrandCreateRequest} from '@/types';

interface ValidationError {
    [key: string]: string;
}

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({checked, onChange, disabled = false}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
            relative inline-flex h-6 w-11 items-center rounded-full 
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary/20
            ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        `}
    >
        <span className={`
            inline-block h-4 w-4 transform rounded-full 
            bg-white shadow-lg ring-0
            transition-all duration-300 ease-in-out
            ${checked ? 'translate-x-6 scale-110' : 'translate-x-1 scale-100'}
        `}
        />
    </button>
);

const BrandAddPage: React.FC = () => {
    const navigate = useNavigate();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<BrandCreateRequest>({
        name: '',
        description: '',
        status: true
    });

    const [validationErrors, setValidationErrors] = useState<ValidationError>({});

    // Get brand hooks
    const {
        createBrand,
        isLoading: isCreatingBrand
    } = useBrands();

    // Handle form input changes
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        setFormData(prev => {
            const newData = {...prev};
            (newData as Record<string, string | boolean>)[name] = value;
            return newData;
        });

        if (validationErrors[name]) {
            setValidationErrors(prev => ({...prev, [name]: ''}));
        }
    }, [validationErrors]);

    // Handle status change
    const handleSwitchChange = useCallback((checked: boolean) => {
        setFormData(prev => ({...prev, status: checked}));
    }, []);

    // Handle logo upload
    const handleLogoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Kiểm tra loại file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP và SVG');
            return;
        }

        // Kiểm tra kích thước file (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file vượt quá 2MB');
            return;
        }

        setLogoFile(file);

        // Tạo URL preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Xóa lỗi liên quan đến logo nếu có
        if (validationErrors.logo) {
            setValidationErrors(prev => ({...prev, logo: ''}));
        }
    }, [validationErrors]);

    // Handle logo removal
    const handleRemoveLogo = useCallback(() => {
        setLogoFile(null);
        setLogoPreview(null);
    }, []);

    // Validate form data
    const validateForm = useCallback((): boolean => {
        const errors: ValidationError = {};

        if (!formData.name?.trim()) {
            errors.name = 'Tên thương hiệu không được để trống';
        } else if (formData.name.length < 2) {
            errors.name = 'Tên thương hiệu phải có ít nhất 2 ký tự';
        }

        if (!formData.description?.trim()) {
            errors.description = 'Mô tả không được để trống';
        } else if (formData.description.length < 10) {
            errors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Handle showing create confirmation
    const handleShowCreateConfirm = useCallback(() => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin thương hiệu');
            return;
        }
        setShowCreateConfirmModal(true);
    }, [validateForm]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setError(null);
            const brandData: BrandCreateRequest = {
                name: formData.name,
                description: formData.description,
                status: formData.status
            };

            const result = await createBrand(brandData, logoFile || undefined);

            if (result && result.brandId) {
                toast.success('Tạo thương hiệu mới thành công');
                navigate('/admin/brands/list');
            } else {
                throw new Error('Không thể tạo thương hiệu');
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn khi tạo thương hiệu';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Error creating brand:', error);
        } finally {
            setIsSubmitting(false);
            setShowCreateConfirmModal(false);
        }
    }, [formData, createBrand, navigate, logoFile]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.description || logoFile) {
            setShowConfirmModal(true);
        } else {
            navigate('/admin/brands/list');
        }
    }, [navigate, formData, logoFile]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Kiểm tra loại file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP và SVG');
            return;
        }

        // Kiểm tra kích thước file (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file vượt quá 2MB');
            return;
        }

        setLogoFile(file);

        // Tạo URL preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // Get logo file size in KB (safely)
    const getFileSize = useCallback((file: File | null): string => {
        if (!file) return '0';
        return (file.size / 1024).toFixed(1);
    }, []);

    const isLoading = isCreatingBrand || isSubmitting;
    const pageTitle = 'Thêm thương hiệu mới';
    const submitButtonText = 'Tạo thương hiệu';

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div data-aos="fade-down">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors"
                            aria-label="Quay lại"
                        >
                            <CircleArrowLeft className="w-6 h-6"/>
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-primary"/>
                                {pageTitle}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Điền thông tin để tạo thương hiệu mới
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative" data-aos="fade-up" data-aos-delay="300">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Building2 className="h-6 w-6 text-primary"/>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formData.name || 'Thương hiệu mới'}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Thương hiệu
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${formData.status
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                    `}>
                                        {formData.status ? (
                                            <>
                                                <CheckCircle className="w-3 h-3"/>
                                                Hoạt động
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3"/>
                                                Vô hiệu
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-center p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0"/>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6 md:col-span-1">
                                    {/* Brand Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tên thương hiệu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên thương hiệu"
                                            className={`block w-full px-3 py-2 border rounded-lg text-sm
                                                ${validationErrors.name
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200`}
                                            disabled={isLoading}
                                        />
                                        {validationErrors.name && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Nhập mô tả cho thương hiệu"
                                            className={`block w-full px-3 py-2 border rounded-lg text-sm
                                                ${validationErrors.description
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200
                                                min-h-[120px] resize-y`}
                                            disabled={isLoading}
                                        />
                                        {validationErrors.description && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.description}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.status || false}
                                            onChange={handleSwitchChange}
                                            disabled={isLoading}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Kích hoạt thương hiệu
                                        </span>
                                    </div>
                                </div>

                                {/* Logo Upload Section */}
                                <div className="space-y-4 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Logo thương hiệu
                                    </label>

                                    {logoPreview ? (
                                        <div className="flex flex-col items-center space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="relative">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-36 h-36 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-50 rounded-full border border-red-200 text-red-500 hover:bg-red-100"
                                                    disabled={isLoading}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {logoFile?.name} ({getFileSize(logoFile)} KB)
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                                                Kéo thả file vào đây hoặc click để tải lên
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                                                PNG, JPG, WebP, SVG (tối đa 2MB)
                                            </p>
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    )}

                                    {validationErrors.logo && (
                                        <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                            <AlertCircle className="w-4 h-4"/>
                                            <span>{validationErrors.logo}</span>
                                        </div>
                                    )}

                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                            <strong>Lưu ý:</strong> Logo nên có kích thước đều và tỷ lệ 1:1 để hiển thị tốt nhất trên ứng dụng.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                                        hover:bg-gray-100 dark:hover:bg-gray-700
                                        rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20
                                        transition-colors duration-200"
                                    disabled={isLoading}
                                >
                                    <span className="flex items-center gap-2">
                                        <X className="w-4 h-4"/>
                                        Hủy
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleShowCreateConfirm}
                                    disabled={isLoading || !formData.name?.trim()}
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium
                                        text-white bg-primary rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-offset-2
                                        focus:ring-primary transition-all duration-200
                                        ${(isLoading || !formData.name?.trim())
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-primary/90'
                                    }
                                    `}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2"/>
                                            {submitButtonText}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Cancellation */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => navigate('/admin/brands/list')}
                title="Xác nhận hủy"
                message="Bạn có chắc chắn muốn hủy? Tất cả thông tin đã nhập sẽ bị mất."
                confirmText="Xác nhận"
                cancelText="Tiếp tục chỉnh sửa"
            />

            {/* Confirmation Modal for Create */}
            <ConfirmationModal
                isOpen={showCreateConfirmModal}
                onClose={() => setShowCreateConfirmModal(false)}
                onConfirm={handleSubmit}
                title="Xác nhận tạo thương hiệu"
                message={`Bạn có chắc chắn muốn tạo thương hiệu "${formData.name}" không?`}
                confirmText={submitButtonText}
                cancelText="Hủy"
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 transition-transform duration-300 transform">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Đang xử lý...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandAddPage;