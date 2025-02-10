// UserEditPopup.tsx
import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useUsers, useUserFinder} from '../../../hooks/userHooks.tsx';
import type {UserResponse, UserUpdateRequest} from '../../../types';
import toast from 'react-hot-toast';
import {motion, AnimatePresence} from 'framer-motion';
import {modalAnimationVariants} from '../../../constants/animationVariants.tsx';
import UserEditHeader from './UserEditHeader.tsx';
import UserEditTabs, {UserEditTabType} from './UserEditTabs.tsx';
import UserEditContent from './UserEditContent.tsx';
import UserEditLoading from './UserEditLoading.tsx';

interface UserEditPopupProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const UserEditPopup = ({userId, isOpen, onClose, onUpdate}: UserEditPopupProps) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<UserEditTabType>('profile');
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const {updateUser, isLoading: isUpdating} = useUsers();
    const {
        fetchUserById,
        isLoading: isFetching,
        foundById: fetchedUser
    } = useUserFinder(userId || undefined);

    const isLoading = isUpdating || isFetching;

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen && userId && isInitialLoad) {
            const loadUser = async () => {
                try {
                    await fetchUserById(userId);
                } catch (error) {
                    console.error('Error loading user:', error);
                    toast.error('Đã xảy ra lỗi khi tải thông tin người dùng');
                    onClose();
                }
            };
            loadUser();
            setIsInitialLoad(false);
        }

        if (!isOpen) {
            setIsInitialLoad(true);
            setUser(null);
            setActiveTab('profile');
        }
    }, [isOpen, userId, fetchUserById, onClose, isInitialLoad]);

    useEffect(() => {
        if (fetchedUser) {
            setUser(fetchedUser);
        }
    }, [fetchedUser]);

    const handleRefresh = async () => {
        if (!userId) return;

        setIsRefreshing(true);
        const toastId = toast.loading('Đang làm mới dữ liệu...');

        try {
            await fetchUserById(userId);
            toast.success('Đã làm mới dữ liệu thành công', {id: toastId});
        } catch (error) {
            console.error('Error refreshing user data:', error);
            toast.error('Không thể làm mới dữ liệu người dùng', {id: toastId});
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleSubmit = async (data: UserUpdateRequest) => {
        if (!userId) {
            toast.error('ID người dùng không hợp lệ');
            return;
        }

        const toastId = toast.loading('Đang cập nhật...');

        try {
            const success = await updateUser(userId, data);
            if (success) {
                toast.success('Cập nhật người dùng thành công', {id: toastId});
                onUpdate();
                handleClose();
            } else {
                toast.error('Không thể cập nhật người dùng', {id: toastId});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
            toast.error(errorMessage, {id: toastId});
            console.error('Lỗi khi cập nhật người dùng:', error);
        }
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        // Delay to allow exit animation to complete
        setTimeout(() => {
            setIsClosing(false);
            onClose();
            navigate('/admin/users/list');
        }, 300);
    }, [onClose, navigate]);

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
                        onClick={handleClose}
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className="bg-white dark:bg-secondary rounded-xl shadow-xl w-full max-w-3xl pointer-events-auto"
                            variants={modalAnimationVariants.modal}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div variants={modalAnimationVariants.content}>
                                <UserEditHeader
                                    onClose={handleClose}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                    isMobileView={isMobileView}
                                />
                            </motion.div>

                            <motion.div variants={modalAnimationVariants.content}>
                                <UserEditTabs
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
                                            <UserEditLoading/>
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
                                            <UserEditContent
                                                activeTab={activeTab}
                                                user={user}
                                                onSubmit={handleSubmit}
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

export default UserEditPopup;