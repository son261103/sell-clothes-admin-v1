import {useCallback, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {
    Download, Plus, Search, X, RefreshCw,
    Filter, Building2
} from 'lucide-react';

import BrandDataTable from '../../components/brand/BrandDataTable';
import {useBrands} from '../../hooks/brandHooks';
import type {
    BrandResponse,
    BrandPageRequest,
    BrandFilters
} from '@/types';
import BrandEditPopup from "../../components/brand/brand-edit/BrandEditPopup";

interface IProps {
    initialPage?: number;
    initialPageSize?: number;
}

const BrandListPage: React.FC<IProps> = ({
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
    const [sortBy, setSortBy] = useState('brandId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

    // Thêm biến counter để cập nhật ảnh
    const [imageRefreshCounter, setImageRefreshCounter] = useState(0);

    // State to control fetching
    const [shouldFetchData, setShouldFetchData] = useState(true);

    // Hooks
    const {
        brandsPage,
        isLoading,
        error,
        message,
        fetchAllBrands,
        deleteBrand,
        toggleBrandStatus
    } = useBrands();

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

        const pageRequest: BrandPageRequest = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: BrandFilters = {
            sortBy,
            sortDirection
        };

        if (debouncedSearchTerm?.trim()) {
            filters.search = debouncedSearchTerm.trim();
        }
        if (selectedStatus !== '') {
            filters.status = selectedStatus;
        }

        try {
            setShouldFetchData(false);
            await fetchAllBrands(pageRequest, filters);
            // Tăng counter để refresh ảnh sau khi fetch data
            setImageRefreshCounter(prev => prev + 1);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    }, [
        shouldFetchData,
        currentPage,
        pageSize,
        selectedStatus,
        debouncedSearchTerm,
        sortBy,
        sortDirection,
        fetchAllBrands
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
    }, [fetchData, shouldFetchData]);

    // Set shouldFetchData to true when filters change
    useEffect(() => {
        setShouldFetchData(true);
    }, [currentPage, pageSize, debouncedSearchTerm, selectedStatus, sortBy, sortDirection]);

    // Filter menu click outside handler
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
        // Tăng counter để refresh tất cả ảnh
        setImageRefreshCounter(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const handleStatusChange = async (id: number) => {
        if (!brandsPage?.content) return;

        const brandToUpdate = brandsPage.content.find(b => b.brandId === id);
        if (!brandToUpdate) return;

        const action = brandToUpdate.status ? 'vô hiệu hóa' : 'kích hoạt';

        if (window.confirm(`Bạn có chắc chắn muốn ${action} thương hiệu ${brandToUpdate.name}?`)) {
            try {
                await toggleBrandStatus(id);
                setShouldFetchData(true);
            } catch (error) {
                console.error('Error updating brand status:', error);
            }
        }
    };

    const handleDeleteBrand = async (id: number) => {
        if (!brandsPage || !brandsPage.content) return;

        const brandToDelete = brandsPage.content.find(b => b.brandId === id);
        if (!brandToDelete) return;

        if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu ${brandToDelete.name}?`)) {
            await deleteBrand(id);
            setShouldFetchData(true);
        }
    };

    const handleEditBrand = (brand: BrandResponse) => {
        setSelectedBrandId(brand.brandId);
        setIsEditPopupOpen(true);
        // Tăng counter để refreshh ảnh khi đóng popup
        setImageRefreshCounter(prev => prev + 1);
    };

    const handleEditSuccess = () => {
        // Tăng counter để refresh ảnh sau khi edit thành công
        setImageRefreshCounter(prev => prev + 1);
        setShouldFetchData(true);
        setIsEditPopupOpen(false);
        setSelectedBrandId(null);
    };

    const handleFilterChange = (value: string) => {
        setSelectedStatus(value === '' ? '' : value === 'true');
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
        setSortBy('brandId');
        setSortDirection('desc');
        setCurrentPage(0);
        setIsFilterMenuOpen(false);
        setShouldFetchData(true);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting brands data...');
        // Add your export logic here
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
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Vô hiệu hóa</option>
                        </select>
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
                            <option value="brandId">ID</option>
                            <option value="name">Tên thương hiệu</option>
                            <option value="status">Trạng thái</option>
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
                        <Building2 className="w-6 h-6 text-primary"/> Quản lý thương hiệu
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý thông tin và hình ảnh thương hiệu
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/brands/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5"/>
                        <span>Thêm thương hiệu</span>
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
                                placeholder="Tìm kiếm thương hiệu..."
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
                                {selectedStatus !== '' && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        1
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

            {/* Success Message */}
            {message && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg">
                    {message}
                </div>
            )}

            {/* Brand Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <BrandDataTable
                        brands={brandsPage}
                        onDeleteBrand={handleDeleteBrand}
                        onEditBrand={handleEditBrand}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        forceRefresh={imageRefreshCounter} // Truyền counter để BrandDataTable cập nhật ảnh
                    />
                </div>
            </div>

            {/* Edit Brand Popup */}
            {selectedBrandId && (
                <BrandEditPopup
                    brandId={selectedBrandId}
                    isOpen={isEditPopupOpen}
                    onClose={() => {
                        // Tăng counter để refresh ảnh khi đóng popup
                        setImageRefreshCounter(prev => prev + 1);
                        setIsEditPopupOpen(false);
                        setSelectedBrandId(null);
                    }}
                    onUpdate={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default BrandListPage;