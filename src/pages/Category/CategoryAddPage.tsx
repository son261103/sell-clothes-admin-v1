import React, {useState, useCallback, useEffect, ChangeEvent} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    CircleArrowLeft, FolderTree, AlertCircle,
    Save, Folder, X, CheckCircle, XCircle
} from 'lucide-react';
import {toast} from 'react-hot-toast';

import ConfirmationModal from '../../components/common/ConfirmationModal';
import {useCategories, useSubCategories, useCategoryFinder} from '../../hooks/categoryHooks';
import type {CategoryCreateRequest} from '@/types';
import {generateSlug} from '@/utils/stringUtils';

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

const CategoryAddPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parentId = searchParams.get('parentId');

    // Get parent category data if creating subcategory
    const {foundById: parentCategory} = useCategoryFinder(parentId ? Number(parentId) : undefined);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<CategoryCreateRequest>({
        name: '',
        description: '',
        slug: '',
        status: true
    });

    const [validationErrors, setValidationErrors] = useState<ValidationError>({});

    // Get category hooks
    const {
        createParentCategory,
        isLoading: isCreatingParent,
        fetchActiveParentCategories
    } = useCategories();

    const {
        createSubCategory,
        isLoading: isCreatingSubCategory
    } = useSubCategories();

    // Fetch parent categories on mount if not creating subcategory
    useEffect(() => {
        if (!parentId) {
            fetchActiveParentCategories();
        }
    }, [fetchActiveParentCategories, parentId]);

    // Handle form input changes with slug auto-generation
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        setFormData(prev => {
            const newData = {...prev};

            if (name === 'name') {
                newData.name = value;
                newData.slug = generateSlug(value);
            } else {
                (newData as Record<string, string | boolean>)[name] = value;
            }

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

    // Validate form data
    const validateForm = useCallback((): boolean => {
        const errors: ValidationError = {};

        if (!formData.name?.trim()) {
            errors.name = 'Tên danh mục không được để trống';
        } else if (formData.name.length < 3) {
            errors.name = 'Tên danh mục phải có ít nhất 3 ký tự';
        }

        if (!formData.description?.trim()) {
            errors.description = 'Mô tả không được để trống';
        } else if (formData.description.length < 10) {
            errors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        if (!formData.slug?.trim()) {
            errors.slug = 'Slug không được để trống';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            errors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Handle showing create confirmation
    const handleShowCreateConfirm = useCallback(() => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin danh mục');
            return;
        }
        setShowCreateConfirmModal(true);
    }, [validateForm]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setError(null);
            const categoryData = {
                name: formData.name,
                description: formData.description,
                slug: formData.slug,
                status: formData.status
            };

            let result;
            if (parentId) {
                // Creating subcategory
                result = await createSubCategory(Number(parentId), categoryData);
            } else {
                // Creating parent category
                result = await createParentCategory(categoryData);
            }

            if (result && result.categoryId) {
                toast.success('Tạo danh mục mới thành công');
                navigate('/admin/categories/list');
            } else {
                throw new Error('Không thể tạo danh mục');
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn khi tạo danh mục';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Error creating category:', error);
        } finally {
            setIsSubmitting(false);
            setShowCreateConfirmModal(false);
        }
    }, [formData, parentId, createParentCategory, createSubCategory, navigate]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.description || formData.slug) {
            setShowConfirmModal(true);
        } else {
            navigate('/admin/categories/list');
        }
    }, [navigate, formData]);

    const isLoading = isCreatingParent || isCreatingSubCategory || isSubmitting;
    const pageTitle = parentId ? 'Thêm danh mục con' : 'Thêm danh mục mới';
    const submitButtonText = parentId ? 'Thêm danh mục con' : 'Tạo danh mục';

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
                                <FolderTree className="w-6 h-6 text-primary"/>
                                {pageTitle}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {parentId && parentCategory
                                    ? `Thêm danh mục con cho "${parentCategory.name}"`
                                    : 'Điền thông tin để tạo danh mục mới'}
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
                                        <Folder className="h-6 w-6 text-primary"/>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formData.name || 'Danh mục mới'}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {parentId ? 'Danh mục con' : 'Danh mục cha'}
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
                            <div className="space-y-6">
                                {/* Category Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tên danh mục <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên danh mục"
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

                                {/* Slug */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug || ''}
                                        onChange={handleInputChange}
                                        placeholder="Slug tự động được tạo từ tên"
                                        className={`block w-full px-3 py-2 border rounded-lg text-sm
                                            ${validationErrors.slug
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                        }
                                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                            focus:outline-none focus:ring-2 transition-all duration-200`}
                                        disabled={isLoading}
                                    />
                                    {validationErrors.slug && (
                                        <div className="flex items-center gap-x-1 text-red-500 text-sm">
                                            <AlertCircle className="w-4 h-4"/>
                                            <span>{validationErrors.slug}</span>
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
                                        placeholder="Nhập mô tả cho danh mục"
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
                                        Kích hoạt danh mục
                                    </span>
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
                                    disabled={isLoading || !formData.name?.trim() || !formData.slug?.trim()}
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium
                                        text-white bg-primary rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-offset-2
                                        focus:ring-primary transition-all duration-200
                                        ${(isLoading || !formData.name?.trim() || !formData.slug?.trim())
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
                onConfirm={() => navigate('/admin/categories/list')}
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
                title={`Xác nhận tạo danh mục ${parentId ? 'con' : ''}`}
                message={`Bạn có chắc chắn muốn tạo danh mục${parentId ? ' con' : ''} "${formData.name}" không?`}
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

export default CategoryAddPage;