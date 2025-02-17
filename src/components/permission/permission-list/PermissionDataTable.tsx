import React from 'react';
import {
    Edit, Trash2, RefreshCw, MoreVertical,
    ShieldCheck, Info, Calendar,
    Lock, Shield
} from 'lucide-react';
import type {PermissionResponse, PageResponse} from '../../../types';
import Pagination from '../../common/Pagination';
import ConfirmationModal from '../../common/ConfirmationModal';

interface PermissionDataTableProps {
    permissions?: PageResponse<PermissionResponse>;
    onDeletePermission: (id: number) => void;
    onEditPermission: (permission: PermissionResponse) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isMobileView?: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const PermissionDataTable: React.FC<PermissionDataTableProps> = ({
                                                                     permissions,
                                                                     onDeletePermission,
                                                                     isLoading = false,
                                                                     onRefresh,
                                                                     isRefreshing = false,
                                                                     isMobileView = false,
                                                                     onPageChange,
                                                                     onPageSizeChange
                                                                 }) => {
    const [activeDropdown, setActiveDropdown] = React.useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
    const [permissionToDelete, setPermissionToDelete] = React.useState<PermissionResponse | null>(null);
    const [showEditMessage, setShowEditMessage] = React.useState(false);
    const [showLoading, setShowLoading] = React.useState(false);

    // Handler for edit click
    const handleEditClick = () => {
        setShowEditMessage(true);
        setTimeout(() => setShowEditMessage(false), 3000);
    };

    // Handler for initiating delete
    const handleDeleteClick = (permission: PermissionResponse) => {
        setPermissionToDelete(permission);
        setShowDeleteConfirmation(true);
        setActiveDropdown(null);
    };

    // Handler for confirming delete
    const confirmDelete = () => {
        if (permissionToDelete) {
            onDeletePermission(permissionToDelete.permissionId);
            setShowDeleteConfirmation(false);
            setPermissionToDelete(null);
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown !== null) {
                const dropdown = document.getElementById(`dropdown-${activeDropdown}`);
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setActiveDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    React.useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (isLoading) {
            timeoutId = setTimeout(() => setShowLoading(true), 500);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    const renderMobileActions = (permission: PermissionResponse) => (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === permission.permissionId ? null : permission.permissionId);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-secondary dark:text-highlight"/>
            </button>

            {activeDropdown === permission.permissionId && (
                <div
                    id={`dropdown-${permission.permissionId}`}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick();
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Edit className="w-4 h-4"/>
                        Chỉnh sửa
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>
                    <button
                        onClick={() => {
                            handleDeleteClick(permission);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-red-600"
                    >
                        <Trash2 className="w-4 h-4"/>
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );

    if (showLoading) {
        return (
            <div
                className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    // Handle case when permissions is undefined or null
    if (!permissions) {
        return (
            <div className="w-full bg-white dark:bg-secondary rounded-xl shadow-lg p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            </div>
        );
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {permissions.content?.map((permission) => (
                        <div key={permission.permissionId}
                             className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {/* Rest of mobile view content */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                                        <ShieldCheck className="w-6 h-6 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-textDark dark:text-textLight">
                                            {permission.name}
                                        </h3>
                                        <p className="text-sm text-secondary dark:text-highlight">
                                            {permission.codeName}
                                        </p>
                                    </div>
                                </div>
                                {renderMobileActions(permission)}
                            </div>
                            {/* Rest of the mobile view content */}
                        </div>
                    ))}
                </div>
                {permissions.content?.length > 0 && (
                    <Pagination
                        currentPage={permissions.number}
                        totalPages={permissions.totalPages}
                        onPageChange={onPageChange}
                        pageSize={permissions.size}
                        totalElements={permissions.totalElements}
                        onPageSizeChange={onPageSizeChange}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 font-bold border-b border-gray-200 dark:border-gray-700">
                        {[
                            {icon: Shield, label: 'Mã'},
                            {icon: Info, label: 'Tên quyền'},
                            {icon: Lock, label: 'Mã quyền'},
                            {icon: ShieldCheck, label: 'Nhóm quyền'},
                            {icon: Calendar, label: 'Ngày tạo'},
                        ].map((header, idx) => (
                            <th
                                key={idx}
                                className={`py-2 px-4 text-xs font-bold text-secondary dark:text-highlight 
                                text-center border-r border-gray-200 dark:border-gray-700 
                                ${idx === 0 ? 'rounded-tl-xl w-20' : ''} 
                                ${idx === 5 ? 'rounded-tr-xl w-40 border-r-0' : ''}`}
                            >
                                <div className="flex items-center gap-1.5 justify-center">
                                    {header.icon && <header.icon className="w-3.5 h-3.5"/>}
                                    <span className="font-bold">{header.label}</span>
                                    {idx === 1 && onRefresh && (
                                        <button
                                            onClick={onRefresh}
                                            disabled={isRefreshing}
                                            className={`ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                            ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Làm mới"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {permissions.content?.map((permission, idx) => (
                        <tr key={permission.permissionId}
                            className={`group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 
                                    transition-colors duration-200 border-b border-gray-200 
                                    dark:border-gray-700 ${idx === permissions.content.length - 1 ? 'border-b-0' : ''}`}
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 text-center">
                                    <span className="text-sm text-textDark dark:text-textLight">
                                        {permission.permissionId}
                                    </span>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-textDark dark:text-textLight truncate">
                                        {permission.name}
                                    </div>
                                    <div className="text-xs text-secondary dark:text-highlight truncate">
                                        {permission.description}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200  dark:border-gray-700">
                                <div className="text-sm text-textDark dark:text-textLight">
                                    {permission.codeName}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs
                                        font-medium border border-primary/30 text-primary
                                        dark:text-primary gap-1.5 transition-all duration-200
                                        hover:border-primary/50">
                                        <Shield className="w-3.5 h-3.5"/>
                                        {permission.groupName}
                                    </span>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/70"/>
                                    <span className="truncate">
                                            {new Date(permission.createdAt).toLocaleString()}
                                        </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {permissions.content?.length > 0 && (
                <Pagination
                    currentPage={permissions.number}
                    totalPages={permissions.totalPages}
                    onPageChange={onPageChange}
                    pageSize={permissions.size}
                    totalElements={permissions.totalElements}
                    onPageSizeChange={onPageSizeChange}
                />
            )}

            {/* Edit Message Popup */}
            {showEditMessage && (
                <div
                    className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5"/>
                        <p>Chức năng đang được phát triển!</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={showDeleteConfirmation}
                onClose={() => {
                    setShowDeleteConfirmation(false);
                    setPermissionToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa quyền ${permissionToDelete?.name} không? Hành động này không thể hoàn tác.`}
                cancelText="Hủy"
                confirmText="Xác nhận xóa"
            />
        </div>
    );
};

export default PermissionDataTable;