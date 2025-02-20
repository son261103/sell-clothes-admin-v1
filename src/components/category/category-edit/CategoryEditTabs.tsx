import {FolderCog, Tag, LucideIcon} from 'lucide-react';

type CategoryEditTabType = 'general' | 'hierarchy' | 'seo';

interface CategoryEditTabDefinition {
    id: CategoryEditTabType;
    label: string;
    icon: LucideIcon;
}

const CATEGORY_EDIT_TABS: CategoryEditTabDefinition[] = [
    {id: 'general', label: 'Thông tin chung', icon: FolderCog},
    {id: 'seo', label: 'SEO & Slug', icon: Tag}
];

interface CategoryEditTabsProps {
    activeTab: CategoryEditTabType;
    onTabChange: (tab: CategoryEditTabType) => void;
    isMobileView: boolean;
}

const CategoryEditTabs = ({activeTab, onTabChange, isMobileView}: CategoryEditTabsProps) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 p-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {CATEGORY_EDIT_TABS.map(tab => {
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

export default CategoryEditTabs;
export type {CategoryEditTabType};