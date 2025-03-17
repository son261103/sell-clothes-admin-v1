import React, { useState } from 'react';
import {
    Package2, Plus, CheckCircle, XCircle, Edit, Trash2,
    ArrowDownUp, FileSpreadsheet, Upload, Download, Loader2, AlertCircle
} from 'lucide-react';
import { ProductVariantResponse, ProductVariantCreateRequest, ProductVariantUpdateRequest } from '@/types';
import FileUpload from '../../product-excel/FileUpload';
import FileAnalysis from '../../product-excel/FileAnalysis';

// Hàm chuyển mã màu thành tên màu (đơn giản hóa)
const getColorNameFromHex = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#FF0000': 'Red',
        '#00FF00': 'Green',
        '#0000FF': 'Blue',
        '#FFFF00': 'Yellow',
        '#FFA500': 'Orange',
        '#800080': 'Purple',
        '#808080': 'Gray',
        '#FFC107': 'Amber',
    };
    return colorMap[hex.toUpperCase()] || hex; // Nếu không có trong map, trả về mã hex
};

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
    console.log('Rendering ProductVariantsSection với variants:', variants);

    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // State for import functionality
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [zipContents, setZipContents] = useState<any>(null);
    const [skuFolders, setSkuFolders] = useState<any[]>([]);
    const [importProgress, setImportProgress] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const [importResult, setImportResult] = useState<{
        totalImported: number;
        errorCount: number;
        skuList: string[];
    } | null>(null);

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
        color: '#000000', // Mặc định là màu đen
        size: '',
        sku: '',
        stockQuantity: 0,
        status: true,
        newSize: ''
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));

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

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        const color = formData.color;
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        if (!color) errors.color = 'Vui lòng chọn màu sắc';
        if (!size) errors.size = 'Vui lòng chọn hoặc nhập kích thước';
        if (!formData.sku) errors.sku = 'Vui lòng nhập SKU';
        if (formData.stockQuantity < 0) errors.stockQuantity = 'Số lượng tồn kho không thể âm';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

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

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hexColor = e.target.value;
        setFormData({ ...formData, color: hexColor });
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const colorName = getColorNameFromHex(formData.color);
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        const variantData: ProductVariantCreateRequest = {
            productId,
            color: colorName,
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

        const colorName = getColorNameFromHex(formData.color);
        const size = formData.size === 'new' ? formData.newSize : formData.size;

        const updateData: ProductVariantUpdateRequest = {
            color: colorName,
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
            color: '#000000',
            size: '',
            sku: '',
            stockQuantity: 0,
            status: true,
            newSize: ''
        });
        setImageFile(undefined);
        setSelectedVariant(null);
        setFormErrors({});
    };

    const startEdit = (variant: ProductVariantResponse) => {
        setSelectedVariant(variant);
        setFormData({
            color: variant.color.startsWith('#') ? variant.color : '#000000',
            size: variant.size,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            status: variant.status,
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

    // Excel import functions
    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        setImportError(null);

        if (file) {
            analyzeFile(file);
        } else {
            setZipContents(null);
            setSkuFolders([]);
        }
    };

    const analyzeFile = async (file: File) => {
        setIsAnalyzingFile(true);
        try {
            // Here you would typically call an API to analyze the file
            // For now, we'll simulate the analysis
            if (file.name.toLowerCase().endsWith('.zip')) {
                // Simulate ZIP analysis
                setTimeout(() => {
                    const mockZipContents = {
                        hasExcelFile: true,
                        excelFileName: 'variants.xlsx',
                        hasImagesFolder: true,
                        imageCount: Math.floor(Math.random() * 10) + 1,
                        totalSize: file.size,
                        formattedSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    };

                    const mockSkuFolders = Array(3).fill(0).map((_, i) => ({
                        sku: `SKU${i + 100}`,
                        hasMainImage: Math.random() > 0.3,
                        secondaryImageCount: Math.floor(Math.random() * 5)
                    }));

                    setZipContents(mockZipContents);
                    setSkuFolders(mockSkuFolders);
                    setIsAnalyzingFile(false);
                }, 1500);
            } else {
                // Excel file
                setTimeout(() => {
                    setIsAnalyzingFile(false);
                }, 1000);
            }
        } catch (error) {
            console.error('Error analyzing file:', error);
            setImportError('Không thể phân tích tập tin. Vui lòng thử lại sau.');
            setIsAnalyzingFile(false);
        }
    };

    const handleImportVariants = async () => {
        if (!selectedFile) return;

        setIsImporting(true);
        setImportProgress(0);
        setImportError(null);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 300);

            // Simulate API call to import variants
            setTimeout(() => {
                clearInterval(progressInterval);
                setImportProgress(100);

                // Simulate successful import
                setImportSuccess(true);
                setImportResult({
                    totalImported: Math.floor(Math.random() * 10) + 1,
                    errorCount: 0,
                    skuList: Array(3).fill(0).map((_, i) => `SKU${i + 100}`)
                });

                // Reset after delay
                setTimeout(() => {
                    setSelectedFile(null);
                    setImportProgress(0);
                }, 5000);
            }, 3000);

        } catch (error) {
            console.error('Error importing variants:', error);
            setImportError('Có lỗi xảy ra khi nhập dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExportVariants = () => {
        // In a real implementation, this would call an API to generate an Excel file
        alert('Tính năng xuất biến thể ra Excel sẽ được triển khai sau.');
    };

    const handleDownloadTemplate = () => {
        // In a real implementation, this would download a template for variant imports
        alert('Tính năng tải mẫu Excel sẽ được triển khai sau.');
    };

    const renderVariantForm = (isEdit: boolean = false) => (
        <form onSubmit={isEdit ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-textDark dark:text-textLight">Màu sắc</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            className="w-12 h-12 rounded-md border border-gray-200 dark:border-gray-700"
                            value={formData.color}
                            onChange={handleColorChange}
                        />
                        <span className="text-textDark dark:text-textLight">{getColorNameFromHex(formData.color)}</span>
                    </div>
                    {formErrors.color && <p className="text-sm text-red-600 mt-1">{formErrors.color}</p>}
                </div>
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
            {formErrors.submit && (
                <div className="text-sm text-red-600 text-center">{formErrors.submit}</div>
            )}
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
                <button type="submit" className="btn bg-primary hover:bg-primary/90 text-white">
                    {isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );

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

    return (
        <div className="rounded-xl bg-white dark:bg-secondary shadow-lg overflow-hidden">
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-textDark dark:text-textLight">
                        <Package2 className="h-5 w-5 text-primary" /> Tất cả biến thể sản phẩm ({variants.length})
                    </h2>
                    <div className="flex gap-2">
                        {/* Excel import/export buttons */}
                        <div className="flex gap-2 mr-4">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="btn btn-sm bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Nhập Excel</span>
                            </button>
                            <button
                                onClick={handleExportVariants}
                                className="btn btn-sm bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Xuất Excel</span>
                            </button>
                        </div>

                        {/* Sort dropdown */}
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

                        {/* Add variant button */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn btn-sm bg-primary text-white hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" /> Thêm biến thể
                        </button>
                    </div>
                </div>

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
                                                style={{ backgroundColor: variant.color.startsWith('#') ? variant.color : getColorNameFromHex(variant.color) }}
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

            {/* Add Variant Modal */}
            <dialog className={`modal ${isAddModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 text-lg font-bold text-textDark dark:text-textLight">Thêm biến thể mới</h3>
                    {renderVariantForm(false)}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsAddModalOpen(false)}>Đóng</button>
                </form>
            </dialog>

            {/* Edit Variant Modal */}
            <dialog className={`modal ${isEditModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 text-lg font-bold text-textDark dark:text-textLight">Chỉnh sửa biến thể</h3>
                    {renderVariantForm(true)}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsEditModalOpen(false)}>Đóng</button>
                </form>
            </dialog>

            {/* Import Variants Modal */}
            <dialog className={`modal ${isImportModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 text-lg font-bold text-textDark dark:text-textLight">Nhập biến thể từ Excel</h3>

                    <div className="space-y-4">
                        {/* Import instructions */}
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Hướng dẫn nhập Excel</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>Tải mẫu Excel từ nút "Tải mẫu Excel"</li>
                                <li>Điền thông tin biến thể theo hướng dẫn trong tập tin</li>
                                <li>Nếu cần nhập hình ảnh, hãy đóng gói tập tin Excel và thư mục hình ảnh vào file ZIP</li>
                                <li>Tải lên tập tin Excel đã điền hoặc file ZIP</li>
                            </ul>
                        </div>

                        {/* Template download */}
                        <div className="flex justify-start mb-4">
                            <button
                                onClick={handleDownloadTemplate}
                                className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5"/>
                                <span>Tải mẫu Excel</span>
                            </button>
                        </div>

                        {/* File upload */}
                        <FileUpload
                            selectedFile={selectedFile}
                            setSelectedFile={handleFileSelect}
                            isAnalyzingFile={isAnalyzingFile}
                        />

                        {/* File analysis */}
                        {selectedFile && !isImporting && !importSuccess && (
                            <FileAnalysis
                                selectedFile={selectedFile}
                                isAnalyzingFile={isAnalyzingFile}
                                zipContents={zipContents}
                                skuFolders={skuFolders}
                            />
                        )}

                        {/* Import error */}
                        {importError && (
                            <div className="border border-red-200 dark:border-red-900 rounded-md p-4 bg-red-50 dark:bg-red-900/20">
                                <div className="flex items-center text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    <h3 className="font-medium">Lỗi khi nhập dữ liệu</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {importError}
                                </p>
                            </div>
                        )}

                        {/* Import success */}
                        {importSuccess && importResult && (
                            <div className="border border-green-200 dark:border-green-900 rounded-md p-4 bg-green-50 dark:bg-green-900/20">
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <h3 className="font-medium">Nhập dữ liệu thành công</h3>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    <p>Đã nhập thành công {importResult.totalImported} biến thể.</p>
                                    {importResult.errorCount > 0 && (
                                        <p className="text-amber-600 dark:text-amber-400">
                                            Có {importResult.errorCount} lỗi trong quá trình nhập.
                                        </p>
                                    )}
                                    <p className="mt-2">Danh sách SKU đã nhập:</p>
                                    <ul className="list-disc pl-5 mt-1">
                                        {importResult.skuList.map((sku, index) => (
                                            <li key={index}>{sku}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Progress bar */}
                        {isImporting && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                                <div
                                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${importProgress}%` }}
                                ></div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                    {importProgress}% hoàn thành
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setIsImportModalOpen(false);
                                    setSelectedFile(null);
                                    setImportSuccess(false);
                                    setImportResult(null);
                                    setImportError(null);
                                }}
                                className="btn btn-ghost text-textDark dark:text-textLight hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {importSuccess ? 'Đóng' : 'Hủy'}
                            </button>

                            {selectedFile && !isImporting && !importSuccess && (
                                <button
                                    onClick={handleImportVariants}
                                    className="btn bg-primary hover:bg-primary/90 text-white"
                                    disabled={isAnalyzingFile}
                                >
                                    {isAnalyzingFile ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang phân tích...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            <span>Nhập dữ liệu</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsImportModalOpen(false)}>Đóng</button>
                </form>
            </dialog>
        </div>
    );
};

export default ProductVariantsSection;