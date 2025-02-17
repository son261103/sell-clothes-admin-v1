//RoleAddTabs.tsx
import React from 'react';
import { Info, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RoleAddTabType = 'info' | 'permissions';

interface RoleAddTabDefinition {
    id: RoleAddTabType;
    label: string;
    icon: LucideIcon;
}

interface RoleAddTabsProps {
    activeTab: RoleAddTabType;
    isInfoCompleted: boolean;
    isMobileView: boolean;
}

export const ROLE_ADD_TABS: RoleAddTabDefinition[] = [
    {
        id: 'info',
        label: 'Thông tin',
        icon: Info,
    },
    {
        id: 'permissions',
        label: 'Phân quyền',
        icon: Shield,
    }
];

export const RoleAddTabs: React.FC<RoleAddTabsProps> = ({
                                                            activeTab,
                                                            isInfoCompleted,
                                                            isMobileView
                                                        }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                {ROLE_ADD_TABS.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isCompleted = tab.id === 'info' ? isInfoCompleted : false;

                    return (
                        <div key={tab.id} className="flex-1">
                            <div
                                className={`flex items-center justify-center gap-2 py-4 px-2
                                    ${isActive ? 'bg-primary/25' : ''}
                                    ${index === 0 ? 'rounded-tl-xl' : ''}
                                    ${index === ROLE_ADD_TABS.length - 1 ? 'rounded-tr-xl' : ''}`}
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