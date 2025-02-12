import React from 'react';
import { UserCircle, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UserAddTabType = 'profile' | 'password';

interface UserAddTabDefinition {
    id: UserAddTabType;
    label: string;
    icon: LucideIcon;
}

interface UserAddTabsProps {
    activeTab: UserAddTabType;
    isProfileCompleted: boolean;
    isMobileView: boolean;
}

export const USER_ADD_TABS: UserAddTabDefinition[] = [
    {
        id: 'profile',
        label: 'Hồ sơ',
        icon: UserCircle,
    },
    {
        id: 'password',
        label: 'Mật khẩu',
        icon: KeyRound,
    }
];

export const UserAddTabs: React.FC<UserAddTabsProps> = ({
                                                            activeTab,
                                                            isProfileCompleted,
                                                            isMobileView
                                                        }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                {USER_ADD_TABS.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isCompleted = tab.id === 'profile' ? isProfileCompleted : false;

                    return (
                        <div key={tab.id} className="flex-1">
                            <div
                                className={`flex items-center justify-center gap-2 py-4 px-2
                                    ${isActive ? 'bg-primary/25' : ''}
                                    ${index === 0 ? 'rounded-tl-xl' : ''}
                                    ${index === USER_ADD_TABS.length - 1 ? 'rounded-tr-xl' : ''}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center
                                    ${isActive ? 'bg-primary text-white' :
                                    isCompleted ? 'bg-green-300 text-white' :
                                        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                `}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`${isMobileView ? 'hidden' : ''} font-medium
                                    ${isActive ? 'text-primary' :
                                    isCompleted ? 'text-green-300' :
                                        'text-gray-500 dark:text-gray-400'}`}>
                                    {tab.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};