import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCategoryFinder, useCategories} from '@/hooks/categoryHooks.tsx';
import type {CategoryResponse, CategoryUpdateRequest} from '@/types';
import toast from 'react-hot-toast';
import {motion, AnimatePresence} from 'framer-motion';
import {modalAnimationVariants} from '@/constants/animationVariants.tsx';
import CategoryEditHeader from './CategoryEditHeader.tsx';
import CategoryEditTabs, {CategoryEditTabType} from './CategoryEditTabs.tsx';
import CategoryEditContent from './CategoryEditContent.tsx';
import CategoryEditLoading from './CategoryEditLoading.tsx';

interface CategoryEditPopupProps {
    categoryId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onSubcategoryUpdate: (parentCategoryId: number) => Promise<void>;
}

const CategoryEditPopup = ({
                               categoryId,
                               isOpen,
                               onClose,
                               onUpdate,
                               onSubcategoryUpdate
                           }: CategoryEditPopupProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<CategoryEditTabType>('general');
    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const {updateParentCategory, isLoading: isUpdating} = useCategories();
    const {
        fetchCategoryById,
        isLoading: isFetching,
        foundById: fetchedCategory
    } = useCategoryFinder(categoryId || undefined);

    const isLoading = isUpdating || isFetching;

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen && categoryId && isInitialLoad) {
            const loadCategory = async () => {
                try {
                    await fetchCategoryById(categoryId);
                    // Update subcategory counts when category is loaded
                    await onSubcategoryUpdate(categoryId);
                } catch (error) {
                    console.error('Error loading category:', error);
                    toast.error('Đã xảy ra lỗi khi tải thông tin danh mục');
                    onClose();
                }
            };
            loadCategory();
            setIsInitialLoad(false);
        }

        if (!isOpen) {
            setIsInitialLoad(true);
            setCategory(null);
            setActiveTab('general');
        }
    }, [isOpen, categoryId, fetchCategoryById, onClose, isInitialLoad, onSubcategoryUpdate]);

    useEffect(() => {
        if (fetchedCategory) {
            setCategory(fetchedCategory);
        }
    }, [fetchedCategory]);

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

    const handleRefresh = async () => {
        if (!categoryId) return;

        setIsRefreshing(true);
        const toastId = toast.loading('Đang làm mới dữ liệu...');

        try {
            await fetchCategoryById(categoryId);
            // Update subcategory counts after refresh
            await onSubcategoryUpdate(categoryId);
            toast.success('Đã làm mới dữ liệu thành công', {id: toastId});
        } catch (error) {
            console.error('Error refreshing category data:', error);
            toast.error('Không thể làm mới dữ liệu danh mục', {id: toastId});
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleSubmit = async (data: CategoryUpdateRequest) => {
        if (!categoryId) {
            toast.error('ID danh mục không hợp lệ');
            return;
        }

        const toastId = toast.loading('Đang cập nhật...');

        try {
            const success = await updateParentCategory(categoryId, data);
            if (success) {
                // Update subcategory counts after successful update
                await onSubcategoryUpdate(categoryId);
                toast.success('Cập nhật danh mục thành công', {id: toastId});
                onUpdate();
                handleClose();
            } else {
                toast.error('Không thể cập nhật danh mục', {id: toastId});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage, {id: toastId});
            console.error('Lỗi khi cập nhật danh mục:', error);
        }
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
            navigate('/admin/categories/list');
        }, 300);
    }, [onClose, navigate]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
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
                            <motion.div variants={modalAnimationVariants.content}>
                                <CategoryEditHeader
                                    onClose={handleClose}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            <motion.div variants={modalAnimationVariants.content}>
                                <CategoryEditTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    isMobileView={isMobileView}
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
                                            <CategoryEditLoading/>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={activeTab}
                                            className="min-h-[400px]"
                                            variants={modalAnimationVariants.tabContent}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <CategoryEditContent
                                                activeTab={activeTab}
                                                category={category}
                                                onSubmit={handleSubmit}
                                                isLoading={isLoading}
                                                onSubcategoryUpdate={onSubcategoryUpdate}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CategoryEditPopup;