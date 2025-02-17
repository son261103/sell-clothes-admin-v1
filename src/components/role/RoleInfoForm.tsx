import React from 'react';
import { Info, ArrowRight } from 'lucide-react';

interface RoleInfoFormData {
    name: string;
    description: string;
}

interface ValidationError {
    [key: string]: string;
}

interface RoleInfoFormProps {
    formData: RoleInfoFormData;
    validationErrors: ValidationError;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onNext: () => void;
}

export const RoleInfoForm: React.FC<RoleInfoFormProps> = ({
                                                              formData,
                                                              validationErrors,
                                                              isLoading,
                                                              onInputChange,
                                                              onNext,
                                                          }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-8">
                {/* Role Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Tên vai trò <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Info className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            className={`block w-full pl-10 pr-3 py-2 rounded-md border 
                                ${validationErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                            placeholder="Nhập tên vai trò"
                        />
                    </div>
                    {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                    )}
                </div>

                {/* Description Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onInputChange}
                        rows={4}
                        className={`block w-full px-3 py-2 rounded-md border 
                            ${validationErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm`}
                        placeholder="Nhập mô tả vai trò"
                    />
                    {validationErrors.description && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                    )}
                </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading || !!validationErrors.name || !!validationErrors.description}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-md
                        hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40
                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
};