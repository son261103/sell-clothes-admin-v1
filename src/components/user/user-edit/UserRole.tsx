import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Save } from 'lucide-react';
import { useRoles } from '../../../hooks/roleHooks';
import { useUserRoleOperations, useRoleError } from '../../../hooks/userHooks';
import type { RoleResponse, UserResponse } from '../../../types';
import toast from 'react-hot-toast';

interface UserRoleProps {
    user: UserResponse;
    onUpdateRoles: (roles: RoleResponse[]) => Promise<void>;
    isLoading: boolean;
}

const UserRole = ({ user }: UserRoleProps) => {
    const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
    const [originalRole, setOriginalRole] = useState<RoleResponse | null>(null);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Custom hooks
    const { rolesList, fetchAllRoles, isLoading: isRolesLoading } = useRoles();
    const {
        isLoading: isOperationLoading,
        updateRoles,
        error: operationError
    } = useUserRoleOperations(user?.userId);
    const { error: roleError, clearError } = useRoleError();

    // Initialize role when component mounts or user changes
    useEffect(() => {
        if (user?.roles && user.roles.length > 0) {
            setSelectedRole(user.roles[0]);
            setOriginalRole(user.roles[0]);
        }
    }, [user]);

    // Load all available roles on component mount
    useEffect(() => {
        const loadRoles = async () => {
            try {
                await fetchAllRoles();
            } catch (error) {
                toast.error('Không thể tải danh sách quyền');
                console.error('Failed to load roles:', error);
            }
        };
        loadRoles();
    }, [fetchAllRoles]);

    // Track changes in role selection
    useEffect(() => {
        const hasRoleChanged = selectedRole?.roleId !== originalRole?.roleId;
        setHasChanges(hasRoleChanged);
    }, [selectedRole, originalRole]);

    // Handle errors
    useEffect(() => {
        if (operationError || roleError) {
            toast.error(operationError || roleError || 'Đã xảy ra lỗi');
            clearError();
        }
    }, [operationError, roleError, clearError]);

    const handleRoleSelect = useCallback((role: RoleResponse) => {
        setSelectedRole(role);
    }, []);

    const handleSave = useCallback(() => {
        setShowConfirmation(true);
    }, []);

    const confirmSave = useCallback(async () => {
        if (!selectedRole) return;

        try {
            const roleIds = new Set([selectedRole.roleId]);
            const success = await updateRoles(roleIds);

            if (success) {
                setOriginalRole(selectedRole);
                setShowConfirmation(false);
                setShowRoleSelector(false);
                toast.success('Cập nhật quyền thành công');
            } else {
                throw new Error('Failed to update roles');
            }
        } catch (error) {
            toast.error('Không thể cập nhật quyền');
            console.error('Failed to update roles:', error);
            setSelectedRole(originalRole);
        }
    }, [selectedRole, originalRole, updateRoles]);

    const cancelChanges = useCallback(() => {
        setSelectedRole(originalRole);
        setShowRoleSelector(false);
        setHasChanges(false);
        toast.success('Đã hoàn tác thay đổi');
    }, [originalRole]);

    const isDisabled = isOperationLoading || isRolesLoading;

    if (isRolesLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="text-secondary dark:text-highlight">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Save/Cancel buttons */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-textDark dark:text-textLight flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary"/>
                    Quản lý quyền người dùng
                </h3>
                {hasChanges && (
                    <div className="flex gap-4">
                        <button
                            onClick={cancelChanges}
                            className="px-4 py-2 text-sm font-medium text-gray bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md  focus:outline-none focus:ring-2 focus:ring-primary/40"
                            disabled={isDisabled}
                        >
                            Hoàn tác
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDisabled}
                        >
                            <Save className="w-4 h-4"/>
                            Lưu thay đổi
                        </button>
                    </div>
                )}
            </div>

            {/* Role Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-textDark dark:text-textLight">
                        Quyền người dùng hiện tại
                    </h4>
                    <button
                        onClick={() => setShowRoleSelector(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled}
                    >
                        <Plus className="w-4 h-4"/>
                        {showRoleSelector ? 'Đóng' : 'Thay đổi quyền'}
                    </button>
                </div>

                {/* Current Role Display */}
                {!showRoleSelector && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                        {!selectedRole ? (
                            <div className="text-center text-secondary dark:text-highlight py-4">
                                Người dùng chưa có quyền
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg border border-primary bg-primary/5 dark:bg-primary/10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-textDark dark:text-textLight">
                                            {selectedRole.name}
                                        </h4>
                                        <p className="text-sm text-secondary dark:text-highlight mt-1">
                                            {selectedRole.description || 'Không có mô tả'}
                                        </p>
                                    </div>
                                    <div className="text-primary">
                                        <Shield className="w-5 h-5"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Role Selector */}
                {showRoleSelector && (
                    <div className="space-y-4">
                        <p className="text-sm text-secondary dark:text-highlight mb-4">
                            Chọn một quyền cho người dùng:
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            {rolesList.map(role => {
                                const isSelected = selectedRole?.roleId === role.roleId;
                                return (
                                    <button
                                        key={role.roleId}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`text-left p-4 rounded-lg border ${
                                            isSelected
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                                        } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                        disabled={isDisabled}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-textDark dark:text-textLight">
                                                    {role.name}
                                                </h4>
                                                <p className="text-sm text-secondary dark:text-highlight mt-1">
                                                    {role.description || 'Không có mô tả'}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="text-primary">
                                                    <Shield className="w-5 h-5"/>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Xác nhận thay đổi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn có chắc chắn muốn thay đổi quyền của người dùng này thành "{selectedRole?.name}"?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRole;