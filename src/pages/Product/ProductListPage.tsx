import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import {
    Download, Plus, Search, X, RefreshCw,
    Filter, Package2, Trash2
} from 'lucide-react';

import ProductDataTable from '../../components/product/ProductDataTable';
import { useProducts } from '../../hooks/productHooks';
import type {
    ProductResponse,
    ProductPageRequest,
    ProductFilters
} from '@/types';
import ProductEditPopup from "../../components/product/product-edit/ProductEditPopup";

interface IProps {
    initialPage?: number;
    initialPageSize?: number;
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
                                     isOpen,
                                     product,
                                     onCancel,
                                     onConfirm
                                 }: {
    isOpen: boolean;
    product: ProductResponse | null;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Xác nhận xóa sản phẩm
                                </h3>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn xóa sản phẩm <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>?
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Xác nhận xóa
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductListPage: React.FC<IProps> = ({
                                               initialPage = 0,
                                               initialPageSize = 10
                                           }) => {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<boolean | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
    const [priceRange, setPriceRange] = useState({min: '', max: ''});
    const [sortBy, setSortBy] = useState('productId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [imageRefreshCounter, setImageRefreshCounter] = useState(0);
    const [shouldFetchData, setShouldFetchData] = useState(true);

    // Delete confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(null);

    // Hooks
    const {
        productsPage,
        isLoading,
        error,
        fetchAllProducts,
        deleteProduct,
        toggleProductStatus
    } = useProducts();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch data with filters
    const fetchData = useCallback(async () => {
        if (!shouldFetchData) return;

        const pageRequest: ProductPageRequest = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: ProductFilters = {
            sortBy,
            sortDirection
        };

        if (debouncedSearchTerm?.trim()) {
            filters.search = debouncedSearchTerm.trim();
        }
        if (selectedStatus !== '') {
            filters.status = selectedStatus;
        }
        if (selectedCategory !== '') {
            filters.categoryId = selectedCategory as number;
        }
        if (selectedBrand !== '') {
            filters.brandId = selectedBrand as number;
        }
        if (priceRange.min) {
            filters.minPrice = Number(priceRange.min);
        }
        if (priceRange.max) {
            filters.maxPrice = Number(priceRange.max);
        }

        try {
            setShouldFetchData(false);
            await fetchAllProducts(pageRequest, filters);
            setImageRefreshCounter(prev => prev + 1);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [
        shouldFetchData,
        currentPage,
        pageSize,
        selectedStatus,
        selectedCategory,
        selectedBrand,
        debouncedSearchTerm,
        priceRange,
        sortBy,
        sortDirection,
        fetchAllProducts
    ]);

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Main data fetching effect
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Set shouldFetchData to true when filters change
    useEffect(() => {
        setShouldFetchData(true);
    }, [
        currentPage,
        pageSize,
        debouncedSearchTerm,
        selectedStatus,
        selectedCategory,
        selectedBrand,
        priceRange,
        sortBy,
        sortDirection
    ]);

    // Click outside handler for filter menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const filterMenu = document.getElementById('filter-menu');
            const filterButton = document.getElementById('filter-button');
            if (filterMenu && filterButton &&
                !filterMenu.contains(event.target as Node) &&
                !filterButton.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handlers
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setShouldFetchData(true);
        setImageRefreshCounter(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const handleStatusChange = async (id: number) => {
        if (!productsPage?.content) return;

        const productToUpdate = productsPage.content.find(p => p.productId === id);
        if (!productToUpdate) return;

        const action = productToUpdate.status ? 'vô hiệu hóa' : 'kích hoạt';

        if (window.confirm(`Bạn có chắc chắn muốn ${action} sản phẩm ${productToUpdate.name}?`)) {
            try {
                await toggleProductStatus(id);
                setShouldFetchData(true);
            } catch (error) {
                console.error('Error updating product status:', error);
            }
        }
    };

    const handleDeleteClick = (id: number) => {
        if (!productsPage?.content) return;

        const product = productsPage.content.find(p => p.productId === id);
        if (!product) return;

        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete.productId);
            setShouldFetchData(true);
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const handleDeleteProduct = async (id: number) => {
        handleDeleteClick(id);
    };

    const handleEditProduct = (product: ProductResponse) => {
        setSelectedProductId(product.productId);
        setIsEditPopupOpen(true);
    };

    const handleEditSuccess = () => {
        setShouldFetchData(true); // Kích hoạt lại việc tải dữ liệu
        setIsEditPopupOpen(false);
        setSelectedProductId(null);
    };

    const handleFilterChange = (field: string, value: string) => {
        if (field === 'status') {
            setSelectedStatus(value === '' ? '' : value === 'true');
        } else if (field === 'category') {
            setSelectedCategory(value === '' ? '' : Number(value));
        } else if (field === 'brand') {
            setSelectedBrand(value === '' ? '' : Number(value));
        } else if (field === 'priceMin') {
            setPriceRange(prev => ({...prev, min: value}));
        } else if (field === 'priceMax') {
            setPriceRange(prev => ({...prev, max: value}));
        }
        setCurrentPage(0);
    };

    const handleSortChange = (sortField: string) => {
        setSortBy(sortField);
        setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedCategory('');
        setSelectedBrand('');
        setPriceRange({min: '', max: ''});
        setSortBy('productId');
        setSortDirection('desc');
        setCurrentPage(0);
        setIsFilterMenuOpen(false);
        setShouldFetchData(true);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting products data...');
    };

    // Render filter menu
    const renderFilterMenu = () => (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40"
                style={{zIndex: 40}}
                onClick={() => setIsFilterMenuOpen(false)}
            />
            <div
                id="filter-menu"
                className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 md:w-72 mt-2 p-4 bg-white dark:bg-secondary rounded-xl shadow-lg"
                style={{
                    zIndex: 50,
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}
            >
                <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Trạng thái
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedStatus.toString()}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Vô hiệu hóa</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Danh mục
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedCategory.toString()}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {/* Add categories dynamically */}
                        </select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Thương hiệu
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedBrand.toString()}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        >
                            <option value="">Tất cả thương hiệu</option>
                            {/* Add brands dynamically */}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Khoảng giá
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Từ"
                                className="w-1/2 h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                value={priceRange.min}
                                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Đến"
                                className="w-1/2 h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                value={priceRange.max}
                                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Sắp xếp theo
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="productId">ID</option>
                            <option value="name">Tên sản phẩm</option>
                            <option value="price">Giá</option>
                            <option value="createdAt">Ngày tạo</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={clearFilters}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <Package2 className="w-6 h-6 text-primary"/> Quản lý sản phẩm
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý thông tin và hình ảnh sản phẩm
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/products/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5"/>
                        <span>Thêm sản phẩm</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-secondary dark:text-highlight"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setShouldFetchData(true);
                                    }}
                                >
                                    <X className="w-4 h-4 text-secondary dark:text-highlight hover:text-accent dark:hover:text-textLight transition-colors"/>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                                onClick={handleRefresh}
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                    isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                <span className="hidden sm:inline">Làm mới</span>
                            </button>

                            <button
                                id="filter-button"
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                    isFilterMenuOpen ? 'bg-gray-50 dark:bg-gray-700 border-primary dark:border-primary' : ''
                                }`}
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            >
                                <Filter className="w-3.5 h-3.5"/>
                                <span className="hidden sm:inline">Bộ lọc</span>
                                {(selectedStatus !== '' || selectedCategory !== '' || selectedBrand !== '' || priceRange.min || priceRange.max) && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        {[
                                            selectedStatus !== '',
                                            selectedCategory !== '',
                                            selectedBrand !== '',
                                            priceRange.min || priceRange.max
                                        ].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleExport}
                                className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5"/>
                                <span className="hidden sm:inline">Xuất danh sách</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Menu */}
                {isFilterMenuOpen && renderFilterMenu()}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Product Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <ProductDataTable
                        products={productsPage}
                        onDeleteProduct={handleDeleteProduct}
                        onEditProduct={handleEditProduct}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        forceRefresh={imageRefreshCounter}
                    />
                </div>
            </div>

            {/* Edit Product Popup */}
            {selectedProductId && (
                <ProductEditPopup
                    productId={selectedProductId}
                    isOpen={isEditPopupOpen}
                    onClose={() => {
                        // Đảm bảo cập nhật dữ liệu sau khi đóng popup
                        setTimeout(() => {
                            setShouldFetchData(true); // Kích hoạt fetch dữ liệu
                        }, 300);
                        setIsEditPopupOpen(false);
                        setSelectedProductId(null);
                    }}
                    onUpdate={handleEditSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                product={productToDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default ProductListPage;