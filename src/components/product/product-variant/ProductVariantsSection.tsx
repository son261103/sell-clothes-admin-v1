import React, { useState } from 'react';
import { Package2, Plus, CheckCircle, XCircle, Edit, Trash2, ArrowDownUp } from 'lucide-react';
import {
    ProductVariantResponse,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest
} from '@/types';

interface ProductVariantsSectionProps {
    variants: ProductVariantResponse[];
    isLoading: boolean;
    error: string | null;
    toggleVariantStatus: (id: number) => Promise<boolean>;
    updateStockQuantity: (id: number, quantity: number) => Promise<boolean>;
    handleAddNewVariant: (data: ProductVariantCreateRequest, imageFile?: File) => Promise<void>;
    handleUpdateVariant: (id: number, data: ProductVariantUpdateRequest, imageFile?: File) => Promise<void>;
    handleDeleteVariant: (id: number) => Promise<void>;
    productId: number;
}

export const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
                                                                                  variants,
                                                                                  isLoading,
                                                                                  error,
                                                                                  toggleVariantStatus,
                                                                                  updateStockQuantity,
                                                                                  handleAddNewVariant,
                                                                                  handleUpdateVariant,
                                                                                  handleDeleteVariant,
                                                                                  productId
                                                                              }) => {
    // States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: 'color' | 'size' | 'stock' | 'sku';
        direction: 'asc' | 'desc';
    }>({
        key: 'color',
        direction: 'asc'
    });
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);
    const [formData, setFormData] = useState({
        color: '',
        size: '',
        sku: '',
        stockQuantity: 0,
        status: true,
        newColor: '',
        newSize: ''
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Extract unique colors and sizes from all variants
    const uniqueColors = Array.from(new Set(variants.map(v => v.color)));
    const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));

    // Sorting function for all variants
    const sortedVariants = [...variants].sort((a, b) => {
        let comparison = 0;
        switch (sortConfig.key) {
            case 'color':
                comparison = a.color.localeCompare(b.color);
                break;
            case 'size':
                comparison = a.size.localeCompare(b.size);
                break;
            case 'stock':
                comparison = a.stockQuantity - b.stockQuantity;
                break;
            case 'sku':
                comparison = a.sku.localeCompare(b.sku);
                break;
            default:
                comparison = 0;
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // Form Validation
    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        const color = formData.color === 'new' ? formData.newColor : formData.color;
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        if (!color) errors.color = 'Vui lòng chọn hoặc nhập màu sắc';
        if (!size) errors.size = 'Vui lòng chọn hoặc nhập kích thước';
        if (!formData.sku) errors.sku = 'Vui lòng nhập SKU';
        if (formData.stockQuantity < 0) errors.stockQuantity = 'Số lượng tồn kho không thể âm';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handlers
    const handleSort = (key: 'color' | 'size' | 'stock' | 'sku') => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageFile(file);
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const color = formData.color === 'new' ? formData.newColor : formData.color;
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        const variantData: ProductVariantCreateRequest = {
            productId,
            color,
            size,
            sku: formData.sku,
            stockQuantity: formData.stockQuantity,
            status: formData.status
        };

        try {
            await handleAddNewVariant(variantData, imageFile);
            setIsAddModalOpen(false);
            resetForm();
        } catch {
            setFormErrors({ submit: 'Không thể thêm biến thể. Vui lòng thử lại.' });
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVariant || !validateForm()) return;

        const color = formData.color === 'new' ? formData.newColor : formData.color;
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        const updateData: ProductVariantUpdateRequest = {
            color,
            size,
            sku: formData.sku,
            stockQuantity: formData.stockQuantity,
            status: formData.status
        };

        try {
            await handleUpdateVariant(selectedVariant.variantId, updateData, imageFile);
            setIsEditModalOpen(false);
            resetForm();
        } catch {
            setFormErrors({ submit: 'Không thể cập nhật biến thể. Vui lòng thử lại.' });
        }
    };

    const resetForm = () => {
        setFormData({
            color: '',
            size: '',
            sku: '',
            stockQuantity: 0,
            status: true,
            newColor: '',
            newSize: ''
        });
        setImageFile(undefined);
        setSelectedVariant(null);
        setFormErrors({});
    };

    const startEdit = (variant: ProductVariantResponse) => {
        setSelectedVariant(variant);
        setFormData({
            color: variant.color,
            size: variant.size,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            status: variant.status,
            newColor: '',
            newSize: ''
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (variantId: number) => {
        if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
            try {
                await handleDeleteVariant(variantId);
            } catch {
                alert('Không thể xóa biến thể. Vui lòng thử lại.');
            }
        }
    };

    const handleStockBlur = async (variantId: number, value: string) => {
        const quantity = parseInt(value, 10);
        if (isNaN(quantity) || quantity < 0) return;
        await updateStockQuantity(variantId, quantity);
    };

    const getStatusBadgeClass = (status: boolean) => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";
        return status
            ? `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`
            : `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
    };

    const renderVariantForm = (isEdit: boolean = false) => (
        <form onSubmit={isEdit ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Color Field */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-textDark dark:text-textLight">Màu sắc</span>
                    </label>
                    <select
                        className="select select-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    >
                        <option value="">Chọn màu</option>
                        {uniqueColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                        <option value="new">+ Thêm màu mới</option>
                    </select>
                    {formData.color === 'new' && (
                        <input
                            type="text"
                            className="mt-2 input input-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                            value={formData.newColor}
                            onChange={(e) => setFormData({ ...formData, newColor: e.target.value })}
                            placeholder="Nhập màu mới"
                        />
                    )}
                    {formErrors.color && <p className="text-sm text-red-600 mt-1">{formErrors.color}</p>}
                </div>

                {/* Size Field */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-textDark dark:text-textLight">Kích thước</span>
                    </label>
                    <select
                        className="select select-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                        <option value="">Chọn size</option>
                        {uniqueSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                        <option value="new">+ Thêm size mới</option>
                    </select>
                    {formData.size === 'new' && (
                        <input
                            type="text"
                            className="mt-2 input input-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                            value={formData.newSize}
                            onChange={(e) => setFormData({ ...formData, newSize: e.target.value })}
                            placeholder="Nhập size mới"
                        />
                    )}
                    {formErrors.size && <p className="text-sm text-red-600 mt-1">{formErrors.size}</p>}
                </div>
            </div>

            {/* SKU Field */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-textDark dark:text-textLight">SKU</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Nhập SKU"
                />
                {formErrors.sku && <p className="text-sm text-red-600 mt-1">{formErrors.sku}</p>}
            </div>

            {/* Stock Quantity Field */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-textDark dark:text-textLight">Số lượng tồn kho</span>
                </label>
                <input
                    type="number"
                    className="input input-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    min="0"
                />
                {formErrors.stockQuantity && <p className="text-sm text-red-600 mt-1">{formErrors.stockQuantity}</p>}
            </div>

            {/* Image Field */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-textDark dark:text-textLight">Hình ảnh</span>
                </label>
                <input
                    type="file"
                    className="file-input file-input-bordered w-full bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                    onChange={handleImageChange}
                    accept="image/*"
                />
            </div>

            {/* Form Submission Error */}
            {formErrors.submit && (
                <div className="text-sm text-red-600 text-center">{formErrors.submit}</div>
            )}

            {/* Modal Actions */}
            <div className="modal-action flex justify-end gap-2">
                <button
                    type="button"
                    className="btn btn-ghost text-textDark dark:text-textLight hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        resetForm();
                    }}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="btn bg-primary hover:bg-primary/90 text-white"
                >
                    {isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-lg text-textDark dark:text-textLight">Đang tải tất cả biến thể...</span>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="rounded-xl bg-white dark:bg-secondary p-4 text-red-600 dark:text-red-400 shadow-lg">
                <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm">Lỗi khi tải biến thể: {error}</span>
                </div>
            </div>
        );
    }

    // Main Render
    return (
        <div className="rounded-xl bg-white dark:bg-secondary shadow-lg overflow-hidden">
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-textDark dark:text-textLight">
                        <Package2 className="h-5 w-5 text-primary" /> Tất cả biến thể sản phẩm ({variants.length})
                    </h2>
                    <div className="flex gap-2">
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-sm text-textDark dark:text-textLight">
                                <ArrowDownUp className="h-4 w-4" />
                                Sắp xếp ({sortConfig.key})
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu rounded-lg border border-gray-200 bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-800 w-52">
                                <li><button onClick={() => handleSort('color')} className="text-textDark dark:text-textLight">Theo màu sắc</button></li>
                                <li><button onClick={() => handleSort('size')} className="text-textDark dark:text-textLight">Theo kích thước</button></li>
                                <li><button onClick={() => handleSort('stock')} className="text-textDark dark:text-textLight">Theo tồn kho</button></li>
                                <li><button onClick={() => handleSort('sku')} className="text-textDark dark:text-textLight">Theo SKU</button></li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn btn-sm bg-primary text-white hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" /> Thêm biến thể
                        </button>
                    </div>
                </div>

                {/* Variants Table */}
                {sortedVariants.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-fixed">
                            <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="w-1/5 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700 rounded-tl-xl">Màu sắc</th>
                                <th className="w-1/5 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Kích thước</th>
                                <th className="w-1/5 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">SKU</th>
                                <th className="w-1/6 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Tồn kho</th>
                                <th className="w-1/6 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center border-r border-gray-200 dark:border-gray-700">Trạng thái</th>
                                <th className="w-1/6 py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight text-center rounded-tr-xl">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedVariants.map((variant) => (
                                <tr
                                    key={variant.variantId}
                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700"
                                >
                                    <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 text-textDark dark:text-textLight">
                                            <div
                                                className="h-4 w-4 rounded-full border border-gray-200 dark:border-gray-700"
                                                style={{ backgroundColor: variant.color }}
                                            />
                                            {variant.color}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight">{variant.size}</td>
                                    <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight">{variant.sku}</td>
                                    <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                        <input
                                            type="number"
                                            className="input input-bordered input-sm w-20 bg-white dark:bg-gray-800 text-textDark dark:text-textLight border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                                            defaultValue={variant.stockQuantity}
                                            onBlur={(e) => handleStockBlur(variant.variantId, e.target.value)}
                                            min="0"
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-center">
                                                <span className={getStatusBadgeClass(variant.status)}>
                                                    <button
                                                        onClick={() => toggleVariantStatus(variant.variantId)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {variant.status ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Hoạt động</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3 h-3" />
                                                                <span>Vô hiệu</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => startEdit(variant)}
                                                className="btn btn-ghost btn-sm text-textDark dark:text-textLight hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(variant.variantId)}
                                                className="btn btn-ghost btn-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <Package2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                        <p>Chưa có biến thể nào cho sản phẩm này</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <dialog className={`modal ${isAddModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 text-lg font-bold text-textDark dark:text-textLight">Thêm biến thể mới</h3>
                    {renderVariantForm(false)}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsAddModalOpen(false)}>Đóng</button>
                </form>
            </dialog>

            {/* Edit Modal */}
            <dialog className={`modal ${isEditModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 text-lg font-bold text-textDark dark:text-textLight">Chỉnh sửa biến thể</h3>
                    {renderVariantForm(true)}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsEditModalOpen(false)}>Đóng</button>
                </form>
            </dialog>
        </div>
    );
};