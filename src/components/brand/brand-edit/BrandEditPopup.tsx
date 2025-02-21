import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useBrands, useCurrentBrand} from '@/hooks/brandHooks';
import {useBrandLogo} from '@/hooks/brandLogoHooks';
import type { BrandUpdateRequest} from '@/types';
import toast from 'react-hot-toast';
import {motion, AnimatePresence} from 'framer-motion';
import {modalAnimationVariants} from '@/constants/animationVariants';
import BrandEditHeader from './BrandEditHeader';
import BrandEditTabs, {BrandEditTabType} from './BrandEditTabs';
import BrandEditContent from './BrandEditContent';
import BrandEditLoading from './BrandEditLoading';

interface BrandEditPopupProps {
    brandId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const BrandEditPopup = ({brandId, isOpen, onClose, onUpdate}: BrandEditPopupProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<BrandEditTabType>('info');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [logoUpdateError, setLogoUpdateError] = useState<string | null>(null);

    // Hooks
    const {updateBrand} = useBrands();
    const {
        currentBrand: brand,
        brandById,
        isLoading: isLoadingBrand,
        fetchBrandById,
        clearCurrentBrand
    } = useCurrentBrand(brandId || undefined); // Convert null to undefined

    const {
        uploadLogo,
        updateLogo,
        deleteLogo,
        isLoading: isLogoUpdating,
        error: logoError
    } = useBrandLogo();

    const isLoading = isLoadingBrand || isLogoUpdating;

    // Handle logo error
    useEffect(() => {
        if (logoError) {
            setLogoUpdateError(logoError);
        } else {
            setLogoUpdateError(null);
        }
    }, [logoError]);

    // Mobile view detection
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load brand data
    useEffect(() => {
        if (isOpen && brandId && isInitialLoad) {
            const loadBrand = async () => {
                try {
                    const success = await fetchBrandById(brandId);
                    if (!success) {
                        toast.error('Không thể tải thông tin thương hiệu');
                        onClose();
                    }
                } catch (error) {
                    console.error('Error loading brand:', error);
                    toast.error('Đã xảy ra lỗi khi tải thông tin thương hiệu');
                    onClose();
                }
            };
            loadBrand();
            setIsInitialLoad(false);
        }

        if (!isOpen) {
            setIsInitialLoad(true);
            clearCurrentBrand();
            setActiveTab('info');
        }
    }, [isOpen, brandId, fetchBrandById, clearCurrentBrand, onClose, isInitialLoad]);

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
        if (!brandId) return;

        setIsRefreshing(true);
        const toastId = toast.loading('Đang làm mới dữ liệu...');

        try {
            const success = await fetchBrandById(brandId);
            if (success) {
                toast.success('Đã làm mới dữ liệu thành công', {id: toastId});
            } else {
                toast.error('Không thể làm mới dữ liệu thương hiệu', {id: toastId});
            }
        } catch (error) {
            console.error('Error refreshing brand data:', error);
            toast.error('Không thể làm mới dữ liệu thương hiệu', {id: toastId});
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleSubmit = async (data: BrandUpdateRequest, logoFile?: File) => {
        if (!brandId) {
            toast.error('ID thương hiệu không hợp lệ');
            return;
        }

        const toastId = toast.loading('Đang cập nhật...');
        setLogoUpdateError(null);

        try {
            // First update the brand data
            const success = await updateBrand(brandId, data);
            if (!success) {
                toast.error('Không thể cập nhật thông tin thương hiệu', {id: toastId});
                return;
            }

            // Then handle logo update separately if there's a new file
            let logoUpdateSuccess = true;
            if (logoFile) {
                try {
                    if (brand?.logoUrl) {
                        // Update existing logo - QUAN TRỌNG: Truyền thêm brandId
                        logoUpdateSuccess = await updateLogo(logoFile, brand.logoUrl, brandId);
                    } else {
                        // Upload new logo - QUAN TRỌNG: Truyền thêm brandId
                        logoUpdateSuccess = await uploadLogo(logoFile, brandId);
                    }

                    if (!logoUpdateSuccess) {
                        setLogoUpdateError('Không thể cập nhật logo');
                    }
                } catch (error) {
                    console.error('Error handling logo:', error);
                    logoUpdateSuccess = false;
                    setLogoUpdateError('Lỗi xử lý logo: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
                }
            }

            // Refresh brand data regardless of logo update success
            await fetchBrandById(brandId);

            if (logoUpdateSuccess) {
                toast.success('Cập nhật thương hiệu thành công', {id: toastId});
                onUpdate();
                handleClose();
            } else {
                toast.error('Cập nhật thương hiệu thành công nhưng không thể cập nhật logo', {id: toastId});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage, {id: toastId});
            console.error('Lỗi khi cập nhật thương hiệu:', error);
        }
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            clearCurrentBrand();
            onClose();
            navigate('/admin/brands/list');
        }, 300);
    }, [onClose, navigate, clearCurrentBrand]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
    };

    const handleDeleteLogo = async (logoUrl: string): Promise<void> => {
        if (!logoUrl || !brandId) {
            toast.error('Thông tin không hợp lệ');
            return;
        }

        const toastId = toast.loading('Đang xóa logo...');
        setLogoUpdateError(null);

        try {
            // QUAN TRỌNG: Truyền thêm brandId khi xóa logo
            const success = await deleteLogo(logoUrl, brandId);

            if (success) {
                toast.success('Xóa logo thành công', {id: toastId});
                // Refresh brand data to reflect the logo deletion
                await fetchBrandById(brandId);
            } else {
                toast.error('Không thể xóa logo', {id: toastId});
                setLogoUpdateError('Không thể xóa logo');
            }
        } catch (error) {
            console.error('Error deleting logo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            toast.error(`Không thể xóa logo: ${errorMessage}`, {id: toastId});
            setLogoUpdateError('Lỗi xóa logo: ' + errorMessage);
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
                            <motion.div variants={modalAnimationVariants.content}>
                                <BrandEditHeader
                                    onClose={handleClose}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            <motion.div variants={modalAnimationVariants.content}>
                                <BrandEditTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            {logoUpdateError && (
                                <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                                    <strong>Lỗi:</strong> {logoUpdateError}
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
                                            <BrandEditLoading/>
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
                                            <BrandEditContent
                                                activeTab={activeTab}
                                                brand={brand || brandById}
                                                onSubmit={handleSubmit}
                                                onDeleteLogo={brand?.logoUrl ? () => handleDeleteLogo(brand.logoUrl) : undefined}
                                                isLoading={isLoading}
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

export default BrandEditPopup;