import React from 'react';
import type {CategoryResponse, CategoryUpdateRequest} from '@/types';
import type {CategoryEditTabType} from './CategoryEditTabs';
import CategoryGeneralForm from './CategoryGeneralForm';
import {CategoryEmptyState} from './CategoryEmptyState';
import CategorySeoTab from "@/components/category/category-edit/CategorySeoTab";

interface CategoryEditContentProps {
    activeTab: CategoryEditTabType;
    category: CategoryResponse | null;
    isLoading: boolean;
    onSubmit: (data: CategoryUpdateRequest) => Promise<void>;
    onSubcategoryUpdate: (parentCategoryId: number) => Promise<void>;
}

const CategoryEditContent: React.FC<CategoryEditContentProps> = ({
                                                                     activeTab,
                                                                     category,
                                                                     onSubmit,
                                                                     isLoading,

                                                                 }) => {
    if (!category) {
        return <CategoryEmptyState/>;
    }

    switch (activeTab) {
        case 'general':
            return (
                <CategoryGeneralForm
                    category={category}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            );
        case 'seo':
            return <CategorySeoTab/>;
        default:
            return null;
    }
};

export default CategoryEditContent;