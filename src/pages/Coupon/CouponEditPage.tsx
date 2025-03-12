import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CircleArrowLeft, Tag, AlertCircle,
    Save, X, CheckCircle, XCircle, Percent, DollarSign, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/Loading.tsx';
import { useCoupons, useCouponFinder } from '../../hooks/couponHooks';
import { CouponType, CouponUpdateDTO } from '@/types';

interface ValidationError {
    [key: string]: string;
}

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

interface FormFields {
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    status: boolean;
    description: string;
}

type FormFieldKey = keyof FormFields;

const isFormFieldKey = (key: string): key is FormFieldKey => {
    return key in initialFormState;
};

const initialFormState: FormFields = {
    code: '',
    type: CouponType.PERCENTAGE,
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    status: true,
    description: ''
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

// Form field component for consistent styling
const FormField: React.FC<{
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && (
            <div className="flex items-center gap-x-1 text-red-500 text-xs">
                <AlertCircle className="w-3.5 h-3.5"/>
                <span>{error}</span>
            </div>
        )}
    </div>
);

const CouponEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const couponId = id ? parseInt(id, 10) : 0;
    const navigate = useNavigate();

    const { updateCoupon, isLoading: isUpdatingCoupon } = useCoupons();
    const { foundById, fetchCouponById, isLoading: isLoadingCoupon } = useCouponFinder(couponId);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormFields>(initialFormState);
    const [validationErrors, setValidationErrors] = useState<ValidationError>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize form with coupon data
    useEffect(() => {
        const loadCoupon = async () => {
            try {
                if (couponId) {
                    await fetchCouponById(couponId);
                }
            } catch (error) {
                console.error('Error loading coupon:', error);
                setError('Không thể tải thông tin mã giảm giá');
            }
        };

        loadCoupon();
    }, [couponId, fetchCouponById]);

    // Fill the form with coupon data when loaded
    useEffect(() => {
        if (foundById && !isInitialized) {
            setFormData({
                code: foundById.code || '',
                type: foundById.type || CouponType.PERCENTAGE,
                value: foundById.value || 0,
                minOrderAmount: foundById.minOrderAmount || 0,
                maxDiscountAmount: foundById.maxDiscountAmount || 0,
                startDate: foundById.startDate || '',
                endDate: foundById.endDate || '',
                usageLimit: foundById.usageLimit || 0,
                status: foundById.status !== undefined ? foundById.status : true,
                description: foundById.description || ''
            });
            setIsInitialized(true);
        }
    }, [foundById, isInitialized]);

    const handleNumberInput = (value: string): number => {
        const numericValue = value.replace(/[^\d]/g, '');
        const cleanValue = numericValue.replace(/^0+/, '');
        return cleanValue ? parseInt(cleanValue, 10) : 0;
    };

    // Handle input changes
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
                case 'code':
                    newData.code = value.toUpperCase();
                    break;
                case 'type':
                    newData.type = value as CouponType;
                    break;
                case 'value':
                case 'minOrderAmount':
                case 'maxDiscountAmount':
                case 'usageLimit':
                    newData[name] = handleNumberInput(value);
                    break;
                case 'startDate':
                case 'endDate':
                    newData[name] = value;
                    break;
                case 'description':
                    newData.description = value;
                    break;
                case 'status':
                    newData.status = type === 'checkbox' ? (e.target as HTMLInputElement).checked : Boolean(value);
                    break;
            }

            return newData;
        });

        // Clear validation error when field is updated
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Handle status toggle
    const handleSwitchChange = useCallback((checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            status: checked
        }));
    }, []);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const errors: ValidationError = {};

        // Validate coupon code
        if (!formData.code.trim()) {
            errors.code = 'Mã giảm giá không được để trống';
        } else if (formData.code.length < 3) {
            errors.code = 'Mã giảm giá phải có ít nhất 3 ký tự';
        }

        // Validate discount value
        if (formData.value <= 0) {
            errors.value = 'Giá trị giảm giá phải lớn hơn 0';
        } else if (formData.type === CouponType.PERCENTAGE && formData.value > 100) {
            errors.value = 'Phần trăm giảm giá không thể vượt quá 100%';
        }

        // Validate maximum discount amount for percentage coupons
        if (formData.type === CouponType.PERCENTAGE && formData.value > 0 && formData.maxDiscountAmount <= 0) {
            errors.maxDiscountAmount = 'Vui lòng nhập giới hạn số tiền giảm tối đa';
        }

        // Validate date range if both dates are provided
        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (endDate <= startDate) {
                errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
            }
        }

        // Validate usage limit if provided
        if (formData.usageLimit < 0) {
            errors.usageLimit = 'Giới hạn sử dụng không thể là số âm';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Show update confirmation modal
    const handleShowUpdateConfirm = useCallback(() => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin mã giảm giá');
            return;
        }
        setShowUpdateConfirmModal(true);
    }, [validateForm]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Create coupon update data object based on form data
            const couponData: CouponUpdateDTO = {
                code: formData.code,
                type: formData.type,
                value: formData.value,
                status: formData.status
            };

            // Add optional fields if they have values
            if (formData.minOrderAmount > 0) {
                couponData.minOrderAmount = formData.minOrderAmount;
            }

            if (formData.maxDiscountAmount > 0) {
                couponData.maxDiscountAmount = formData.maxDiscountAmount;
            }

            if (formData.usageLimit > 0) {
                couponData.usageLimit = formData.usageLimit;
            }

            if (formData.startDate) {
                couponData.startDate = formData.startDate;
            }

            if (formData.endDate) {
                couponData.endDate = formData.endDate;
            }

            if (formData.description.trim()) {
                couponData.description = formData.description.trim();
            }

            const success = await updateCoupon(couponId, couponData);

            if (success) {
                toast.success('Cập nhật mã giảm giá thành công');
                navigate(`/admin/marketing/coupons/detail/${couponId}`);
            } else {
                throw new Error('Không thể cập nhật mã giảm giá');
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn khi cập nhật mã giảm giá';
            toast.error(errorMessage);
            setError(errorMessage);
            console.error('Error updating coupon:', error);
        } finally {
            setIsSubmitting(false);
            setShowUpdateConfirmModal(false);
        }
    }, [formData, couponId, updateCoupon, navigate]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (
            formData.code !== foundById?.code ||
            formData.type !== foundById?.type ||
            formData.value !== foundById?.value ||
            formData.minOrderAmount !== (foundById?.minOrderAmount || 0) ||
            formData.maxDiscountAmount !== (foundById?.maxDiscountAmount || 0) ||
            formData.startDate !== (foundById?.startDate || '') ||
            formData.endDate !== (foundById?.endDate || '') ||
            formData.usageLimit !== (foundById?.usageLimit || 0) ||
            formData.status !== foundById?.status ||
            formData.description !== (foundById?.description || '')
        ) {
            setShowConfirmModal(true);
        } else {
            navigate(`/admin/coupons/detail/${couponId}`);
        }
    }, [navigate, formData, foundById, couponId]);

    // Format number for display
    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString('vi-VN');
    };

    const isLoading = isUpdatingCoupon || isLoadingCoupon || isSubmitting;

    // Show loading spinner while fetching coupon data
    if (isLoadingCoupon && !foundById) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Show error message if coupon not found
    if (!foundById && !isLoadingCoupon) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6 mt-6">
                <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy mã giảm giá
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Mã giảm giá không tồn tại hoặc đã bị xóa.
                    </p>
                    <button
                        onClick={() => navigate('/admin/coupons/list')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <CircleArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

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
                                <Tag className="w-6 h-6 text-primary"/>
                                Chỉnh sửa mã giảm giá
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Chỉnh sửa thông tin mã giảm giá "{foundById?.code || ''}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Coupon Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6 sticky top-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary"/>
                            Xem trước
                        </h2>

                        {/* Coupon Preview Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            {/* Coupon Header */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="text-xl font-bold text-primary">
                                        {formData.code || 'COUPONCODE'}
                                    </div>
                                    <div className={`
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
                                                Không hoạt động
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Body */}
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Giá trị</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {formData.type === CouponType.PERCENTAGE
                                            ? `${formData.value}%`
                                            : `${formatNumber(formData.value)}đ`}
                                    </div>
                                </div>

                                {formData.type === CouponType.PERCENTAGE && formData.maxDiscountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Giảm tối đa</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(formData.maxDiscountAmount)}đ
                                        </div>
                                    </div>
                                )}

                                {formData.minOrderAmount > 0 && (
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Đơn tối thiểu</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(formData.minOrderAmount)}đ
                                        </div>
                                    </div>
                                )}

                                {formData.usageLimit > 0 && (
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới hạn</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {formData.usageLimit} lần
                                        </div>
                                    </div>
                                )}

                                {(formData.startDate || formData.endDate) && (
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời hạn</div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-right">
                                            {formData.startDate && formData.endDate
                                                ? `${new Date(formData.startDate).toLocaleDateString('vi-VN')} - ${new Date(formData.endDate).toLocaleDateString('vi-VN')}`
                                                : formData.startDate
                                                    ? `Từ ${new Date(formData.startDate).toLocaleDateString('vi-VN')}`
                                                    : `Đến ${new Date(formData.endDate).toLocaleDateString('vi-VN')}`
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Footer */}
                            {formData.description && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {formData.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Current Usage Info */}
                        {foundById && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Thông tin sử dụng hiện tại
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Số lần đã sử dụng:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{foundById.usedCount || 0}</span>
                                    </div>
                                    {foundById.usageLimit && foundById.usageLimit > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Tỉ lệ sử dụng:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {Math.round(((foundById.usedCount || 0) / foundById.usageLimit) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary h-1.5 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.round(((foundById.usedCount || 0) / foundById.usageLimit) * 100))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    {foundById.isExpired && (
                                        <div className="flex items-center mt-2 text-yellow-600 dark:text-yellow-400">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-medium">Mã giảm giá đã hết hạn</span>
                                        </div>
                                    )}
                                    {foundById.isFullyUsed && (
                                        <div className="flex items-center mt-2 text-purple-600 dark:text-purple-400">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-medium">Mã giảm giá đã sử dụng hết</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-center p-4 mb-6 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0"/>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Coupon Code */}
                                <FormField
                                    label="Mã giảm giá"
                                    required
                                    error={validationErrors.code}
                                >
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mã giảm giá"
                                        className={`block w-full px-3 py-2 border rounded-lg text-sm
                                            ${validationErrors.code
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                        }
                                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                            focus:outline-none focus:ring-2 transition-all duration-200`}
                                        disabled={isLoading}
                                    />
                                </FormField>

                                {/* Coupon Type */}
                                <FormField
                                    label="Loại giảm giá"
                                    required
                                    error={validationErrors.type}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-4 w-4 text-indigo-500/70 dark:text-gray-500"/>
                                        </div>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm
                                                ${validationErrors.type
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200`}
                                            disabled={isLoading}
                                        >
                                            <option value={CouponType.PERCENTAGE}>Phần trăm (%)</option>
                                            <option value={CouponType.FIXED_AMOUNT}>Số tiền cố định (VNĐ)</option>
                                        </select>
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Discount Value */}
                                <FormField
                                    label="Giá trị giảm giá"
                                    required
                                    error={validationErrors.value}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {formData.type === CouponType.PERCENTAGE ? (
                                                <Percent className="h-4 w-4 text-green-500/70 dark:text-gray-500"/>
                                            ) : (
                                                <DollarSign className="h-4 w-4 text-green-500/70 dark:text-gray-500"/>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleInputChange}
                                            placeholder={`Nhập giá trị ${formData.type === CouponType.PERCENTAGE ? '%' : 'VNĐ'}`}
                                            className={`block w-full pl-9 pr-12 py-2 border rounded-lg text-sm
                                                ${validationErrors.value
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200`}
                                            disabled={isLoading}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">
                                            {formData.type === CouponType.PERCENTAGE ? '%' : 'VNĐ'}
                                        </span>
                                    </div>
                                </FormField>

                                {/* Minimum Order Amount */}
                                <FormField
                                    label="Đơn hàng tối thiểu"
                                    error={validationErrors.minOrderAmount}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-amber-500/70 dark:text-gray-500"/>
                                        </div>
                                        <input
                                            type="text"
                                            name="minOrderAmount"
                                            value={formData.minOrderAmount}
                                            onChange={handleInputChange}
                                            placeholder="Nhập giá trị đơn tối thiểu"
                                            className={`block w-full pl-9 pr-12 py-2 border rounded-lg text-sm
                                                ${validationErrors.minOrderAmount
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
                                </FormField>
                            </div>

                            {/* Maximum Discount Amount (for percentage coupons) */}
                            {formData.type === CouponType.PERCENTAGE && (
                                <FormField
                                    label="Giảm tối đa"
                                    required
                                    error={validationErrors.maxDiscountAmount}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-red-500/70 dark:text-gray-500"/>
                                        </div>
                                        <input
                                            type="text"
                                            name="maxDiscountAmount"
                                            value={formData.maxDiscountAmount}
                                            onChange={handleInputChange}
                                            placeholder="Nhập giá trị giảm tối đa"
                                            className={`block w-full pl-9 pr-12 py-2 border rounded-lg text-sm
                                                ${validationErrors.maxDiscountAmount
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
                                </FormField>
                            )}

                            {/* Coupon Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <FormField
                                    label="Ngày bắt đầu"
                                    error={validationErrors.startDate}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-blue-500/70 dark:text-gray-500"/>
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-9 py-2 border rounded-lg text-sm
                                                ${validationErrors.startDate
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </FormField>

                                {/* End Date */}
                                <FormField
                                    label="Ngày kết thúc"
                                    error={validationErrors.endDate}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-red-500/70 dark:text-gray-500"/>
                                        </div>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            min={formData.startDate || undefined}
                                            className={`block w-full pl-9 py-2 border rounded-lg text-sm
                                                ${validationErrors.endDate
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                            }
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                focus:outline-none focus:ring-2 transition-all duration-200`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </FormField>
                            </div>

                            {/* Usage Limit */}
                            <FormField
                                label="Giới hạn sử dụng"
                                error={validationErrors.usageLimit}
                            >
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-4 w-4 text-purple-500/70 dark:text-gray-500"/>
                                    </div>
                                    <input
                                        type="text"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lần sử dụng tối đa (0 = không giới hạn)"
                                        className={`block w-full pl-9 py-2 border rounded-lg text-sm
                                            ${validationErrors.usageLimit
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                        }
                                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                            focus:outline-none focus:ring-2 transition-all duration-200`}
                                        disabled={isLoading}
                                    />
                                </div>
                            </FormField>

                            {/* Coupon Description */}
                            <FormField
                                label="Mô tả"
                                error={validationErrors.description}
                            >
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Nhập mô tả về mã giảm giá"
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
                            </FormField>

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">Trạng thái mã giảm giá</div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {formData.status
                                            ? 'Mã giảm giá đang hoạt động và có thể sử dụng'
                                            : 'Mã giảm giá hiện đang bị vô hiệu hóa'}
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.status}
                                    onChange={handleSwitchChange}
                                    disabled={isLoading}
                                />
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
                                    onClick={handleShowUpdateConfirm}
                                    disabled={isLoading || !formData.code.trim() || formData.value <= 0}
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium
                                        text-white bg-primary rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-offset-2
                                        focus:ring-primary transition-all duration-200
                                        ${(isLoading || !formData.code.trim() || formData.value <= 0)
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
                                            Cập nhật
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
                onConfirm={() => navigate(`/admin/coupons/detail/${couponId}`)}
                title="Xác nhận hủy"
                message="Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
                confirmText="Xác nhận"
                cancelText="Tiếp tục chỉnh sửa"
            />

            <ConfirmationModal
                isOpen={showUpdateConfirmModal}
                onClose={() => setShowUpdateConfirmModal(false)}
                onConfirm={handleSubmit}
                title="Xác nhận cập nhật"
                message={`Bạn có chắc chắn muốn cập nhật mã giảm giá "${formData.code}" không?`}
                confirmText="Cập nhật"
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

export default CouponEditPage;