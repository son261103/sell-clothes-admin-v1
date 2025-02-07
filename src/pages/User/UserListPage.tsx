import {useEffect, useState, useMemo} from 'react';
import {
    Download, UserPlus, Search, X, RefreshCw,
    Filter,
} from 'lucide-react';
import UserDataTable from '../../components/user/UserDataTable';
import {useUsers, useUserFilters} from '../../hooks/userHooks';
import type {UserResponse, UserStatus} from '../../types';
import {Link} from "react-router-dom";

const UserListPage = () => {
    const {users, isLoading, fetchAllUsers, deleteUser, updateUserStatus} = useUsers();
    const [isMobileView, setIsMobileView] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');
    const [selectedRole, setSelectedRole] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close filter menu when clicking outside
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

    const {filteredUsers} = useUserFilters({
        status: selectedStatus || undefined,
        role: selectedRole || undefined,
        searchTerm: searchTerm || quickSearch || undefined
    });

    const availableRoles = useMemo(() => {
        const roleSet = new Set<string>();
        users.forEach(user => {
            user.roles.forEach(role => {
                roleSet.add(role.name);
            });
        });
        return Array.from(roleSet);
    }, [users]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAllUsers();
        setIsRefreshing(false);
    };

    const handleQuickSearch = () => {
        setSearchTerm(quickSearch);
    };

    const handleEditUser = (user: UserResponse) => {
        console.log('Edit user:', user);
    };

    const handleDeleteUser = async (id: number) => {
        const userToDelete = users.find(u => u.userId === id);
        if (!userToDelete) return;

        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${userToDelete.fullName}?`)) {
            await deleteUser(id);
        }
    };

    const handleStatusChange = async (id: number, status: UserStatus) => {
        const userToUpdate = users.find(u => u.userId === id);
        if (!userToUpdate) return;

        const statusMessages = {
            ACTIVE: 'kích hoạt',
            LOCKED: 'khóa',
            BANNER: 'cấm',
            PENDING: 'chờ duyệt'
        };

        if (window.confirm(`Bạn có chắc chắn muốn ${statusMessages[status]} người dùng ${userToUpdate.fullName}?`)) {
            await updateUserStatus(id, status);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setQuickSearch('');
        setSelectedStatus('');
        setSelectedRole('');
        setIsFilterMenuOpen(false);
    };

    const renderSearchAndFilters = () => (
        <div className="relative">
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="400">
                <div className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        {/* Search Input - Full width on mobile */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-secondary dark:text-highlight"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhanh..."
                                className="w-full h-10 px-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={quickSearch}
                                onChange={(e) => setQuickSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                            />
                            {quickSearch && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setQuickSearch('')}
                                >
                                    <X className="w-4 h-4 text-secondary dark:text-highlight hover:text-accent dark:hover:text-textLight transition-colors"/>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons - Stack on mobile */}
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

                            {/* Filter Button */}
                            <div className="relative">
                                <button
                                    id="filter-button"
                                    className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                        isFilterMenuOpen ? 'bg-gray-50 dark:bg-gray-700 border-primary dark:border-primary' : ''
                                    }`}
                                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                >
                                    <Filter className="w-3.5 w-3.5"/>
                                    <span className="hidden sm:inline">Bộ lọc</span>
                                    {(selectedStatus || selectedRole) && (
                                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                            {[selectedStatus, selectedRole].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <button className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
                                <Download className="h-3.5 w-3.5"/>
                                <span className="hidden sm:inline">Xuất danh sách</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Menu and Overlay */}
            {isFilterMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/20 dark:bg-black/40"
                        style={{ zIndex: 40 }}
                        onClick={() => setIsFilterMenuOpen(false)}
                    />

                    {/* Filter Menu */}
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
                                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as UserStatus | '')}
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
                                <label className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
                                    Vai trò
                                </label>
                                <select
                                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-textDark dark:text-textLight text-sm"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">Tất cả vai trò</option>
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
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
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header - Mobile responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                 data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight">
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý và giám sát tài khoản người dùng
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/user/create"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <UserPlus className="h-3.5 w-3.5"/>
                        <span>Thêm người dùng</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            {renderSearchAndFilters()}

            {/* User Table */}
            <div className="relative" style={{ zIndex: 10 }}>
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <UserDataTable
                        users={filteredUsers}
                        onDeleteUser={handleDeleteUser}
                        onEditUser={handleEditUser}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        isMobileView={isMobileView}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserListPage;