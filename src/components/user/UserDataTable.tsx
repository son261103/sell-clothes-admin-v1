import React from 'react';
import {
    Users, Edit, Trash2, Ban, Lock, Unlock,
    Phone, Mail, User, Shield, Calendar, Info, RefreshCw, CheckCircle
} from 'lucide-react';
import type { UserResponse, UserStatus } from '../../types';

interface UserDataTableProps {
    users: UserResponse[];
    onDeleteUser: (id: number) => void;
    onEditUser: (user: UserResponse) => void;
    onStatusChange: (id: number, status: UserStatus) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

const UserDataTable: React.FC<UserDataTableProps> = ({
                                                         users,
                                                         onDeleteUser,
                                                         onEditUser,
                                                         onStatusChange,
                                                         isLoading = false,
                                                         onRefresh,
                                                         isRefreshing = false
                                                     }) => {
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

    const ActionButton = ({ onClick, icon: Icon, color, title }: {
        onClick: () => void;
        icon: typeof Edit;
        color: string;
        title: string;
    }) => (
        <button
            onClick={onClick}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 ${color} 
                      transition-colors duration-200 hover:scale-105 transform`}
            title={title}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );

    const actionButtons = (user: UserResponse) => (
        <div className="flex items-center gap-1.5">
            <ActionButton
                onClick={() => onEditUser(user)}
                icon={Edit}
                color="text-blue-600 dark:text-blue-400"
                title="Edit User"
            />
            <ActionButton
                onClick={() => onStatusChange(user.userId, user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')}
                icon={user.status === 'ACTIVE' ? Lock : Unlock}
                color={user.status === 'ACTIVE'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'}
                title={user.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account'}
            />
            <ActionButton
                onClick={() => onStatusChange(user.userId, 'BANNER')}
                icon={Ban}
                color="text-orange-600 dark:text-orange-400"
                title="Ban User"
            />
            <ActionButton
                onClick={() => onDeleteUser(user.userId)}
                icon={Trash2}
                color="text-red-600 dark:text-red-400"
                title="Delete User"
            />
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
            <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
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
                            { icon: User, label: 'User Info' },
                            { icon: Info, label: 'Contact Details' },
                            { icon: Shield, label: 'Roles & Status' },
                            { icon: Calendar, label: 'Last Activity' },
                            { icon: CheckCircle, label: 'Actions' }
                        ].map((header, idx) => (
                            <th key={idx} className={`py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight 
                                    text-center border-r border-gray-200 dark:border-gray-700 
                                    ${idx === 0 ? 'rounded-tl-xl' : ''} 
                                    ${idx === 4 ? 'rounded-tr-xl w-40 border-r-0' : ''}`}>
                                <div className="flex items-center gap-1.5 justify-center">
                                    {header.icon && <header.icon className="w-3.5 h-3.5" />}
                                    <span>{header.label}</span>
                                    {idx === 0 && onRefresh && (
                                        <button
                                            onClick={onRefresh}
                                            disabled={isRefreshing}
                                            className={`ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                                                    ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Refresh table"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user, idx) => (
                        <tr key={user.userId}
                            className={`group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 
                                          transition-colors duration-200 border-b border-gray-200 
                                          dark:border-gray-700 ${idx === users.length - 1 ? 'border-b-0' : ''}`}
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center
                                                    justify-center shrink-0 overflow-hidden group-hover:ring-2
                                                    ring-primary/20 transition-all duration-200">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Users className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-textDark dark:text-textLight truncate">
                                            {user.fullName}
                                        </div>
                                        <div className="text-xs text-secondary dark:text-highlight truncate">
                                            @{user.username}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                        <Mail className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                            <Phone className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                                            <span className="truncate">{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                    <span className={getStatusBadgeClass(user.status)}>
                                        {user.status}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role.roleId}
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                                                        font-medium border border-primary/30 text-primary
                                                        dark:text-primary-400 gap-1.5 transition-all duration-200
                                                        hover:border-primary/50"
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-xs text-textDark dark:text-textLight">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                                    <span className="truncate">
                                        {user.lastLoginAt
                                            ? new Date(user.lastLoginAt).toLocaleString()
                                            : 'Never logged in'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                {actionButtons(user)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDataTable;