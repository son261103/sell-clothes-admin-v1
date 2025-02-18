import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, ChevronDown, ChevronUp, AlertCircle, Search, Save } from 'lucide-react';
import type { RoleResponse, PermissionResponse, PageRequest } from '../../types';
import { useRolePermissionOperations, usePermissions } from '../../hooks/permissionHooks';
import Pagination from '../common/Pagination';
import Loading from '../common/Loading';
import ConfirmationModal from '../common/ConfirmationModal';

interface RoleEditContentProps {
    role: RoleResponse | null;
    onUpdate: () => Promise<void>;
    setHasUnsavedChanges: (value: boolean) => void;
    isCompact: boolean;
}

interface GroupedPermissions {
    [key: string]: {
        permissions: PermissionResponse[];
        isExpanded: boolean;
    };
}

const Switch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
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
        <span className={`
            inline-block h-4 w-4 transform rounded-full 
            bg-white shadow-lg ring-0
            transition-all duration-300 ease-in-out
            ${checked ? 'translate-x-6 scale-110' : 'translate-x-1 scale-100'}
        `}
        />
    </button>
);

const SearchInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => (
    <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm kiếm quyền..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700
                     rounded-lg bg-white dark:bg-gray-800
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                     placeholder-gray-500 dark:placeholder-gray-400
                     transition-all duration-200"
        />
    </div>
);

const RoleEditContent: React.FC<RoleEditContentProps> = ({
                                                             role,
                                                             onUpdate,
                                                             setHasUnsavedChanges,
                                                             isCompact
                                                         }) => {
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);

    const { updateRolePermissions, error: updateError } = useRolePermissionOperations();
    const { permissionsPage, fetchAllPermissions, error: fetchError } = usePermissions();

    // Initialize permissions and selected state
    useEffect(() => {
        const initializeData = async () => {
            if (role) {
                setLoading(true);
                try {
                    const pageRequest: PageRequest = {
                        page: 0,
                        size: 1000,
                        sort: 'permissionId'
                    };
                    await fetchAllPermissions(pageRequest);

                    const initialSelected = new Set(role.permissions.map(p => p.permissionId));
                    setSelectedPermissions(initialSelected);
                    setHasUnsavedChanges(false);
                } catch (error) {
                    console.error('Error fetching permissions:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        initializeData();
    }, [role, fetchAllPermissions, setHasUnsavedChanges]);

    // Update allPermissions when permissionsPage changes
    useEffect(() => {
        if (permissionsPage?.content) {
            setAllPermissions(permissionsPage.content);

            const groups = new Set(permissionsPage.content.map(p => p.groupName));
            setExpandedGroups(groups);
        }
    }, [permissionsPage?.content]);

    // Filter and group permissions based on search query
    const filteredGroupedPermissions = useMemo(() => {
        const filtered = allPermissions.filter(permission => {
            const searchLower = searchQuery.toLowerCase();
            return (
                permission.name.toLowerCase().includes(searchLower) ||
                permission.description.toLowerCase().includes(searchLower) ||
                permission.groupName.toLowerCase().includes(searchLower)
            );
        });

        return filtered.reduce((acc, permission) => {
            const group = permission.groupName;
            if (!acc[group]) {
                acc[group] = {
                    permissions: [],
                    isExpanded: expandedGroups.has(group)
                };
            }
            acc[group].permissions.push(permission);

            // Sort permissions within the group
            acc[group].permissions.sort((a, b) => a.name.localeCompare(b.name));

            return acc;
        }, {} as GroupedPermissions);
    }, [allPermissions, searchQuery, expandedGroups]);

    // Calculate pagination
    const paginatedData = useMemo(() => {
        const allGroupEntries = Object.entries(filteredGroupedPermissions);
        const totalPermissions = allGroupEntries.reduce(
            (sum, [, groupData]) => sum + groupData.permissions.length,
            0
        );

        const startIdx = currentPage * pageSize;
        const endIdx = startIdx + pageSize;

        let currentCount = 0;
        const paginatedGroups: GroupedPermissions = {};

        for (const [groupName, groupData] of allGroupEntries) {
            const groupSize = groupData.permissions.length;

            if (currentCount + groupSize <= startIdx) {
                currentCount += groupSize;
                continue;
            }

            const groupStartIdx = Math.max(0, startIdx - currentCount);
            const groupEndIdx = Math.min(groupSize, endIdx - currentCount);

            if (groupStartIdx < groupSize) {
                paginatedGroups[groupName] = {
                    ...groupData,
                    permissions: groupData.permissions.slice(groupStartIdx, groupEndIdx)
                };
            }

            currentCount += groupSize;
            if (currentCount >= endIdx) break;
        }

        return {
            groups: paginatedGroups,
            totalElements: totalPermissions
        };
    }, [filteredGroupedPermissions, currentPage, pageSize]);

    const handlePermissionToggle = useCallback((permissionId: number) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
        setHasUnsavedChanges(true);
    }, [setHasUnsavedChanges]);

    const handleGroupToggle = useCallback((groupName: string, checked: boolean) => {
        const groupData = filteredGroupedPermissions[groupName];
        if (!groupData) return;

        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            groupData.permissions.forEach(permission => {
                if (checked) {
                    newSet.add(permission.permissionId);
                } else {
                    newSet.delete(permission.permissionId);
                }
            });
            return newSet;
        });
        setHasUnsavedChanges(true);
    }, [filteredGroupedPermissions, setHasUnsavedChanges]);

    const toggleGroupExpansion = useCallback((groupName: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    }, []);

    const handleSaveConfirm = useCallback(async () => {
        if (!role) return;
        setLoading(true);
        try {
            await updateRolePermissions(role.roleId, selectedPermissions);
            await onUpdate();
            setHasUnsavedChanges(false);
            setShowSaveConfirmation(false);
        } catch (err) {
            console.error('Error updating permissions:', err);
        } finally {
            setLoading(false);
        }
    }, [role, selectedPermissions, updateRolePermissions, onUpdate, setHasUnsavedChanges]);

    const isGroupChecked = useCallback((permissions: PermissionResponse[]): boolean => {
        return permissions.every(permission => selectedPermissions.has(permission.permissionId));
    }, [selectedPermissions]);

    const error = updateError || fetchError;
    const totalPages = Math.ceil(paginatedData.totalElements / pageSize);

    if (loading) {
        return <Loading message="Đang tải danh sách quyền..." />;
    }

    return (
        <div className="space-y-4">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />

            {Object.entries(paginatedData.groups).map(([groupName, groupData]) => (
                <div
                    key={groupName}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl
                             overflow-hidden hover:border-primary/20 transition-colors duration-200"
                >
                    <div
                        onClick={() => groupData.permissions.length > 0 && toggleGroupExpansion(groupName)}
                        className={`
                            flex items-center justify-between p-4
                            bg-gray-50 dark:bg-gray-800/50
                            ${groupData.permissions.length > 0 ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                            transition-colors duration-200
                        `}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <Box className="w-5 h-5 text-primary flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="truncate">{groupName}</span>
                                    {groupData.permissions.length > 0 && (
                                        expandedGroups.has(groupName) ?
                                            <ChevronUp className="w-4 h-4 flex-shrink-0"/> :
                                            <ChevronDown className="w-4 h-4 flex-shrink-0"/>
                                    )}
                                </h4>
                            </div>
                        </div>
                        {groupData.permissions.length > 0 && (
                            <Switch
                                checked={isGroupChecked(groupData.permissions)}
                                onChange={(checked) => handleGroupToggle(groupName, checked)}
                            />
                        )}
                    </div>

                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${expandedGroups.has(groupName) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
                    `}>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {groupData.permissions.map((permission) => (
                                <div
                                    key={permission.permissionId}
                                    className="flex items-center justify-between p-4
                                             hover:bg-gray-50 dark:hover:bg-gray-800/50
                                             transition-colors duration-200"
                                >
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
                                        onChange={() => handlePermissionToggle(permission.permissionId)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {Object.keys(paginatedData.groups).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Không tìm thấy quyền phù hợp' : 'Không có quyền nào'}
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm flex items-center p-4
                               bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/>
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-6 space-y-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalElements={paginatedData.totalElements}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    showFirstLast={true}
                    showPageSize={true}
                    showTotal={true}
                    compact={isCompact}
                />

                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => setShowSaveConfirmation(true)}
                        disabled={loading}
                        className={`
                            inline-flex items-center px-4 py-2 text-sm font-medium
                            text-white bg-primary rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            focus:ring-primary 
                            transition-all duration-200
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}
                        `}
                    >
                        {loading ? (
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2"/>
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            {/* Save Confirmation Modal */}
            <ConfirmationModal
                isOpen={showSaveConfirmation}
                onClose={() => setShowSaveConfirmation(false)}
                onConfirm={handleSaveConfirm}
                title="Xác nhận cập nhật quyền"
                message="Bạn có chắc chắn muốn cập nhật các quyền đã chọn cho vai trò này?"
                cancelText="Hủy"
                confirmText="Cập nhật"
            />
        </div>
    );
};

export default RoleEditContent;