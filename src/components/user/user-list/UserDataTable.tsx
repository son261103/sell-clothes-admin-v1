import React from 'react';
import {
    Users, Edit, Trash2, Ban, Lock, Unlock,
    Phone, Mail, User, Shield, Calendar, Info, RefreshCw, CheckCircle, Image,
    MoreVertical
} from 'lucide-react';
import type {UserResponse, UserStatus, PageResponse} from '../../../types';
import Pagination from '../../common/Pagination.tsx';

interface UserDataTableProps {
    users: PageResponse<UserResponse>;
    onDeleteUser: (id: number) => void;
    onEditUser: (user: UserResponse) => void;
    onStatusChange: (id: number, status: UserStatus) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isMobileView?: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const UserDataTable: React.FC<UserDataTableProps> = ({
                                                         users,
                                                         onDeleteUser,
                                                         onEditUser,
                                                         onStatusChange,
                                                         isLoading = false,
                                                         onRefresh,
                                                         isRefreshing = false,
                                                         isMobileView = false,
                                                         onPageChange,
                                                         onPageSizeChange
                                                     }) => {
    const [activeDropdown, setActiveDropdown] = React.useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<UserResponse | null>(null);

    // Handler for initiating delete
    const handleDeleteClick = (user: UserResponse) => {
        setUserToDelete(user);
        setShowDeleteConfirmation(true);
        setActiveDropdown(null); // Close dropdown if open
    };

    // Handler for confirming delete
    const confirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.userId);
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
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

    const getStatusBadgeClass = (status: UserStatus) => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";
        switch (status) {
            case 'ACTIVE':
                return `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`;
            case 'LOCKED':
                return `${baseClasses} text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400`;
            case 'BANNER':
                return `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
            case 'PENDING':
                return `${baseClasses} text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-400`;
        }
    };

    const getStatusText = (status: UserStatus): string => {
        const statusMap: Record<UserStatus, string> = {
            ACTIVE: 'Đang hoạt động',
            LOCKED: 'Đã khóa',
            BANNER: 'Đã cấm',
            PENDING: 'Chờ duyệt'
        };
        return statusMap[status] || status;
    };

    const ActionButton = ({onClick, icon: Icon, color, title}: {
        onClick: () => void;
        icon: typeof Edit;
        color: string;
        title: string;
    }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 ${color} 
                  transition-colors duration-200 hover:scale-105 transform`}
            title={title}
        >
            <Icon className="w-3.5 h-3.5"/>
        </button>
    );


    const renderActionButtons = (user: UserResponse) => (
        <div className="flex items-center gap-1.5">
            <ActionButton
                onClick={() => onEditUser(user)}
                icon={Edit}
                color="text-blue-600 dark:text-blue-400"
                title="Chỉnh sửa"
            />
            <ActionButton
                onClick={() => onStatusChange(user.userId, user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')}
                icon={user.status === 'ACTIVE' ? Lock : Unlock}
                color={user.status === 'ACTIVE'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'}
                title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
            />
            <ActionButton
                onClick={() => onStatusChange(user.userId, 'BANNER')}
                icon={Ban}
                color="text-orange-600 dark:text-orange-400"
                title="Cấm tài khoản"
            />
            <ActionButton
                onClick={() => handleDeleteClick(user)}
                icon={Trash2}
                color="text-red-600 dark:text-red-400"
                title="Xóa"
            />
        </div>
    );

    const renderMobileActions = (user: UserResponse) => (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === user.userId ? null : user.userId);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-secondary dark:text-highlight"/>
            </button>

            {activeDropdown === user.userId && (
                <div
                    id={`dropdown-${user.userId}`}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditUser(user);
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Edit className="w-4 h-4"/>
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => {
                            onStatusChange(user.userId, user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE');
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        {user.status === 'ACTIVE' ? (
                            <>
                                <Lock className="w-4 h-4"/>
                                Khóa tài khoản
                            </>
                        ) : (
                            <>
                                <Unlock className="w-4 h-4"/>
                                Mở khóa
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            onStatusChange(user.userId, 'BANNER');
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Ban className="w-4 h-4"/>
                        Cấm tài khoản
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>
                    <button
                        onClick={() => {
                            handleDeleteClick(user);
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

    const [showLoading, setShowLoading] = React.useState(false);

    React.useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (isLoading) {
            timeoutId = setTimeout(() => setShowLoading(true), 500);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    if (showLoading) {
        return (
            <div
                className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.content.map((user) => (
                        <div key={user.userId}
                             className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {/* Header with Avatar and Actions */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Users className="w-6 h-6 text-primary"/>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-textDark dark:text-textLight">
                                            {user.fullName}
                                        </h3>
                                        <p className="text-sm text-secondary dark:text-highlight">
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                                {renderMobileActions(user)}
                            </div>

                            {/* User Info Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Contact Information */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-secondary dark:text-highlight">
                                        <Mail className="w-4 h-4 shrink-0"/>
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div
                                            className="flex items-center gap-2 text-sm text-secondary dark:text-highlight">
                                            <Phone className="w-4 h-4 shrink-0"/>
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status and Roles */}
                                <div className="space-y-3">
                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className={getStatusBadgeClass(user.status)}>
                                            {getStatusText(user.status)}
                                        </span>
                                    </div>

                                    {/* Roles */}
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role.roleId}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs
                                                        font-medium border border-primary/30 text-primary
                                                        dark:text-primary gap-1.5 bg-primary/5"
                                            >
                                                <Shield className="w-3.5 h-3.5"/>
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Last Login */}
                                <div
                                    className="flex items-center gap-2 text-sm text-secondary dark:text-highlight pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                    <Calendar className="w-4 h-4 shrink-0"/>
                                    <span>
                                        {user.lastLoginAt
                                            ? new Date(user.lastLoginAt).toLocaleString()
                                            : 'Chưa đăng nhập'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination
                    currentPage={users.number}
                    totalPages={users.totalPages}
                    onPageChange={onPageChange}
                    pageSize={users.size}
                    totalElements={users.totalElements}
                    onPageSizeChange={onPageSizeChange}
                />
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        {[
                            {icon: Image, label: 'Avatar'},
                            {icon: User, label: 'Thông tin'},
                            {icon: Info, label: 'Liên hệ'},
                            {icon: Shield, label: 'Vai trò & Trạng thái'},
                            {icon: Calendar, label: 'Hoạt động'},
                            {icon: CheckCircle, label: 'Thao tác'}
                        ].map((header, idx) => (
                            <th key={idx} className={`py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight 
                                        text-center border-r border-gray-200 dark:border-gray-700 
                                        ${idx === 0 ? 'rounded-tl-xl w-20' : ''} 
                                        ${idx === 5 ? 'rounded-tr-xl w-40 border-r-0' : ''}`}>
                                <div className="flex items-center gap-1.5 justify-center">
                                    {header.icon && <header.icon className="w-3.5 h-3.5"/>}
                                    <span>{header.label}</span>
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
                    {users.content.map((user, idx) => (
                        <tr key={user.userId}
                            className={`group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 
                                        transition-colors duration-200 border-b border-gray-200 
                                        dark:border-gray-700 ${idx === users.content.length - 1 ? 'border-b-0' : ''}`}
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center
                                                justify-center shrink-0 overflow-hidden group-hover:ring-2
                                                ring-primary/20 transition-all duration-200">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Users className="w-4 h-4 text-primary"/>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-textDark dark:text-textLight truncate">
                                        {user.fullName}
                                    </div>
                                    <div className="text-xs text-secondary dark:text-highlight truncate">
                                        @{user.username}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                        <Mail className="w-3.5 h-3.5 mr-1.5 text-primary/70"/>
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                            <Phone className="w-3.5 h-3.5 mr-1.5 text-primary/70"/>
                                            <span className="truncate">{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                        <span className={getStatusBadgeClass(user.status)}>
                                            {getStatusText(user.status)}
                                        </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role.roleId}
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                                                            font-medium border border-primary/30 text-primary
                                                            dark:text-primary gap-1.5 transition-all duration-200
                                                            hover:border-primary/50"
                                            >
                                                    <Shield className="w-3.5 h-3.5"/>
                                                {role.name}
                                                </span>
                                        ))}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/70"/>
                                    <span className="truncate">
                                            {user.lastLoginAt
                                                ? new Date(user.lastLoginAt).toLocaleString()
                                                : 'Chưa đăng nhập'}
                                        </span>
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                {renderActionButtons(user)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {showDeleteConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Xác nhận xóa
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Bạn có chắc chắn muốn xóa người dùng{' '}
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                {userToDelete?.fullName}
                            </span>{' '}
                                không? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirmation(false);
                                        setUserToDelete(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Xác nhận xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Pagination
                currentPage={users.number}
                totalPages={users.totalPages}
                onPageChange={onPageChange}
                pageSize={users.size}
                totalElements={users.totalElements}
                onPageSizeChange={onPageSizeChange}
            />
        </div>
    );
};

export default UserDataTable;