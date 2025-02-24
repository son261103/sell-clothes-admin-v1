import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CircleArrowLeft, Package, AlertCircle,
    Save, X, CheckCircle, XCircle, Building2, DollarSign, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useProducts } from '../../hooks/productHooks';
import { useCategories } from '../../hooks/categoryHooks';
import { useBrands } from '../../hooks/brandHooks';
import type { ProductCreateRequest, CategoryResponse, BrandResponse } from '@/types';
import { generateSlug } from '@/utils/stringUtils';

interface ValidationError {
    [key: string]: string;
}

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

interface FormFields {
    name: string;
    description: string;
    price: number;
    salePrice: number;
    categoryId: number;
    brandId: number;
    status: boolean;
    slug: string;
}

type FormFieldKey = keyof FormFields;

const isFormFieldKey = (key: string): key is FormFieldKey => {
    return key in initialFormState;
};

const initialFormState: FormFields = {
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    categoryId: 0,
    brandId: 0,
    status: true,
    slug: ''
};

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => (
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

const ProductAddPage: React.FC = () => {
    const navigate = useNavigate();
    const { createProduct, isLoading: isCreatingProduct } = useProducts();
    const { categoriesPage } = useCategories();
    const { brandsPage } = useBrands();

    const categories = categoriesPage?.content ?? [];
    const brands = brandsPage?.content ?? [];

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [formData, setFormData] = useState<FormFields>(initialFormState);
    const [validationErrors, setValidationErrors] = useState<ValidationError>({});

    const handlePriceInput = (value: string): number => {
        const numericValue = value.replace(/[^\d]/g, '');
        const cleanValue = numericValue.replace(/^0+/, '');
        return cleanValue ? parseInt(cleanValue, 10) : 0;
    };


    // Xử lý thay đổi input
    const handleInputChange = useCallback((
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (!isFormFieldKey(name)) {
            console.warn(`Unknown form field: ${name}`);
            return;
        }

        setFormData(prev => {
            const newData = { ...prev };

            switch (name) {
                case 'name':
                    newData.name = value;
                    newData.slug = generateSlug(value);
                    break;
                case 'price':
                case 'salePrice':
                    newData[name] = handlePriceInput(value);
                    break;
                case 'categoryId':
                case 'brandId':
                    newData[name] = parseInt(value, 10) || 0;
                    break;
                case 'description':
                    newData.description = value;
                    break;
                case 'status':
                    newData.status = type === 'checkbox' ? (e.target as HTMLInputElement).checked : Boolean(value);
                    break;
                case 'slug':
                    // Slug được tự động tạo, không cần xử lý
                    break;
            }

            return newData;
        });

        // Xóa validation error khi field được cập nhật
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Xử lý upload ảnh
    const handleThumbnailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Kiểm tra kích thước file (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            // Kiểm tra loại file
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh hợp lệ');
                return;
            }

            // Cập nhật state
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));

            // Xóa lỗi validation nếu có
            if (validationErrors.thumbnail) {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.thumbnail;
                    return newErrors;
                });
            }
        }
    }, [validationErrors]);

    // Xử lý thay đổi trạng thái
    const handleSwitchChange = useCallback((checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            status: checked
        }));
    }, []);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const errors: ValidationError = {};

        // Validate danh mục
        if (!formData.categoryId) {
            errors.categoryId = 'Vui lòng chọn danh mục';
        }

        // Validate thương hiệu
        if (!formData.brandId) {
            errors.brandId = 'Vui lòng chọn thương hiệu';
        }

        // Validate tên sản phẩm
        if (!formData.name.trim()) {
            errors.name = 'Tên sản phẩm không được để trống';
        } else if (formData.name.length < 3) {
            errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
        }

        // Validate mô tả
        if (!formData.description.trim()) {
            errors.description = 'Mô tả không được để trống';
        } else if (formData.description.length < 10) {
            errors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        // Validate giá
        if (formData.price <= 0) {
            errors.price = 'Giá sản phẩm phải lớn hơn 0';
        }

        // Validate giá khuyến mãi
        if (formData.salePrice > 0 && formData.salePrice >= formData.price) {
            errors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Xử lý hiển thị modal xác nhận tạo
    const handleShowCreateConfirm = useCallback(() => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin sản phẩm');
            return;
        }
        setShowCreateConfirmModal(true);
    }, [validateForm]);

    // Xử lý submit form
    const handleSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const productData: ProductCreateRequest = {
                ...formData,
                slug: generateSlug(formData.name)
            };

            const result = await createProduct(productData, thumbnailFile || undefined);

            if (result?.productId) {
                toast.success('Tạo sản phẩm mới thành công');
                navigate('/admin/products/list');
            } else {
                throw new Error('Không thể tạo sản phẩm');
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn khi tạo sản phẩm';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Error creating product:', error);
        } finally {
            setIsSubmitting(false);
            setShowCreateConfirmModal(false);
        }
    }, [formData, thumbnailFile, createProduct, navigate]);

    // Xử lý hủy
    const handleCancel = useCallback(() => {
        if (formData.name || formData.description || thumbnailFile) {
            setShowConfirmModal(true);
        } else {
            navigate('/admin/products/list');
        }
    }, [navigate, formData, thumbnailFile]);

    const isLoading = isCreatingProduct || isSubmitting;

    // Cleanup thumbnail preview URL khi component unmount
    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

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
                                <Package className="w-6 h-6 text-primary"/>
                                Thêm sản phẩm mới
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Điền thông tin để tạo sản phẩm mới
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
                                        <Package className="h-6 w-6 text-primary"/>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formData.name || 'Sản phẩm mới'}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formData.price > 0 ? `${formData.price.toLocaleString('vi-VN')}đ` : 'Chưa có giá'}
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
                                                Đang bán
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3"/>
                                                Ngừng bán
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
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Category Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Danh mục <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Package className="h-4 w-4 text-indigo-500/70 dark:text-gray-500"/>
                                            </div>
                                            <select
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleInputChange}
                                                className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm
                                                    ${validationErrors.categoryId
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                                }
                                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                    focus:outline-none focus:ring-2 transition-all duration-200`}
                                                disabled={isLoading}
                                            >
                                                <option value="0">Chọn danh mục</option>
                                                {categories.map((category: CategoryResponse) => (
                                                    <option key={category.categoryId} value={category.categoryId}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {validationErrors.categoryId && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.categoryId}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Thương hiệu <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building2 className="h-4 w-4 text-amber-500/70 dark:text-gray-500"/>
                                            </div>
                                            <select
                                                name="brandId"
                                                value={formData.brandId}
                                                onChange={handleInputChange}
                                                className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm
                                                    ${validationErrors.brandId
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                                }
                                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                    focus:outline-none focus:ring-2 transition-all duration-200`}
                                                disabled={isLoading}
                                            >
                                                <option value="0">Chọn thương hiệu</option>
                                                {brands.map((brand: BrandResponse) => (
                                                    <option key={brand.brandId} value={brand.brandId}>
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {validationErrors.brandId && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.brandId}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tên sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên sản phẩm"
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

                                    {/* Product Description */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Mô tả sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Nhập mô tả sản phẩm"
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
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Price */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Giá sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-4 w-4 text-green-500/70 dark:text-gray-500"/>
                                            </div>
                                            <input
                                                type="text"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="1000"
                                                placeholder="Nhập giá sản phẩm"
                                                className={`block w-full pl-9 pr-12 py-2 border rounded-lg text-sm
                                                    ${validationErrors.price
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                                }
                                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                    focus:outline-none focus:ring-2 transition-all duration-200`}
                                                disabled={isLoading}
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">
                                                VNĐ
                                            </span>
                                        </div>
                                        {validationErrors.price && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.price}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sale Price */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Giá khuyến mãi
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Tag className="h-4 w-4 text-red-500/70 dark:text-gray-500"/>
                                            </div>
                                            <input
                                                type="number"
                                                name="salePrice"
                                                value={formData.salePrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="1000"
                                                placeholder="Nhập giá khuyến mãi"
                                                className={`block w-full pl-9 pr-12 py-2 border rounded-lg text-sm
                                                    ${validationErrors.salePrice
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                                }
                                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                    focus:outline-none focus:ring-2 transition-all duration-200`}
                                                disabled={isLoading}
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">
                                                VNĐ
                                            </span>
                                        </div>
                                        {validationErrors.salePrice && (
                                            <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span>{validationErrors.salePrice}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Ảnh sản phẩm
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
                                            border-gray-300 dark:border-gray-700">
                                            <div className="space-y-1 text-center">
                                                {thumbnailPreview ? (
                                                    <div className="relative">
                                                        <img
                                                            src={thumbnailPreview}
                                                            alt="Thumbnail preview"
                                                            className="h-32 w-auto mx-auto rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setThumbnailFile(null);
                                                                setThumbnailPreview('');
                                                            }}
                                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1
                                                                hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            <X className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg
                                                            className="mx-auto h-12 w-12 text-gray-400"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            viewBox="0 0 48 48"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                                strokeWidth={2}
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                            <label
                                                                htmlFor="thumbnail"
                                                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90"
                                                            >
                                                                <span>Tải ảnh lên</span>
                                                                <input
                                                                    id="thumbnail"
                                                                    name="thumbnail"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="sr-only"
                                                                    onChange={handleThumbnailChange}
                                                                    disabled={isLoading}
                                                                />
                                                            </label>
                                                            <p className="pl-1">hoặc kéo thả</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            PNG, JPG, GIF tối đa 5MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.status}
                                            onChange={handleSwitchChange}
                                            disabled={isLoading}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Cho phép bán sản phẩm
                                        </span>
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
                                    disabled={isLoading || !formData.name.trim()}
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium
                                        text-white bg-primary rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-offset-2
                                        focus:ring-primary transition-all duration-200
                                        ${(isLoading || !formData.name.trim())
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
                                            Tạo sản phẩm
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => navigate('/admin/products/list')}
                title="Xác nhận hủy"
                message="Bạn có chắc chắn muốn hủy? Tất cả thông tin đã nhập sẽ bị mất."
                confirmText="Xác nhận"
                cancelText="Tiếp tục chỉnh sửa"
            />

            <ConfirmationModal
                isOpen={showCreateConfirmModal}
                onClose={() => setShowCreateConfirmModal(false)}
                onConfirm={handleSubmit}
                title="Xác nhận tạo sản phẩm"
                message={`Bạn có chắc chắn muốn tạo sản phẩm "${formData.name}" không?`}
                confirmText="Tạo sản phẩm"
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

export default ProductAddPage;