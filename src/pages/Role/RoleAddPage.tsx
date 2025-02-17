import React, { useState, useCallback, useEffect } from 'react';
import { RoleAddTabs, type RoleAddTabType } from '../../components/role/RoleAddTabs.tsx';
import { RoleInfoForm } from '../../components/role/RoleInfoForm';
import { RolePermissionsForm } from '../../components/role/RolePermissionsForm';
import { usePermissions } from '../../hooks/permissionHooks';
import { useRoles } from '../../hooks/roleHooks';
import Loading from '../../components/common/Loading.tsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.tsx';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { RoleCreateRequest } from '../../types';
import { CircleArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationError {
    [key: string]: string;
}

const RoleAddPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<RoleAddTabType>('info');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isInfoCompleted, setIsInfoCompleted] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [validationErrors, setValidationErrors] = useState<ValidationError>({});

    // Hooks
    const { permissionsPage, fetchAllPermissions, isLoading: isLoadingPermissions } = usePermissions();
    const { createRole, isLoading: isCreatingRole } = useRoles();

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch permissions when component mounts
    useEffect(() => {
        const loadPermissions = async () => {
            await fetchAllPermissions({ page: 0, size: 100, sort: 'permissionId' });
        };
        loadPermissions();
    }, [fetchAllPermissions]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setValidationErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    // Validate role info
    const validateInfo = (): boolean => {
        const errors: ValidationError = {};

        if (!formData.name.trim()) {
            errors.name = 'Tên vai trò không được để trống';
        } else if (formData.name.length < 3) {
            errors.name = 'Tên vai trò phải có ít nhất 3 ký tự';
        }

        if (!formData.description.trim()) {
            errors.description = 'Mô tả không được để trống';
        } else if (formData.description.length < 10) {
            errors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle next tab
    const handleNextTab = useCallback(() => {
        if (validateInfo()) {
            setIsInfoCompleted(true);
            setActiveTab('permissions');
        }
    }, [formData]);

    // Handle back
    const handleBack = useCallback(() => {
        setActiveTab('info');
    }, []);

    // Handle permission toggle
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
    }, []);

    // Handle form submission
    const handleSubmit = async () => {
        // Validate basic info
        if (!validateInfo()) {
            toast.error('Vui lòng kiểm tra lại thông tin vai trò');
            return;
        }

        // Validate permissions selection
        if (selectedPermissions.size === 0) {
            toast.error('Vui lòng chọn ít nhất một quyền cho vai trò');
            return;
        }

        // Get available permissions from the page content
        const availablePermissions = permissionsPage?.content || [];
        const availablePermissionIds = new Set(
            availablePermissions.map(permission => permission.permissionId)
        );

        // Validate selected permissions
        const selectedPermissionArray = Array.from(selectedPermissions);
        const invalidPermissions = selectedPermissionArray.filter(
            id => !availablePermissionIds.has(id)
        );

        if (invalidPermissions.length > 0) {
            console.error('Invalid permissions:', {
                selected: selectedPermissionArray,
                available: Array.from(availablePermissionIds),
                invalid: invalidPermissions
            });
            toast.error('Một số quyền được chọn không hợp lệ. Vui lòng thử lại');
            return;
        }

        try {
            setIsSubmitting(true);
            const toastId = toast.loading('Đang tạo vai trò mới...');

            // Create role data with validated permissions
            const roleData: RoleCreateRequest = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                permissions: selectedPermissionArray
            };

            // Debug logging
            console.log('Creating role:', {
                roleData,
                availablePermissions: availablePermissions.map(p => ({
                    id: p.permissionId,
                    name: p.name
                })),
                selectedPermissions: selectedPermissionArray
            });

            const result = await createRole(roleData);

            if (result && result.roleId) {
                toast.success('Tạo vai trò mới thành công', { id: toastId });
                navigate('/admin/access-control/roles/list');
            } else {
                toast.error('Không thể tạo vai trò. Vui lòng thử lại', { id: toastId });
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn khi tạo vai trò';
            toast.error(errorMessage);
            console.error('Error creating role:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.description || selectedPermissions.size > 0) {
            setShowConfirmModal(true);
        } else {
            navigate('/admin/access-control/roles/list');
        }
    }, [navigate, formData, selectedPermissions]);

    const isLoading = isLoadingPermissions || isCreatingRole || isSubmitting;

    if (isLoadingPermissions) {
        return <Loading fullScreen message="Đang tải thông tin..." />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div data-aos="fade-down">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors"
                            aria-label="Quay lại"
                        >
                            <CircleArrowLeft className="w-6 h-6"/>
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Thêm vai trò mới
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Điền thông tin để tạo vai trò mới
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative" data-aos="fade-up" data-aos-delay="300">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                    <RoleAddTabs
                        activeTab={activeTab}
                        isInfoCompleted={isInfoCompleted}
                        isMobileView={isMobileView}
                    />

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'info' ? (
                                    <RoleInfoForm
                                        formData={formData}
                                        validationErrors={validationErrors}
                                        isLoading={isLoading}
                                        onInputChange={handleInputChange}
                                        onNext={handleNextTab}
                                    />
                                ) : (
                                    <RolePermissionsForm
                                        permissions={permissionsPage?.content || []}
                                        selectedPermissions={selectedPermissions}
                                        isLoading={isLoading}
                                        onPermissionToggle={handlePermissionToggle}
                                        onBack={handleBack}
                                        onSubmit={handleSubmit}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Cancellation */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => navigate('/roles')}
                title="Xác nhận hủy"
                message="Bạn có chắc chắn muốn hủy? Tất cả thông tin đã nhập sẽ bị mất."
                confirmText="Xác nhận"
                cancelText="Tiếp tục chỉnh sửa"
            />

            {/* Loading Overlay */}
            {isCreatingRole && (
                <Loading fullScreen message="Đang tạo vai trò mới..." />
            )}
        </div>
    );
};

export default RoleAddPage;