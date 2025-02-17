import React, { useState, useEffect } from 'react';
import { Box, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';
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

// Switch Component
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

const RoleEditContent: React.FC<RoleEditContentProps> = ({
                                                             role,
                                                             onUpdate,
                                                             setHasUnsavedChanges,
                                                             isCompact
                                                         }) => {
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const { updateRolePermissions, error: updateError } = useRolePermissionOperations();
    const { permissionsPage, fetchAllPermissions, error: fetchError } = usePermissions();

    const totalElements = permissionsPage?.totalElements || 0;
    const totalPages = Math.ceil(totalElements / pageSize);

    // Fetch permissions when page or pageSize changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pageRequest: PageRequest = {
                    page: currentPage,
                    size: pageSize,
                    sort: 'permissionId'
                };
                await fetchAllPermissions(pageRequest);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, pageSize, fetchAllPermissions]);

    // Update grouped permissions when permissions data changes
    useEffect(() => {
        if (permissionsPage?.content && role) {
            const initialPermissions = new Set(role.permissions.map(p => p.permissionId));
            setSelectedPermissions(initialPermissions);
            setHasUnsavedChanges(false);

            const grouped = permissionsPage.content.reduce((acc, permission) => {
                const group = permission.groupName;
                if (!acc[group]) {
                    acc[group] = {
                        permissions: [],
                        isExpanded: true
                    };
                }
                acc[group].permissions.push(permission);
                return acc;
            }, {} as GroupedPermissions);

            // Sort permissions within each group
            Object.keys(grouped).forEach(groupName => {
                grouped[groupName].permissions.sort((a, b) => a.name.localeCompare(b.name));
            });

            setGroupedPermissions(grouped);
        }
    }, [permissionsPage?.content, role, setHasUnsavedChanges]);

    const toggleGroupExpansion = (groupName: string) => {
        setGroupedPermissions(prev => ({
            ...prev,
            [groupName]: {
                ...prev[groupName],
                isExpanded: !prev[groupName].isExpanded
            }
        }));
    };

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            setHasUnsavedChanges(true);
            return newSet;
        });
    };

    const handleGroupToggle = (groupName: string, checked: boolean) => {
        const groupPermissions = groupedPermissions[groupName]?.permissions || [];
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            groupPermissions.forEach(permission => {
                if (checked) {
                    newSet.add(permission.permissionId);
                } else {
                    newSet.delete(permission.permissionId);
                }
            });
            setHasUnsavedChanges(true);
            return newSet;
        });
    };

    const isGroupChecked = (permissions: PermissionResponse[]): boolean => {
        return permissions.every(permission => selectedPermissions.has(permission.permissionId));
    };

    const handleSaveConfirm = async () => {
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
    };

    const error = updateError || fetchError;

    if (loading) {
        return <Loading message="Đang tải danh sách quyền..." />;
    }

    return (
        <div className="space-y-4">
            {/* Permissions Groups */}
            {Object.entries(groupedPermissions).map(([groupName, group]) => (
                <div
                    key={groupName}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl
                             overflow-hidden hover:border-primary/20 transition-colors duration-200"
                >
                    {/* Group Header */}
                    <div
                        onClick={() => toggleGroupExpansion(groupName)}
                        className="flex items-center justify-between p-4
                                 bg-gray-50 dark:bg-gray-800/50 cursor-pointer
                                 hover:bg-gray-100 dark:hover:bg-gray-800
                                 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <Box className="w-5 h-5 text-primary flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="truncate">{groupName}</span>
                                    {group.isExpanded ?
                                        <ChevronUp className="w-4 h-4 flex-shrink-0"/> :
                                        <ChevronDown className="w-4 h-4 flex-shrink-0"/>
                                    }
                                </h4>
                            </div>
                        </div>
                        <Switch
                            checked={isGroupChecked(group.permissions)}
                            onChange={(checked) => handleGroupToggle(groupName, checked)}
                        />
                    </div>

                    {/* Permissions List */}
                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${group.isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
                    `}>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {group.permissions.map((permission) => (
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

            {/* Error Display */}
            {error && (
                <div className="text-red-500 text-sm flex items-center p-4
                               bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/>
                    <span>{error}</span>
                </div>
            )}

            {/* Pagination and Save Button */}
            <div className="mt-6 space-y-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalElements={totalElements}
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
                        disabled={loading || !selectedPermissions.size}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium
                                 text-white bg-primary hover:bg-primary/90 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-offset-2
                                 focus:ring-primary disabled:opacity-50
                                 transition-all duration-200"
                    >
                        <Check className="w-4 h-4 mr-2"/>
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