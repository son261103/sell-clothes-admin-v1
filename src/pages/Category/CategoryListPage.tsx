import { useCallback, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {
    Download, FolderPlus, Search, X, RefreshCw,
    Filter, Folder
} from 'lucide-react';

import CategoryDataTable from '../../components/category/CategoryDataTable';
import { useCategories } from '../../hooks/categoryHooks';
import {
    CategoryResponse,
    CategoryPageRequest,
    CategoryFilters, SubCategoryUpdateRequest
} from '@/types';
import CategoryEditPopup from "../../components/category/category-edit/CategoryEditPopup.tsx";
import { useAppDispatch } from "@/store/hooks.tsx";
import { fetchCategoryHierarchy } from "@/store/features/category/categorySlice.tsx";
import CategoryHierarchyModal from "@/components/category/category-edit/CategoryHierarchyModal.tsx";

interface SubcategoryCount {
    total: number;
    active: number;
    inactive: number;
}

// interface CategoryHierarchyResponse {
//     totalSubCategories: number;
//     activeSubCategories: number;
//     inactiveSubCategories: number;
// }

const CategoryListPage = () => {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<boolean | ''>('');
    const [sortBy, setSortBy] = useState('categoryId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // State to control fetching
    const [shouldFetchData, setShouldFetchData] = useState(true);

    const dispatch = useAppDispatch();

    // Subcategory Counts State
    const [subcategoryCounts, setSubcategoryCounts] = useState<Record<number, SubcategoryCount>>({});

    // Thêm state cho refresh subcategories
    const [subcategoryRefreshKey, setSubcategoryRefreshKey] = useState(0);

    const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

    // Add handler for viewing subcategories
    const handleViewSubcategories = (category: CategoryResponse) => {
        setSelectedCategory(category);
        setIsHierarchyModalOpen(true);
    };

    // Add handler for category update
    const handleSubCategoryUpdate = async (data: SubCategoryUpdateRequest) => {
        try {
            // Implement your update logic here
            await handleSubCategoryUpdate(data);
            setShouldFetchData(true);
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    };

    // Hooks
    const {
        categoriesPage,
        isLoading,
        fetchAllParentCategories,
        deleteParentCategory,
        toggleParentStatus
    } = useCategories();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Tối ưu hóa fetchSubcategoryCounts
    const fetchSubcategoryCount = useCallback(async (categoryId: number) => {
        try {
            const response = await dispatch(fetchCategoryHierarchy(categoryId)).unwrap();
            if (response) {
                setSubcategoryCounts(prev => ({
                    ...prev,
                    [categoryId]: {
                        total: response.totalSubCategories,
                        active: response.activeSubCategories,
                        inactive: response.inactiveSubCategories
                    }
                }));
            }
        } catch (error) {
            console.error(`Error fetching subcategories for category ${categoryId}:`, error);
        }
    }, [dispatch]);

    const fetchSubcategoryCounts = useCallback(async (categories: CategoryResponse[]) => {
        if (!categories || categories.length === 0) return;

        const promises = categories.map(category => fetchSubcategoryCount(category.categoryId));
        await Promise.all(promises);
    }, [fetchSubcategoryCount]);

    const handleSubcategoryUpdate = useCallback(async (parentCategoryId: number) => {
        await fetchSubcategoryCount(parentCategoryId);
        setSubcategoryRefreshKey(prev => prev + 1);
    }, [fetchSubcategoryCount]);

    // // Fetch subcategory counts - optimized to batch requests
    // const fetchSubcategoryCounts = useCallback(async (categories: CategoryResponse[]) => {
    //     if (!categories || categories.length === 0) return;
    //
    //     const counts: Record<number, SubcategoryCount> = {};
    //     const promises = categories.map(category =>
    //         dispatch(fetchCategoryHierarchy(category.categoryId))
    //             .then(response => {
    //                 if (response.payload) {
    //                     const unwrappedResponse = response.payload as CategoryHierarchyResponse;
    //                     counts[category.categoryId] = {
    //                         total: unwrappedResponse.totalSubCategories,
    //                         active: unwrappedResponse.activeSubCategories,
    //                         inactive: unwrappedResponse.inactiveSubCategories
    //                     };
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error(`Error fetching subcategories for category ${category.categoryId}:`, error);
    //                 counts[category.categoryId] = { total: 0, active: 0, inactive: 0 };
    //             })
    //     );
    //
    //     await Promise.all(promises);
    //     setSubcategoryCounts(counts);
    // }, [dispatch]);

    // Fetch data with filters - memoized to prevent recreation on each render
    const fetchData = useCallback(async () => {
        if (!shouldFetchData) return;

        const pageRequest: CategoryPageRequest = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: CategoryFilters = {};

        if (debouncedSearchTerm?.trim()) {
            filters.search = debouncedSearchTerm.trim();
        }
        if (selectedStatus !== '') {
            filters.status = selectedStatus;
        }
        filters.sortBy = sortBy;
        filters.sortDirection = sortDirection;

        try {
            setShouldFetchData(false);
            await fetchAllParentCategories(pageRequest, filters);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, [
        shouldFetchData,
        currentPage,
        pageSize,
        selectedStatus,
        debouncedSearchTerm,
        sortBy,
        sortDirection,
        fetchAllParentCategories
    ]);

    // Fetch subcategory data after categories are loaded
    useEffect(() => {
        if (categoriesPage?.content && categoriesPage.content.length > 0) {
            fetchSubcategoryCounts(categoriesPage.content);
        }
    }, [categoriesPage?.content, fetchSubcategoryCounts]);

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

// Enhanced refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (categoriesPage?.content) {
            await fetchSubcategoryCounts(categoriesPage.content);
        }
        setShouldFetchData(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

// Handle status change with subcategory refresh
    const handleStatusChange = async (id: number) => {
        if (!categoriesPage?.content) return;

        const categoryToUpdate = categoriesPage.content.find(c => c.categoryId === id);
        if (!categoryToUpdate) return;

        const message = categoryToUpdate.status ? 'vô hiệu hóa' : 'kích hoạt';

        if (window.confirm(`Bạn có chắc chắn muốn ${message} danh mục ${categoryToUpdate.name}?`)) {
            try {
                await toggleParentStatus(id);
                // Refresh subcategory counts for this category
                await fetchSubcategoryCount(id);
                setShouldFetchData(true);
            } catch (error) {
                console.error('Error updating category status:', error);
            }
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!categoriesPage || !categoriesPage.content) return;

        const categoryToDelete = categoriesPage.content.find(c => c.categoryId === id);
        if (!categoryToDelete) return;

        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục ${categoryToDelete.name}?`)) {
            await deleteParentCategory(id);
            setShouldFetchData(true);
        }
    };

    const handleEditCategory = (category: CategoryResponse) => {
        setSelectedCategoryId(category.categoryId);
        setIsEditPopupOpen(true);
    };

// Enhanced edit success handler
    const handleEditSuccess = async () => {
        if (selectedCategoryId) {
            await fetchSubcategoryCount(selectedCategoryId);
        }
        setShouldFetchData(true);
        setIsEditPopupOpen(false);
        setSelectedCategoryId(null);
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

    useEffect(() => {
        if (categoriesPage?.content) {
            fetchSubcategoryCounts(categoriesPage.content);
        }
    }, [categoriesPage?.content, fetchSubcategoryCounts, subcategoryRefreshKey]);


    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSortBy('categoryId');
        setSortDirection('desc');
        setCurrentPage(0);
        setIsFilterMenuOpen(false);
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
                            <option value="categoryId">ID</option>
                            <option value="name">Tên danh mục</option>
                            <option value="slug">Slug</option>
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
                        <Folder className="w-6 h-6 text-primary" /> Quản lý danh mục
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý và tổ chức danh mục sản phẩm
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/categories/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <FolderPlus className="h-3.5 w-3.5"/>
                        <span>Thêm danh mục</span>
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
                                placeholder="Tìm kiếm danh mục..."
                                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => {
                                        setSearchTerm('');
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
                                onClick={() => {
                                    console.log('Export categories');
                                }}
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

            {/* Category Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <CategoryDataTable
                        categories={categoriesPage}
                        subcategoryCounts={subcategoryCounts}
                        onDeleteCategory={handleDeleteCategory}
                        onEditCategory={handleEditCategory}
                        onStatusChange={handleStatusChange}
                        onViewSubcategories={handleViewSubcategories}  // Add this line
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            {selectedCategoryId && (
                <CategoryEditPopup
                    categoryId={selectedCategoryId}
                    isOpen={isEditPopupOpen}
                    onClose={() => {
                        setIsEditPopupOpen(false);
                        setSelectedCategoryId(null);
                    }}
                    onUpdate={handleEditSuccess}
                    onSubcategoryUpdate={handleSubcategoryUpdate}
                />
            )}

            {/* Add CategoryHierarchyModal */}
            {selectedCategory && (
                <CategoryHierarchyModal
                    isOpen={isHierarchyModalOpen}
                    onClose={() => {
                        setIsHierarchyModalOpen(false);
                        setSelectedCategory(null);
                    }}
                    category={selectedCategory}
                    onSubmit={handleSubCategoryUpdate}
                    onSubcategoryUpdate={handleSubcategoryUpdate}
                />
            )}
        </div>
    );
};

export default CategoryListPage;