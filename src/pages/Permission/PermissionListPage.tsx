import {useCallback, useEffect, useState} from 'react';
import {
    Download, Search, X, RefreshCw,
    Filter, ClipboardList
} from 'lucide-react';

import PermissionDataTable from '../../components/permission/permission-list/PermissionDataTable';
import {usePermissions, useGroupPermissions} from '../../hooks/permissionHooks';
import type {
    PageRequest,
    PermissionFilters,
    PermissionResponse,
    PageResponse
} from '../../types';

const PermissionListPage = () => {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [sortBy, setSortBy] = useState('permissionId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Hooks
    const {
        permissionsPage,
        permissionsList,
        isLoading,
        fetchAllPermissions,
        deletePermission,
    } = usePermissions();


    const {
        groupPermissionsList,
        getPermissionsByGroup,
        clearGroupPermissions,
    } = useGroupPermissions();

    // Get current permissions data
    const getCurrentPermissionsData = useCallback((): PageResponse<PermissionResponse> => {
        if (selectedGroup && groupPermissionsList.length > 0) {
            const start = currentPage * pageSize;
            const end = start + pageSize;

            return {
                content: groupPermissionsList.slice(start, end),
                totalElements: groupPermissionsList.length,
                totalPages: Math.ceil(groupPermissionsList.length / pageSize),
                size: pageSize,
                number: currentPage,
                first: currentPage === 0,
                last: end >= groupPermissionsList.length,
                empty: groupPermissionsList.length === 0
            };
        }
        return permissionsPage;
    }, [selectedGroup, groupPermissionsList, currentPage, pageSize, permissionsPage]);

    // Fetch data với filters
    const fetchData = useCallback(async (page: number = currentPage) => {
        const pageRequest: PageRequest = {
            page,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: PermissionFilters = {
            sortBy,
            sortDirection
        };

        console.log('📝 Page: Fetching data with:', {pageRequest, filters});

        if (searchTerm?.trim()) {
            filters.search = searchTerm.trim();
        }

        try {
            if (selectedGroup) {
                await getPermissionsByGroup(selectedGroup);
            } else {
                await fetchAllPermissions(pageRequest, filters);
            }
        } catch (error) {
            console.error('❌ Page: Error fetching permissions:', error);
        }
    }, [
        currentPage,
        pageSize,
        selectedGroup,
        searchTerm,
        sortBy,
        sortDirection,
        fetchAllPermissions,
        getPermissionsByGroup
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

    // Search với debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
            if (selectedGroup) {
                // Nếu đang filter theo group, clear group để search toàn bộ
                setSelectedGroup('');
                clearGroupPermissions();
            }
            fetchData(0);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    // Fetch data khi filters thay đổi
    useEffect(() => {
        if (!searchTerm) {  // Chỉ fetch khi không đang search
            fetchData();
        }
    }, [currentPage, pageSize, sortBy, sortDirection]);

    // Handlers
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const handleDeletePermission = async (id: number) => {
        const permissions = getCurrentPermissionsData();
        const permissionToDelete = permissions.content.find(p => p.permissionId === id);
        if (!permissionToDelete) return;
        await deletePermission(id);
        await handleRefresh();
    };

    const handleFilterChange = async (type: string, value: string) => {
        setCurrentPage(0);

        if (type === 'group') {
            if (value) {
                setSelectedGroup(value);
                await getPermissionsByGroup(value);
            } else {
                setSelectedGroup('');
                clearGroupPermissions();
                await fetchData(0);
            }
        }

        setIsFilterMenuOpen(false);
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

    const handleEditPermission = (permission: PermissionResponse) => {
        console.log('Edit permission:', permission.name);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGroup('');
        setSortBy('permissionId');
        setSortDirection('desc');
        setCurrentPage(0);
        clearGroupPermissions();
        setIsFilterMenuOpen(false);
        fetchData(0);
    };

    // Render group options
    const renderGroupOptions = () => {
        const options = Array.from(new Set(
            permissionsList
                .map(permission => permission.groupName)
                .filter(Boolean)
        ));

        return (
            <>
                <option value="">Tất cả nhóm quyền</option>
                {options.map(group => (
                    <option key={group} value={group}>
                        {group}
                    </option>
                ))}
            </>
        );
    };

    const tableProps = {
        permissions: getCurrentPermissionsData(),
        onDeletePermission: handleDeletePermission,
        onEditPermission: handleEditPermission,
        isLoading,
        onRefresh: handleRefresh,
        isRefreshing,
        isMobileView,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange
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
                    {/* Group Filter */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Nhóm quyền
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedGroup}
                            onChange={(e) => handleFilterChange('group', e.target.value)}
                        >
                            {renderGroupOptions()}
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
                            <option value="permissionId">ID</option>
                            <option value="name">Tên quyền</option>
                            <option value="codeName">Mã quyền</option>
                            <option value="groupName">Nhóm quyền</option>
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
                        <ClipboardList className="w-6 h-6 text-primary" />
                        Quản lý quyền
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý và phân quyền hệ thống
                    </p>
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
                                placeholder="Tìm kiếm quyền..."
                                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchData(0);
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
                                {selectedGroup && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        1
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    console.log('Export permissions');
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

            {/* Permission Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <PermissionDataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};

export default PermissionListPage;