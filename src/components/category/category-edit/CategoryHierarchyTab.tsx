import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertCircle, Pencil, Trash2, Box, Plus,
    CheckCircle, XCircle, Save, FileText, X,
    Search, Folder
} from 'lucide-react';
import { useCategoryHierarchy, useSubCategories } from '@/hooks/categoryHooks';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import type {
    CategoryResponse,
    CategoryUpdateRequest,
    CategoryCreateRequest
} from '@/types';
import { generateSlug } from '@/utils/stringUtils';

interface CategoryHierarchyTabProps {
    parentCategory: CategoryResponse;
    onSubmit: (data: CategoryUpdateRequest) => Promise<void>;
    onSubcategoryUpdate: (parentCategoryId: number) => Promise<void>;
}

interface CategoryFormData {
    name: string;
    description: string;
    status: boolean;
    slug: string;
}

const Switch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
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

const SearchInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700
                     rounded-lg bg-white dark:bg-gray-800
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                     placeholder-gray-500 dark:placeholder-gray-400
                     transition-all duration-200"
        />
    </div>
);

const CategoryForm: React.FC<{
    data: CategoryFormData;
    onChange: (data: CategoryFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
    mode: 'add' | 'edit';
    isLoading: boolean;
    error?: string | null;
}> = ({ data, onChange, onSubmit, onCancel, mode, isLoading, error }) => {
    // Handle name change and auto-generate slug
    const handleNameChange = (name: string) => {
        const newSlug = generateSlug(name);
        onChange({ ...data, name, slug: newSlug });
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg transition-all duration-200">
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Folder className="h-5 w-5 text-primary" />
                        {mode === 'add' ? 'Thêm danh mục con mới' : 'Chỉnh sửa danh mục con'}
                    </h3>
                    <button
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-1
                                 transition-colors duration-200"
                        onClick={onCancel}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="flex items-center p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tên danh mục <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Nhập tên danh mục"
                            className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700
                                     rounded-lg bg-white dark:bg-gray-800
                                     text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                                     placeholder-gray-500 dark:placeholder-gray-400
                                     transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.slug}
                            onChange={(e) => onChange({ ...data, slug: e.target.value })}
                            placeholder="Slug tự động được tạo từ tên"
                            className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700
                                     rounded-lg bg-white dark:bg-gray-800
                                     text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                                     placeholder-gray-500 dark:placeholder-gray-400
                                     transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mô tả
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => onChange({ ...data, description: e.target.value })}
                            placeholder="Nhập mô tả cho danh mục"
                            className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700
                                     rounded-lg bg-white dark:bg-gray-800
                                     text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                                     placeholder-gray-500 dark:placeholder-gray-400
                                     min-h-[120px] resize-y transition-all duration-200"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            checked={data.status}
                            onChange={(checked) => onChange({ ...data, status: checked })}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Kích hoạt danh mục
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-700
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20
                                 transition-colors duration-200"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button
                        className={`
                            inline-flex items-center px-4 py-2 text-sm font-medium
                            text-white bg-primary rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            focus:ring-primary 
                            transition-all duration-200
                            ${(isLoading || !data.name.trim() || !data.slug.trim()) ?
                            'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}
                        `}
                        onClick={onSubmit}
                        disabled={isLoading || !data.name.trim() || !data.slug.trim()}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CategoryCard: React.FC<{
    category: CategoryResponse;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: () => void;
    isLoading: boolean;
    isEditing: boolean;
}> = ({ category, onEdit, onDelete, onStatusChange, isLoading, isEditing }) => (
    <div className={`
        border rounded-xl overflow-hidden bg-white dark:bg-gray-800
        transition-all duration-200 hover:shadow-md
        ${isEditing ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-primary/20'}
    `}>
        <div className="p-4">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                    <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {category.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {category.description || 'Không có mô tả'}
                                </p>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Slug: {category.slug}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={category.status}
                                onChange={onStatusChange}
                                disabled={isLoading}
                            />
                            <div className="flex gap-2">
                                <button
                                    className={`
                                        p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20
                                        transition-colors duration-200
                                        ${isEditing ?
                                        'bg-primary text-white hover:bg-primary/90' :
                                        'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}
                                    `}
                                    onClick={onEdit}
                                    disabled={isLoading}
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                             focus:outline-none focus:ring-2 focus:ring-red-500/20
                                             transition-colors duration-200"
                                    onClick={onDelete}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`
                            flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${category.status ?
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                            transition-colors duration-200
                        `}>
                            {category.status ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Hoạt động
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3" />
                                    Vô hiệu
                                </>
                            )}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {category.categoryId}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CategoryHierarchyTab: React.FC<CategoryHierarchyTabProps> = ({
                                                                       parentCategory,
                                                                       onSubcategoryUpdate,
                                                                   }) => {
    const { hierarchyData, fetchHierarchy, isLoading: isHierarchyLoading } = useCategoryHierarchy();
    const {
        toggleSubCategoryStatus,
        createSubCategory,
        updateSubCategory,
        deleteSubCategory,
        isLoading: isSubCategoryLoading
    } = useSubCategories();

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        status: true,
        slug: ''
    });
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);

    useEffect(() => {
        loadHierarchy();
    }, [parentCategory.categoryId]);

    const loadHierarchy = async () => {
        setError(null);
        try {
            await fetchHierarchy(parentCategory.categoryId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải danh sách danh mục con');
        }
    };

    const filteredCategories = useMemo(() => {
        if (!hierarchyData?.subCategories) return [];
        return hierarchyData.subCategories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (category.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [hierarchyData?.subCategories, searchQuery]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: true,
            slug: ''
        });
        setShowForm(false);
        setEditingCategory(null);
        setFormMode('add');
        setError(null);
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
        setFormMode('add');
    };

    const handleEdit = (category: CategoryResponse) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            status: category.status,
            slug: category.slug
        });
        setEditingCategory(category);
        setShowForm(true);
        setFormMode('edit');
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.slug.trim()) return;

        setIsProcessing(true);
        setError(null);

        try {
            if (formMode === 'add') {
                const newCategoryData: CategoryCreateRequest = {
                    ...formData,
                    parentId: parentCategory.categoryId
                };
                await createSubCategory(parentCategory.categoryId, newCategoryData);
            } else if (editingCategory) {
                const updateData: CategoryUpdateRequest = {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    slug: formData.slug
                };
                await updateSubCategory(editingCategory.categoryId, updateData);
            }

            await loadHierarchy();
            await onSubcategoryUpdate(parentCategory.categoryId);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lưu danh mục');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStatusToggle = async (id: number) => {
        setIsProcessing(true);
        setError(null);
        try {
            await toggleSubCategoryStatus(id);
            await loadHierarchy();
            await onSubcategoryUpdate(parentCategory.categoryId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái danh mục');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCategoryId) return;

        setIsProcessing(true);
        setError(null);
        try {
            await deleteSubCategory(selectedCategoryId);
            await loadHierarchy();
            await onSubcategoryUpdate(parentCategory.categoryId);
            setShowDeleteConfirmation(false);
            setSelectedCategoryId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isHierarchyLoading || isSubCategoryLoading || isProcessing;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Folder className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {parentCategory.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quản lý danh mục con
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  bg-primary/10 text-primary">
                        {filteredCategories.length} danh mục
                    </span>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>
                <button
                    className={`
                        inline-flex items-center px-4 py-2 text-sm font-medium
                        text-white bg-primary rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        focus:ring-primary 
                        transition-all duration-200
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}
                    `}
                    onClick={handleAddNew}
                    disabled={isLoading}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Thêm danh mục con
                </button>
            </div>

            {/* Form Section */}
            {showForm && (
                <CategoryForm
                    data={formData}
                    onChange={setFormData}
                    onSubmit={handleSave}
                    onCancel={resetForm}
                    mode={formMode}
                    isLoading={isLoading}
                    error={error}
                />
            )}

            {/* Categories List */}
            <div className="space-y-4">
                {filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <Box className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                            {searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục con'}
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm danh mục con mới'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCategories.map((category) => (
                            <CategoryCard
                                key={category.categoryId}
                                category={category}
                                onEdit={() => handleEdit(category)}
                                onDelete={() => {
                                    setSelectedCategoryId(category.categoryId);
                                    setShowDeleteConfirmation(true);
                                }}
                                onStatusChange={() => handleStatusToggle(category.categoryId)}
                                isLoading={isLoading}
                                isEditing={editingCategory?.categoryId === category.categoryId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirmation}
                onClose={() => {
                    setShowDeleteConfirmation(false);
                    setSelectedCategoryId(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa danh mục"
                message="Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác."
                cancelText="Hủy"
                confirmText="Xóa"
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

            {/* Error Alert */}
            {error && !showForm && (
                <div className="flex items-center p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default CategoryHierarchyTab;