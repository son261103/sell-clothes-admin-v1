import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    UserPlus,
    Search,
    X,
    RefreshCw,
    Download,
    Pencil,
    PawPrint,
    AlertCircle,
    Shield,
    Trash2
} from 'lucide-react';

import { useRoles } from '../../hooks/roleHooks';
import type { RoleFilters, RoleResponse } from '../../types';
import RoleEditPopup from "../../components/role/RoleEditPopup";

const RoleListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleResponse | null>(null);

    const {
        rolesPage,
        isLoading,
        error,
        fetchAllRoles,
        deleteRole,
    } = useRoles();

    const fetchData = useCallback(async () => {
        const pageRequest = {
            size: 10
        };

        const filters: RoleFilters = {
            searchTerm: searchTerm
        };

        try {
            await fetchAllRoles(pageRequest, filters);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    }, [searchTerm, fetchAllRoles]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setTimeout(() => {
            setIsRefreshing(false);
        }, 2000);
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleEditRole = (role: RoleResponse) => {
        setSelectedRole(role);
        setTimeout(() => {
            setIsEditPopupOpen(true);
        }, 50);
    };

    const handleDeleteClick = (role: RoleResponse) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (roleToDelete) {
            try {
                await deleteRole(roleToDelete.roleId);
                await handleRefresh();
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
            } catch (error) {
                console.error('Error deleting role:', error);
            }
        }
    };

    const handleClosePopup = () => {
        setIsEditPopupOpen(false);
        setTimeout(() => {
            setSelectedRole(null);
        }, 300);
    };

    const handleUpdateComplete = async () => {
        await handleRefresh();
        handleClosePopup();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-6">
            {/* Page Header - Keeping existing code */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                 data-aos="fade-down"
            >
                {/* ... existing header code ... */}
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        Quản lý vai trò
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý vai trò và quyền hạn của người dùng
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Link
                        to="/admin/access-control/roles/add"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md bg-primary text-white hover:bg-primary/90 items-center gap-1.5 transition-colors"
                    >
                        <UserPlus className="h-3.5 w-3.5"/>
                        <span>Thêm vai trò</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filters - Keeping existing code */}
            <div className="relative">
                {/* ... existing search and filters code ... */}
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-4 transition-all">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-secondary dark:text-highlight"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm vai trò..."
                                className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={handleSearchInput}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X className="w-4 h-4 text-secondary dark:text-highlight hover:text-accent dark:hover:text-textLight transition-colors"/>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                                onClick={handleRefresh}
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors ${
                                    isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                <span className="hidden sm:inline">Làm mới</span>
                            </button>

                            <button
                                className="h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5"/>
                                <span className="hidden sm:inline">Xuất danh sách</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles Grid */}
            <div className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white dark:bg-secondary rounded-xl p-4"
                     data-aos="fade-up"
                     data-aos-delay="500"
                >
                    {isLoading ? (
                        <div className="col-span-full flex justify-center items-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary"/>
                        </div>
                    ) : error ? (
                        <div className="col-span-full flex items-center justify-center py-8 text-red-500">
                            <AlertCircle className="w-6 h-6 mr-2"/>
                            <span>Lỗi tải vai trò</span>
                        </div>
                    ) : rolesPage?.content?.map((role) => (
                        <div
                            key={role.roleId}
                            className="group bg-white dark:bg-secondary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-primary overflow-hidden"
                        >
                            <div className="w-full p-6 text-left relative">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <PawPrint className="w-5 h-5 text-primary"/>
                                            <h3 className="font-semibold text-primary dark:text-textLight text-lg">
                                                {role.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {role.description}
                                        </p>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <span>Ngày tạo:</span>
                                            <span>
                                                {new Date(role.createdAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Shield className="w-4 h-4" />
                                            {role.permissions.length} quyền
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary dark:text-primary/90 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all duration-200"
                                            onClick={() => handleEditRole(role)}
                                        >
                                            <Pencil className="w-4 h-4"/>
                                            <span>Sửa</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                            onClick={() => handleDeleteClick(role)}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Popup */}
            {selectedRole && (
                <RoleEditPopup
                    isOpen={isEditPopupOpen}
                    onClose={handleClosePopup}
                    role={selectedRole}
                    onUpdate={handleUpdateComplete}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-secondary bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Xác nhận xóa vai trò
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Bạn có chắc chắn muốn xóa vai trò{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                    {roleToDelete?.name}
                </span>{' '}
                            không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setRoleToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleListPage;