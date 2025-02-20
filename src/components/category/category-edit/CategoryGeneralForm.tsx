import { useState, useEffect } from 'react';
import { Folder, FolderTree, FileText, Globe, CheckCircle, XCircle } from 'lucide-react';
import type { CategoryResponse, CategoryUpdateRequest } from '@/types';
import toast from 'react-hot-toast';

interface CategoryGeneralFormProps {
    category: CategoryResponse;
    onSubmit: (data: CategoryUpdateRequest) => Promise<void>;
    isLoading: boolean;
}

const CategoryGeneralForm = ({ category, onSubmit, isLoading }: CategoryGeneralFormProps) => {
    const [formData, setFormData] = useState<CategoryUpdateRequest>({
        name: '',
        description: '',
        slug: '',
        status: true
    });
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        setFormData({
            name: category.name || '',
            description: category.description || '',
            slug: category.slug || '',
            status: category.status ?? true
        });
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const confirmSave = async () => {
        const toastId = toast.loading('Đang cập nhật danh mục...');
        try {
            await onSubmit(formData);
            toast.success('Cập nhật danh mục thành công', { id: toastId });
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Không thể cập nhật danh mục', { id: toastId });
        }
    };

    return (
        <div className="space-y-8">
            {/* Category Icon & Status */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center
                                ring-4 ring-primary/20 transition-all duration-300">
                        {category.parentId ? (
                            <FolderTree className="w-12 h-12 text-primary"/>
                        ) : (
                            <Folder className="w-12 h-12 text-primary"/>
                        )}
                    </div>
                    <div className={`absolute -bottom-2 right-0 px-2 py-1 rounded-full text-xs font-medium
                        ${formData.status
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-800'}`}>
                        <div className="flex items-center gap-0.5">
                            {formData.status ? (
                                <>
                                    <CheckCircle className="w-3 h-3"/>
                                    <span>Hoạt động</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3"/>
                                    <span>Vô hiệu</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Category Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Folder className="w-4 h-4 text-primary/70"/>
                        Tên danh mục
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white  text-white dark:bg-gray-900 border border-gray-200
                                dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/50
                                focus:border-primary transition-colors duration-200"
                        placeholder="Nhập tên danh mục"
                        required
                    />
                </div>

                {/* Category Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FileText className="w-4 h-4 text-primary/70"/>
                        Mô tả
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white  text-white dark:bg-gray-900 border border-gray-200
                                dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/50
                                focus:border-primary transition-colors duration-200 min-h-[120px]"
                        placeholder="Nhập mô tả cho danh mục"
                    />
                </div>

                {/* Category Slug */}
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Globe className="w-4 h-4 text-primary/70"/>
                        Slug
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white text-white dark:bg-gray-900 border border-gray-200
                                dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/50
                                focus:border-primary transition-colors duration-200"
                        placeholder="nhap-ten-danh-muc"
                        required
                    />
                </div>

                {/* Category Status Toggle */}
                <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                                className="peer sr-only"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full
                                        dark:bg-gray-700 peer-checked:bg-primary ring-1 ring-gray-300
                                        dark:ring-gray-600 peer-checked:ring-primary/50 transition-all duration-300">
                            </div>
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300
                                        peer-checked:translate-x-5 group-hover:scale-110">
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kích hoạt danh mục
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg shadow hover:bg-primary/90
                               disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                               flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4"/>
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Xác nhận thay đổi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn có chắc chắn muốn cập nhật thông tin của danh mục "{formData.name}"?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700
                                         bg-gray-50 dark:bg-gray-600 border border-gray-300
                                         dark:border-gray-600 rounded-md"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmSave}
                                className="px-4 py-2 text-sm font-medium text-white
                                         bg-primary border border-transparent rounded-md
                                         hover:bg-primary/90 focus:outline-none focus:ring-2
                                         focus:ring-primary/40"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryGeneralForm;