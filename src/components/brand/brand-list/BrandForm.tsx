import React, { useState } from 'react';
import { Building2, Info, Tag, Upload, Trash2 } from 'lucide-react';
import type { BrandResponse } from '@/types';
import { toast } from "react-hot-toast";

interface BrandFormProps {
    initialData?: Partial<BrandResponse>;
    onSubmit: (data: BrandResponse, logoFile?: File) => Promise<void>;
    isLoading: boolean;
    onDeleteLogo?: () => Promise<void>;
}

interface ValidationErrors {
    name?: string;
    description?: string;
}

const BrandForm: React.FC<BrandFormProps> = ({
                                                 initialData = {},
                                                 onSubmit,
                                                 isLoading,
                                                 onDeleteLogo
                                             }) => {
    const isEditMode = Boolean(initialData.brandId);

    const [formData, setFormData] = useState<Partial<BrandResponse>>({
        name: initialData.name || '',
        description: initialData.description || '',
        logoUrl: initialData.logoUrl,
        status: initialData.status ?? true,
        brandId: initialData.brandId
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl || null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const validateFormData = (): boolean => {
        const validationErrors: ValidationErrors = {};

        if (!formData.name?.trim()) {
            validationErrors.name = 'Tên thương hiệu không được để trống';
        } else if (formData.name.length < 2) {
            validationErrors.name = 'Tên thương hiệu phải có ít nhất 2 ký tự';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? value === 'true' : value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('Kích thước file không được vượt quá 10MB');
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = async () => {
        if (onDeleteLogo) {
            const toastId = toast.loading('Đang xóa logo...');
            try {
                await onDeleteLogo();
                setLogoFile(null);
                setLogoPreview(null);
                setFormData(prev => ({
                    ...prev,
                    logoUrl: undefined
                }));
                toast.success('Xóa logo thành công', { id: toastId });
            } catch (error) {
                console.error('Error deleting logo:', error);
                toast.error('Không thể xóa logo', { id: toastId });
            }
        } else {
            setLogoFile(null);
            setLogoPreview(null);
            setFormData(prev => ({
                ...prev,
                logoUrl: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateFormData()) {
            setShowConfirmation(true);
        }
    };

    const confirmSubmit = async () => {
        try {
            await onSubmit(formData as BrandResponse, logoFile || undefined);
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setShowConfirmation(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <Building2 className="w-16 h-16 text-primary"/>
                            )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                            <label className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <Upload className="w-4 h-4 text-primary"/>
                            </label>
                            {logoPreview && (
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Tên thương hiệu
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập tên thương hiệu"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Mô tả
                        </label>
                        <div className="relative">
                            <div className="absolute top-2 left-3 pointer-events-none">
                                <Info className="h-5 w-5 text-gray-400"/>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                                placeholder="Nhập mô tả thương hiệu"
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Trạng thái
                        </label>
                        <select
                            name="status"
                            value={formData.status?.toString()}
                            onChange={handleInputChange}
                            className="block w-full pl-3 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm"
                        >
                            <option value="true">Hoạt động</option>
                            <option value="false">Vô hiệu hóa</option>
                        </select>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Xác nhận thông tin
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn có chắc chắn muốn {isEditMode ? "cập nhật" : "tạo"} thương hiệu này?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={confirmSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BrandForm;