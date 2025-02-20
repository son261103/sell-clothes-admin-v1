import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryHierarchyTab from './CategoryHierarchyTab';
import type { CategoryResponse, CategoryUpdateRequest } from '@/types';

interface CategoryHierarchyModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: CategoryResponse;
    onSubmit: (data: CategoryUpdateRequest) => Promise<void>;
    onSubcategoryUpdate: (parentCategoryId: number) => Promise<void>;
}

const modalAnimationVariants = {
    overlay: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    },
    modal: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    },
    content: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    }
};

const CategoryHierarchyModal: React.FC<CategoryHierarchyModalProps> = ({
                                                                           isOpen,
                                                                           onClose,
                                                                           category,
                                                                           onSubmit,
                                                                           onSubcategoryUpdate
                                                                       }) => {
    const [isClosing, setIsClosing] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = React.useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
    };

    const handleHierarchyUpdate = async (data: CategoryUpdateRequest) => {
        try {
            await onSubmit(data);
            if (category.categoryId) {
                await onSubcategoryUpdate(category.categoryId);
            }
        } catch (error) {
            console.error('Error updating hierarchy:', error);
            throw error;
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <AnimatePresence mode="wait">
            {(isOpen || isClosing) && (
                <div className="fixed inset-0 z-50">
                    <motion.div
                        className="fixed inset-0 bg-black/50"
                        variants={modalAnimationVariants.overlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleOverlayClick}
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className="bg-white dark:bg-secondary rounded-xl shadow-xl w-full max-w-3xl pointer-events-auto"
                            variants={modalAnimationVariants.modal}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                variants={modalAnimationVariants.content}
                                className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Quản lý danh mục con - {category.name}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>

                            <motion.div
                                variants={modalAnimationVariants.content}
                                className="p-6 relative overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                            >
                                <CategoryHierarchyTab
                                    parentCategory={category}
                                    onSubmit={handleHierarchyUpdate}
                                    onSubcategoryUpdate={onSubcategoryUpdate}
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CategoryHierarchyModal;