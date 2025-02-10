import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {X, RefreshCw, UserCircle, CreditCard, KeyRound, Bell, LucideIcon} from 'lucide-react';
import {useUsers, useUserFinder} from '../../hooks/userHooks';
import UserForm from '../../components/user/UserForm';
import type {UserResponse, UserUpdateRequest} from '../../types';
import toast from 'react-hot-toast';

// Types and Interfaces
interface UserEditPopupProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

type TabType = 'profile' | 'billing' | 'password' | 'notifications';

interface TabDefinition {
    id: TabType;
    label: string;
    icon: LucideIcon;
}

// Component Definition
const UserEditPopup = ({userId, isOpen, onClose, onUpdate}: UserEditPopupProps) => {
    // State Management
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {updateUser, isLoading: isUpdating} = useUsers();
    const {
        fetchUserById,
        isLoading: isFetching,
        foundById: fetchedUser
    } = useUserFinder(userId || undefined);

    const isLoading = isUpdating || isFetching;

    // Constants
    const TABS: TabDefinition[] = [
        {id: 'profile', label: 'Hồ sơ', icon: UserCircle},
        {id: 'billing', label: 'Thanh toán', icon: CreditCard},
        {id: 'password', label: 'Mật khẩu', icon: KeyRound},
        {id: 'notifications', label: 'Thông báo', icon: Bell}
    ];

    // Hooks
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

    // Event Handlers
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
                onClose();
                navigate('/admin/users/list');
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
        onClose();
        navigate('/admin/users/list');
    }, [onClose, navigate]);

    // Component Render Functions
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return user ? (
                    <UserForm
                        initialData={user}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="text-center text-secondary dark:text-highlight">
                        Không tìm thấy thông tin người dùng
                    </div>
                );
            case 'password':
            case 'billing':
            case 'notifications':
                return (
                    <div className="text-center text-secondary dark:text-highlight py-8">
                        Tính năng đang được phát triển
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={handleClose}/>

            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-secondary rounded-xl shadow-xl w-full max-w-3xl pointer-events-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold text-textDark dark:text-textLight">
                                    Chỉnh sửa người dùng
                                </h3>
                            </div>
                            <p className="text-sm text-secondary dark:text-highlight mt-1">
                                Cập nhật thông tin người dùng
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 
                                text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 
                                flex items-center gap-1.5 transition-colors duration-200
                                ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    className={`h-3.5 w-3.5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                <span className={isMobileView ? 'hidden' : ''}>Làm mới</span>
                            </button>
                            <button
                                className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700
                                         text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700
                                         transition-colors duration-200"
                                onClick={handleClose}
                                aria-label="Đóng"
                            >
                                <X className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2 p-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                                                 transition-all duration-200 whitespace-nowrap
                                                 ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-secondary dark:text-highlight hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        aria-selected={isActive}
                                        role="tab"
                                    >
                                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}/>
                                        <span className={`${isMobileView ? 'hidden' : ''} transition-opacity duration-200`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[60vh]">
                                <div className="flex flex-col items-center gap-2">
                                    <RefreshCw className="w-8 h-8 text-primary animate-spin"/>
                                    <div className="text-sm text-secondary dark:text-highlight">
                                        Đang tải...
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[400px]">
                                {renderTabContent()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEditPopup;