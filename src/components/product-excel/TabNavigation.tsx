import React from 'react';
import { FileDown, FileUp, Tag } from 'lucide-react';
import { TabNavigationProps } from './types';

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
                <button
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${
                        activeTab === 'import'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('import')}
                >
                    <FileUp className="h-4 w-4" />
                    Nhập Excel
                </button>
                <button
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${
                        activeTab === 'export'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('export')}
                >
                    <FileDown className="h-4 w-4" />
                    Xuất Excel
                </button>
                <button
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${
                        activeTab === 'bulk-sku'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('bulk-sku')}
                >
                    <Tag className="h-4 w-4" />
                    Tạo mã SKU
                </button>
            </nav>
        </div>
    );
};

export default TabNavigation;