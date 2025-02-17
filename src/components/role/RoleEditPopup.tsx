import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimationVariants } from '../../constants/animationVariants';
import RoleEditHeader from './RoleEditHeader';
import RoleEditContent from './RoleEditContent';
import RoleEditLoading from './RoleEditLoading';
import ConfirmationModal from '../common/ConfirmationModal';
import { RoleResponse } from "../../types";
import { useRolePermissionOperations, usePermissions } from '../../hooks/permissionHooks';

interface RoleEditPopupProps {
    isOpen: boolean;
    onClose: () => void;
    role: RoleResponse | null;
    onUpdate: () => Promise<void>;
}

const RoleEditPopup: React.FC<RoleEditPopupProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         role,
                                                         onUpdate
                                                     }) => {
    const [isCompact, setIsCompact] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const { isLoading: isUpdateLoading } = useRolePermissionOperations();
    const { isLoading: isFetchLoading, fetchAllPermissions } = usePermissions();

    const isLoading = isUpdateLoading || isFetchLoading;

    // Handle resize for mobile view
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle initial load and reset
    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setHasUnsavedChanges(false);
            handleRefresh();
        }
    }, [isOpen, role]);

    const handleRefresh = async () => {
        if (!role) return;
        setIsRefreshing(true);
        try {
            await fetchAllPermissions({
                page: 0,
                size: 10,
                sort: 'permissionId'
            });
        } catch (error) {
            console.error('Error refreshing permissions:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleClose = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (hasUnsavedChanges) {
            setShowConfirmModal(true);
        } else {
            setIsClosing(true);
            setTimeout(() => {
                onClose();
                setIsClosing(false);
            }, 300);
        }
    }, [hasUnsavedChanges, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowConfirmModal(false);
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
    }, [handleClose]);

    if (!isOpen && !isClosing) return null;

    return (
        <AnimatePresence mode="wait">
            {(isOpen || isClosing) && (
                <div className="fixed inset-0 z-50">
                    {/* Semi-transparent overlay - Matched with UserEditPopup */}
                    <motion.div
                        className="fixed inset-0 bg-black/50"
                        variants={modalAnimationVariants.overlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleOverlayClick}
                    />

                    {/* Modal Container - Aligned with UserEditPopup structure */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className="bg-white dark:bg-secondary rounded-xl shadow-xl w-full max-w-3xl pointer-events-auto"
                            variants={modalAnimationVariants.modal}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div variants={modalAnimationVariants.content}>
                                <RoleEditHeader
                                    onClose={handleClose}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                    isMobileView={isMobileView}
                                    role={role}
                                    isCompact={isCompact}
                                    onToggleCompact={() => setIsCompact(!isCompact)}
                                />
                            </motion.div>

                            <motion.div
                                className="p-6 relative overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                                variants={modalAnimationVariants.content}
                            >
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            variants={modalAnimationVariants.tabContent}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <RoleEditLoading />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            variants={modalAnimationVariants.tabContent}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="min-h-[400px]"
                                        >
                                            <RoleEditContent
                                                role={role}
                                                onUpdate={onUpdate}
                                                setHasUnsavedChanges={setHasUnsavedChanges}
                                                isCompact={isCompact}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={showConfirmModal}
                        onClose={() => setShowConfirmModal(false)}
                        onConfirm={handleConfirmClose}
                        title="Xác nhận hủy thay đổi"
                        message="Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát không?"
                        cancelText="Tiếp tục chỉnh sửa"
                        confirmText="Thoát"
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default RoleEditPopup;