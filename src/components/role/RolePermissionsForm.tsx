import React, { useState, useEffect, useMemo } from 'react';
import {  Check, Search, ArrowLeft, Box, ChevronDown, ChevronUp } from 'lucide-react';
import type { PermissionResponse } from '../../types';
import Pagination from '../common/Pagination';
import Loading from '../common/Loading';

interface RolePermissionsFormProps {
    permissions: PermissionResponse[];
    selectedPermissions: Set<number>;
    isLoading: boolean;
    onPermissionToggle: (permissionId: number) => void;
    onBack: () => void;
    onSubmit: () => void;
}

const Switch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({checked, onChange, disabled = false}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
            relative inline-flex h-6 w-11 items-center rounded-full 
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary/20
            ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        `}
    >
        <span
            className={`
                inline-block h-4 w-4 transform rounded-full 
                bg-white shadow-lg
                transition-all duration-300 ease-in-out
                ${checked ? 'translate-x-6 scale-110' : 'translate-x-1 scale-100'}
            `}
        />
    </button>
);

export const RolePermissionsForm: React.FC<RolePermissionsFormProps> = ({
                                                                            permissions,
                                                                            selectedPermissions,
                                                                            isLoading,
                                                                            onPermissionToggle,
                                                                            onBack,
                                                                            onSubmit,
                                                                        }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Group and filter permissions
    const { groupedPermissions, filteredTotal } = useMemo(() => {
        const grouped: { [key: string]: PermissionResponse[] } = {};
        let total = 0;

        permissions.forEach(permission => {
            const group = permission.groupName || 'Other';
            if (!grouped[group]) {
                grouped[group] = [];
            }

            // Apply search filter
            if (!searchTerm ||
                permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permission.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                grouped[group].push(permission);
                total++;
            }
        });

        // Sort permissions within each group
        Object.keys(grouped).forEach(group => {
            grouped[group].sort((a, b) => a.name.localeCompare(b.name));
        });

        return {
            groupedPermissions: grouped,
            filteredTotal: total
        };
    }, [permissions, searchTerm]);

    // Calculate pagination
    const paginatedPermissions = useMemo(() => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        let currentCount = 0;
        const result: { [key: string]: PermissionResponse[] } = {};

        for (const [group, perms] of Object.entries(groupedPermissions)) {
            if (currentCount >= end) break;

            if (currentCount + perms.length <= start) {
                currentCount += perms.length;
                continue;
            }

            const groupStart = Math.max(0, start - currentCount);
            const groupEnd = Math.min(perms.length, end - currentCount);

            if (groupStart < perms.length) {
                result[group] = perms.slice(groupStart, groupEnd);
                currentCount += groupEnd - groupStart;
            }
        }

        return result;
    }, [groupedPermissions, currentPage, pageSize]);

    // Handle group expansion
    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    // Handle group toggle
    const handleGroupToggle = (groupName: string, checked: boolean) => {
        const groupPermissions = groupedPermissions[groupName] || [];
        groupPermissions.forEach(permission => {
            if (checked !== selectedPermissions.has(permission.permissionId)) {
                onPermissionToggle(permission.permissionId);
            }
        });
    };

    // Check if group is fully selected
    const isGroupChecked = (permissions: PermissionResponse[]): boolean => {
        return permissions.length > 0 && permissions.every(p => selectedPermissions.has(p.permissionId));
    };

    // Initialize expanded groups
    useEffect(() => {
        setExpandedGroups(new Set(Object.keys(groupedPermissions)));
    }, [groupedPermissions]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredTotal / pageSize);

    return (
        <div className="flex flex-col h-full ">
            {/* Fixed Header with Search */}
            <div className="sticky top-0 z-20  p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400"/>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm quyền..."
                        className="block w-full pl-10 pr-3 py-2 rounded-md border
                            border-gray-300 dark:border-gray-600
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            focus:ring-2 focus:ring-primary/40 focus:border-primary sm:text-sm"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <Loading message="Đang tải danh sách quyền..."/>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(paginatedPermissions).map(([groupName, permissions]) => (
                            <div key={groupName}
                                 className="border border-gray-200 dark:border-gray-700 rounded-xl
                                         overflow-hidden hover:border-primary/20 transition-colors duration-200">
                                {/* Group Header */}
                                <div onClick={() => toggleGroup(groupName)}
                                     className="flex items-center justify-between p-4
                                              bg-gray-50 dark:bg-gray-800/50 cursor-pointer
                                              hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Box className="w-5 h-5 text-primary flex-shrink-0"/>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                <span className="truncate">{groupName}</span>
                                                {expandedGroups.has(groupName) ?
                                                    <ChevronUp className="w-4 h-4 flex-shrink-0"/> :
                                                    <ChevronDown className="w-4 h-4 flex-shrink-0"/>
                                                }
                                            </h4>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isGroupChecked(permissions)}
                                        onChange={(checked) => handleGroupToggle(groupName, checked)}
                                    />
                                </div>

                                {/* Permissions List */}
                                {expandedGroups.has(groupName) && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {permissions.map((permission) => (
                                            <div key={permission.permissionId}
                                                 className="flex items-center justify-between p-4
                                                          hover:bg-gray-50 dark:hover:bg-gray-800/50
                                                          transition-colors duration-200">
                                                <div className="pr-4 flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                        {permission.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                        {permission.description}
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={selectedPermissions.has(permission.permissionId)}
                                                    onChange={() => onPermissionToggle(permission.permissionId)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fixed Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
                <div className="p-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalElements={filteredTotal}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        showFirstLast={true}
                        showPageSize={true}
                        showTotal={true}
                    />
                </div>

                <div className="flex justify-between items-center px-6 py-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="group p-2 rounded-xl transition-all duration-200 ease-in-out
                            hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <ArrowLeft className="text-primary w-6 h-6 transition-transform duration-200
                            ease-in-out group-hover:-translate-x-1" />
                    </button>

                    <button
                        onClick={onSubmit}
                        disabled={isLoading || selectedPermissions.size === 0}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium
                                 text-white bg-primary hover:bg-primary/90 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-offset-2
                                 focus:ring-primary disabled:opacity-50 transition-all duration-200"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2"/>
                                Hoàn tất
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RolePermissionsForm;