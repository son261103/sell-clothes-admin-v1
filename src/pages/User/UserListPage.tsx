import {useCallback, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {
    Download, UserPlus, Search, X, RefreshCw,
    Filter, Users,
} from 'lucide-react';

import UserDataTable from '../../components/user/user-list/UserDataTable.tsx';
import {useUsers} from '../../hooks/userHooks';
import type {
    UserResponse,
    UserStatus,
    PageRequest,
    UserFilters
} from '@/types';
import UserEditPopup from "../../components/user/user-edit/UserEditPopup.tsx";

// Type cho status filter
type UserStatusFilter = UserStatus | '';

const UserListPage = () => {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<UserStatusFilter>('');
    const [selectedRole, setSelectedRole] = useState('');
    const [sortBy, setSortBy] = useState('userId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);


    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


    // Hooks
    const {
        usersPage,
        isLoading,
        fetchAllUsers,
        deleteUser,
        updateUserStatus
    } = useUsers();

    // Fetch data với filters
    const fetchData = useCallback(async (page: number = currentPage) => {
        const pageRequest: PageRequest = {
            page,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: UserFilters = {};

        // Chỉ thêm các filter khi có giá trị
        if (searchTerm?.trim()) {
            filters.search = searchTerm.trim();
        }
        if (selectedStatus !== '') {
            filters.status = selectedStatus;
        }
        if (selectedRole !== '') {
            filters.role = selectedRole;
        }
        filters.sortBy = sortBy;
        filters.sortDirection = sortDirection;

        try {
            await fetchAllUsers(pageRequest, filters);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [
        currentPage,
        pageSize,
        selectedStatus,
        selectedRole,
        searchTerm,
        sortBy,
        sortDirection,
        fetchAllUsers
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
        fetchData();
    }, [
        currentPage,
        pageSize,
        selectedStatus,
        selectedRole,
        sortBy,
        sortDirection
    ]);

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

    const handleStatusChange = async (id: number, status: UserStatus) => {
        const userToUpdate = usersPage.content.find(u => u.userId === id);
        if (!userToUpdate) return;

        const statusMessages = {
            ACTIVE: 'kích hoạt',
            LOCKED: 'khóa',
            BANNER: 'cấm',
            PENDING: 'chờ duyệt'
        };

        if (window.confirm(`Bạn có chắc chắn muốn ${statusMessages[status]} người dùng ${userToUpdate.fullName}?`)) {
            await updateUserStatus(id, status);
            await handleRefresh();
        }
    };

    const handleDeleteUser = async (id: number) => {
        const userToDelete = usersPage.content.find(u => u.userId === id);
        if (!userToDelete) return;
        await deleteUser(id);
        await handleRefresh();
    };

    const handleEditUser = (user: UserResponse) => {
        setSelectedUserId(user.userId);
        setIsEditPopupOpen(true);
    };

    const handleEditSuccess = () => {
        handleRefresh();
        setIsEditPopupOpen(false);
        setSelectedUserId(null);
    };

    const handleFilterChange = async (type: 'status' | 'role', value: string) => {
        setCurrentPage(0); // Reset về trang đầu tiên

        if (type === 'status') {
            setSelectedStatus(value as UserStatusFilter);
        } else if (type === 'role') {
            setSelectedRole(value);
        }

        // Fetch data ngay lập tức với filter mới
        const pageRequest: PageRequest = {
            page: 0,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`
        };

        const filters: UserFilters = {
            sortBy,
            sortDirection
        };

        if (searchTerm?.trim()) {
            filters.search = searchTerm.trim();
        }

        // Cập nhật filters dựa trên loại filter đang thay đổi
        if (type === 'status') {
            if (value !== '') {
                filters.status = value as UserStatus;
            }
            filters.role = selectedRole; // Giữ nguyên role hiện tại
        } else if (type === 'role') {
            if (value !== '') {
                filters.role = value;
            }
            if (selectedStatus !== '') {
                filters.status = selectedStatus;
            }
        }

        try {
            await fetchAllUsers(pageRequest, filters);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
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
        setSelectedRole('');
        setSortBy('userId');
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
                            value={selectedStatus}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                            <option value="BANNER">Đã cấm</option>
                            <option value="PENDING">Chờ duyệt</option>
                        </select>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className=" text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                            Vai trò
                        </label>
                        <select
                            className="bg-white w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                            value={selectedRole}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                        >
                            <option value="">Tất cả vai trò</option>
                            {usersPage.content
                                .flatMap(user => user.roles)
                                .filter((role, index, self) =>
                                    index === self.findIndex(r => r.name === role.name)
                                )
                                .map(role => (
                                    <option key={role.roleId} value={role.name}>
                                        {role.name}
                                    </option>
                                ))
                            }
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
                            <option value="userId">ID</option>
                            <option value="username">Tên đăng nhập</option>
                            <option value="fullName">Họ tên</option>
                            <option value="email">Email</option>
                            <option value="lastLoginAt">Lần đăng nhập cuối</option>
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
                        <Users className="w-6 h-6 text-primary"  /> Quản lý người dùng
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý và giám sát tài khoản người dùng
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/users/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <UserPlus className="h-3.5 w-3.5"/>
                        <span>Thêm người dùng</span>
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
                                placeholder="Tìm kiếm người dùng..."
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
                                {(selectedStatus || selectedRole) && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        {[selectedStatus, selectedRole].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    console.log('Export users');
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

            {/* User Table */}
            <div className="relative" style={{zIndex: 10}}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <UserDataTable
                        users={usersPage}
                        onDeleteUser={handleDeleteUser}
                        onEditUser={handleEditUser}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            <UserEditPopup
                userId={selectedUserId}
                isOpen={isEditPopupOpen}
                onClose={() => {
                    setIsEditPopupOpen(false);
                    setSelectedUserId(null);
                }}
                onUpdate={handleEditSuccess}
            />
        </div>
    );
};

export default UserListPage;