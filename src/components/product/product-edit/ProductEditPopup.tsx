import { useState, useEffect, useCallback } from 'react';
import { useProducts } from '@/hooks/productHooks';
import type { ProductUpdateRequest } from '@/types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimationVariants } from '@/constants/animationVariants';
import ProductEditHeader from './ProductEditHeader';
import ProductEditTabs, { ProductEditTabType } from './ProductEditTabs';
import ProductEditContent from './ProductEditContent';
import ProductEditLoading from './ProductEditLoading';
import {RefreshCw} from "lucide-react";

interface ProductEditPopupProps {
    productId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const ProductEditPopup = ({ productId, isOpen, onClose, onUpdate }: ProductEditPopupProps) => {
    const [activeTab, setActiveTab] = useState<ProductEditTabType>('info');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [thumbnailUpdateError, setThumbnailUpdateError] = useState<string | null>(null);

    // Hooks
    const {
        productsPage,
        isLoading,
        fetchAllProducts,
        updateProduct,
    } = useProducts();

    const currentProduct = productsPage?.content?.find(p => p.productId === productId) || null;

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load product data
    useEffect(() => {
        if (isOpen && productId && isInitialLoad) {
            const loadProduct = async () => {
                try {
                    // Sử dụng filter để tìm chính xác sản phẩm theo ID
                    const success = await fetchAllProducts(
                        { page: 0, size: 10 }, // Tăng size để đảm bảo bắt được sản phẩm
                        { productId } // Filter theo productId thay vì search
                    );

                    if (!success || !productsPage?.content?.some(p => p.productId === productId)) {
                        toast.error('Không thể tải thông tin sản phẩm');
                        onClose();
                    }
                } catch (error) {
                    console.error('Error loading product:', error);
                    toast.error('Đã xảy ra lỗi khi tải thông tin sản phẩm');
                    onClose();
                }
            };
            loadProduct();
            setIsInitialLoad(false);
        }

        if (!isOpen) {
            setIsInitialLoad(true);
            setActiveTab('info');
        }
    }, [isOpen, productId, fetchAllProducts, onClose, isInitialLoad, productsPage]);

    // Handle body scroll
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
        if (!productId) return;

        setIsRefreshing(true);
        const toastId = toast.loading('Đang làm mới dữ liệu...');

        try {
            const success = await fetchAllProducts(
                { page: 0, size: 10 },
                { productId } // Filter theo productId thay vì search
            );

            if (success) {
                toast.success('Đã làm mới dữ liệu thành công', { id: toastId });
            } else {
                toast.error('Không thể làm mới dữ liệu sản phẩm', { id: toastId });
            }
        } catch (error) {
            console.error('Error refreshing product data:', error);
            toast.error('Không thể làm mới dữ liệu sản phẩm', { id: toastId });
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleSubmit = async (data: ProductUpdateRequest, thumbnailFile?: File) => {
        if (!productId) {
            toast.error('ID sản phẩm không hợp lệ');
            return;
        }

        const toastId = toast.loading('Đang cập nhật...');
        setThumbnailUpdateError(null);

        try {
            const success = await updateProduct(productId, data, thumbnailFile);

            if (success) {
                toast.success('Cập nhật sản phẩm thành công', { id: toastId });
                onUpdate();
                handleClose();
            } else {
                toast.error('Không thể cập nhật sản phẩm', { id: toastId });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage, { id: toastId });
            console.error('Lỗi khi cập nhật sản phẩm:', error);
        }
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
            // Bỏ dòng navigate để tránh mất dữ liệu khi đóng popup
        }, 300);
    }, [onClose]);

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
                                <ProductEditHeader
                                    onClose={handleClose}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            <motion.div variants={modalAnimationVariants.content}>
                                <ProductEditTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            {thumbnailUpdateError && (
                                <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                                    <strong>Lỗi:</strong> {thumbnailUpdateError}
                                </div>
                            )}

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
                                            <ProductEditLoading />
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
                                            {currentProduct ? (
                                                <ProductEditContent
                                                    activeTab={activeTab}
                                                    product={currentProduct}
                                                    onSubmit={handleSubmit}
                                                    isLoading={isLoading}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-64">
                                                    <div className="text-center">
                                                        <p className="text-lg text-gray-600 dark:text-gray-400">
                                                            Không tìm thấy thông tin sản phẩm
                                                        </p>
                                                        <button
                                                            onClick={handleRefresh}
                                                            className="mt-4 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-2 mx-auto"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                            Thử lại
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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

export default ProductEditPopup;