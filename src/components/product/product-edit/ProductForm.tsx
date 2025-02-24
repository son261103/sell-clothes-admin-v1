import { useState, useEffect } from 'react';
import type { ProductResponse, CategoryResponse, BrandResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { Package2, DollarSign, Tag, Building2 } from 'lucide-react';
import { useCategories, useCategoryStatus } from '@/hooks/categoryHooks';
import { useBrandFilters, useBrands } from '@/hooks/brandHooks';

interface ProductFormData {
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    categoryId: number;
    brandId: number;
    status: boolean;
}

interface ProductFormProps {
    initialData: ProductResponse;
    onSubmit: (data: ProductFormData) => Promise<void>;
    isLoading: boolean;
}

interface FormErrors {
    name?: string;
    price?: string;
    salePrice?: string;
    categoryId?: string;
    brandId?: string;
}

const ProductForm = ({ initialData, onSubmit, isLoading }: ProductFormProps) => {
    // Form state
    const [formData, setFormData] = useState<ProductFormData>({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        salePrice: initialData.salePrice || 0,
        categoryId: initialData.category.categoryId,
        brandId: initialData.brand.brandId,
        status: initialData.status
    });

    // Using custom hooks to fetch categories and brands
    const { fetchActiveParentCategories } = useCategories();
    const { fetchActiveBrands } = useBrands();
    const { activeCategories } = useCategoryStatus(); // Fix: Use the correct hook for activeCategories
    const { activeBrands } = useBrandFilters({ status: true });

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Effect to update form when initialData changes
    useEffect(() => {
        setFormData({
            name: initialData.name,
            description: initialData.description || '',
            price: initialData.price,
            salePrice: initialData.salePrice || 0,
            categoryId: initialData.category.categoryId,
            brandId: initialData.brand.brandId,
            status: initialData.status
        });
    }, [initialData]);

    // Effect to fetch categories and brands
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const [categoriesSuccess, brandsSuccess] = await Promise.all([
                    fetchActiveParentCategories(),
                    fetchActiveBrands()
                ]);

                if (!categoriesSuccess) {
                    toast.error('Không thể tải danh sách danh mục');
                }

                if (!brandsSuccess) {
                    toast.error('Không thể tải danh sách thương hiệu');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [fetchActiveParentCategories, fetchActiveBrands]);

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm không được để trống';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Giá sản phẩm phải lớn hơn 0';
        }

        if (formData.salePrice && formData.salePrice >= formData.price) {
            newErrors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Vui lòng chọn danh mục';
        }

        if (!formData.brandId) {
            newErrors.brandId = 'Vui lòng chọn thương hiệu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Đã xảy ra lỗi khi lưu thông tin');
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Handle category change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData(prev => ({
            ...prev,
            categoryId: value
        }));

        if (errors.categoryId) {
            setErrors(prev => ({
                ...prev,
                categoryId: undefined
            }));
        }
    };

    // Handle brand change
    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData(prev => ({
            ...prev,
            brandId: value
        }));

        if (errors.brandId) {
            setErrors(prev => ({
                ...prev,
                brandId: undefined
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium leading-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Package2 className="w-5 h-5 text-primary" /> Thông tin cơ bản
                </h3>

                <div className="grid gap-4">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`mt-1 w-full h-10 px-3 rounded-md 
                                     bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                                     border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors
                                     ${errors.name
                                ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/40'
                                : 'border-gray-300 dark:border-gray-700 shadow-sm'}`}
                            placeholder="Nhập tên sản phẩm..."
                            disabled={isLoading || isLoadingData}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Price & Sale Price */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Giá bán <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-4 w-4 text-primary/70 dark:text-gray-500" />
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={`w-full h-10 pl-9 pr-3 rounded-md 
                                             bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                                             border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors shadow-sm
                                             ${errors.price
                                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/40'
                                        : 'border-gray-300 dark:border-gray-700'}`}
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    disabled={isLoading || isLoadingData}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Giá khuyến mãi
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-green-500/70 dark:text-gray-500" />
                                </div>
                                <input
                                    type="number"
                                    name="salePrice"
                                    value={formData.salePrice}
                                    onChange={handleInputChange}
                                    className={`w-full h-10 pl-9 pr-3 rounded-md 
                                             bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                                             border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors shadow-sm
                                             ${errors.salePrice
                                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/40'
                                        : 'border-gray-300 dark:border-gray-700'}`}
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    disabled={isLoading || isLoadingData}
                                />
                                {errors.salePrice && (
                                    <p className="mt-1 text-xs text-red-500">{errors.salePrice}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category & Brand */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Package2 className="h-4 w-4 text-indigo-500/70 dark:text-gray-500" />
                                </div>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleCategoryChange}
                                    className={`w-full h-10 pl-9 pr-3 rounded-md 
                                             bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                                             border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors shadow-sm
                                             ${errors.categoryId
                                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/40'
                                        : 'border-gray-300 dark:border-gray-700'}`}
                                    disabled={isLoading || isLoadingData}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {activeCategories && activeCategories.length > 0 ? (
                                        activeCategories.map((category: CategoryResponse) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Đang tải danh mục...</option>
                                    )}
                                </select>
                                {errors.categoryId && (
                                    <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Thương hiệu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-4 w-4 text-amber-500/70 dark:text-gray-500" />
                                </div>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={handleBrandChange}
                                    className={`w-full h-10 pl-9 pr-3 rounded-md 
                                             bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
                                             border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors shadow-sm
                                             ${errors.brandId
                                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/40'
                                        : 'border-gray-300 dark:border-gray-700'}`}
                                    disabled={isLoading || isLoadingData}
                                >
                                    <option value="">Chọn thương hiệu</option>
                                    {activeBrands && activeBrands.length > 0 ? (
                                        activeBrands.map((brand: BrandResponse) => (
                                            <option key={brand.brandId} value={brand.brandId}>
                                                {brand.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Đang tải thương hiệu...</option>
                                    )}
                                </select>
                                {errors.brandId && (
                                    <p className="mt-1 text-xs text-red-500">{errors.brandId}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mô tả ngắn
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 w-full p-3 rounded-md border border-gray-300 dark:border-gray-700
                                     bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm shadow-sm
                                     focus:ring-2 focus:ring-primary/40 focus:border-primary"
                            placeholder="Nhập mô tả ngắn gọn về sản phẩm..."
                            disabled={isLoading || isLoadingData}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || isLoadingData}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm
                                     bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 
                                     focus:ring-offset-2 focus:ring-primary transition-colors
                                     ${(isLoading || isLoadingData) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProductForm;