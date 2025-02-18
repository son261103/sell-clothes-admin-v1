import {UserCircle, CreditCard, KeyRound, Bell, LucideIcon, Shield} from 'lucide-react';

type UserEditTabType = 'profile' | 'billing' | 'password' | 'notifications' | 'permissions';

interface UserEditTabDefinition {
    id: UserEditTabType;
    label: string;
    icon: LucideIcon;
}

const USER_EDIT_TABS: UserEditTabDefinition[] = [
    {id: 'profile', label: 'Hồ sơ', icon: UserCircle},
    {id: 'permissions', label: 'Phân quyền', icon: Shield},
    {id: 'billing', label: 'Thanh toán', icon: CreditCard},
    {id: 'password', label: 'Mật khẩu', icon: KeyRound},
    {id: 'notifications', label: 'Thông báo', icon: Bell}
];

interface UserEditTabsProps {
    activeTab: UserEditTabType;
    onTabChange: (tab: UserEditTabType) => void;
    isMobileView: boolean;
}

const UserEditTabs = ({activeTab, onTabChange, isMobileView}: UserEditTabsProps) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 p-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {USER_EDIT_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
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
);

export default UserEditTabs;
export type {UserEditTabType};