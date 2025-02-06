import {useEffect, useState, useMemo} from 'react';
import {
    Download, UserPlus, Users, Search, X, RefreshCw,
    UserCheck, UserX, Clock, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import UserDataTable from '../../components/user/UserDataTable';
import {useUsers, useUserStatusFilters, useUserFilters} from '../../hooks/userHooks';
import type {UserResponse, UserStatus} from '../../types';
import {Link} from "react-router-dom";

const UserListPage = () => {
    const {users, isLoading, fetchAllUsers, deleteUser, updateUserStatus} = useUsers();
    const {activeUsers, inactiveUsers, pendingUsers, blockedUsers} = useUserStatusFilters();

    const [searchTerm, setSearchTerm] = useState('');
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');
    const [selectedRole, setSelectedRole] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {filteredUsers} = useUserFilters({
        status: selectedStatus || undefined,
        role: selectedRole || undefined,
        searchTerm: searchTerm || quickSearch || undefined
    });

    const stats = [
        {
            title: 'Tổng người dùng',
            value: users.length,
            trend: '+12%',
            isIncrease: true,
            icon: <Users className="w-5 h-5 sm:w-6 sm:h-6"/>,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            title: 'Đang hoạt động',
            value: activeUsers.length,
            trend: '+8%',
            isIncrease: true,
            icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6"/>,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            title: 'Bị khóa/Cấm',
            value: inactiveUsers.length + blockedUsers.length,
            trend: '-2%',
            isIncrease: false,
            icon: <UserX className="w-5 h-5 sm:w-6 sm:h-6"/>,
            color: 'text-red-500',
            bgColor: 'bg-red-100 dark:bg-red-900/20'
        },
        {
            title: 'Chờ duyệt',
            value: pendingUsers.length,
            trend: '+5%',
            isIncrease: true,
            icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6"/>,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        }
    ];

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

    const renderStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <span className={stat.color}>{stat.icon}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className={`text-xs ${stat.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend}
                            </span>
                            {stat.isIncrease ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-green-500"/>
                            ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 text-red-500"/>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm text-secondary dark:text-highlight">
                            {stat.title}
                        </h3>
                        <p className="text-2xl font-bold text-textDark dark:text-textLight mt-1">
                            {stat.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSearchAndFilters = () => (
        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="400">
            <div className="p-4 border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-secondary dark:text-highlight"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh..."
                            className="w-full h-10 px-10 pr-10 rounded-lg border border-primary dark:border-secondary bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm"
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

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleRefresh}
                            className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                            Làm mới
                        </button>

                        <div className="relative">
                            <button
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 ${
                                    isFilterMenuOpen ? 'bg-gray-50 dark:bg-gray-700 border-primary dark:border-primary' : ''
                                }`}
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            >
                                <Filter className="w-3.5 h-3.5"/>
                                <span>Bộ lọc</span>
                                {(selectedStatus || selectedRole) && (
                                    <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                        {[selectedStatus, selectedRole].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                            {isFilterMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-secondary rounded-xl shadow-lg z-50">
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
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

                                        <div>
                                            <label
                                                className="text-sm font-medium mb-1 block text-textDark dark:text-textLight">
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

                                        <button
                                            className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700"
                                            onClick={clearFilters}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
                            <Download className="h-3.5 w-3.5"/>
                            Xuất danh sách
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b"
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
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/user/create"
                        className="inline-flex h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5"
                    >
                        <UserPlus className="h-3.5 w-3.5"/>
                        Thêm người dùng
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            {renderStats()}

            {/* Search and Filters */}
            {renderSearchAndFilters()}

            {/* User Table */}
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
                />
            </div>
        </div>
    );
};

export default UserListPage;