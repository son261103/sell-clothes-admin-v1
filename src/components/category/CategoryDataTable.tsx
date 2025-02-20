import React from 'react';
import {Link} from 'react-router-dom';
import {
    MoreVertical, Edit, Trash2, CheckCircle, XCircle,
    Folder, FolderTree, Shield, Calendar, Info, ArrowRight
} from 'lucide-react';
import type {CategoryPageResponse, CategoryResponse} from '@/types';
import Pagination from '../common/Pagination';

interface CategoryDataTableProps {
    categories: CategoryPageResponse;
    subcategoryCounts: Record<number, {
        total: number;
        active: number;
        inactive: number;
    }>;
    onDeleteCategory: (id: number) => void;
    onEditCategory: (category: CategoryResponse) => void;
    onStatusChange: (id: number) => void;
    onViewSubcategories: (category: CategoryResponse) => void;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const CategoryDataTable: React.FC<CategoryDataTableProps> = ({
                                                                 categories,
                                                                 subcategoryCounts,
                                                                 onDeleteCategory,
                                                                 onEditCategory,
                                                                 onStatusChange,
                                                                 isLoading,
                                                                 onRefresh,
                                                                 isMobileView,
                                                                 onPageChange,
                                                                 onPageSizeChange,
                                                                 onViewSubcategories,
                                                             }) => {
    const [activeDropdown, setActiveDropdown] = React.useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
    const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryResponse | null>(null);
    const [showLoading, setShowLoading] = React.useState(false);

    const handleDeleteClick = (category: CategoryResponse) => {
        setCategoryToDelete(category);
        setShowDeleteConfirmation(true);
        setActiveDropdown(null);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            onDeleteCategory(categoryToDelete.categoryId);
            setShowDeleteConfirmation(false);
            setCategoryToDelete(null);
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown !== null) {
                const dropdown = document.getElementById(`dropdown-${activeDropdown}`);
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setActiveDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    React.useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (isLoading) {
            timeoutId = setTimeout(() => setShowLoading(true), 500);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    const getStatusBadgeClass = (status: boolean) => {
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200";
        return status
            ? `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400`
            : `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
    };

    const renderSubcategoryCount = (categoryId: number) => {
        const counts = subcategoryCounts[categoryId] || {total: 0, active: 0, inactive: 0};
        if (counts.total === 0) {
            return (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Chưa có danh mục con
                </span>
            );
        }
        return (
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-green-600">
                        {counts.active} hoạt động
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-600">
                        {counts.inactive} vô hiệu
                    </span>
                </div>
            </div>
        );
    };

    const ActionButton = ({onClick, icon: Icon, color, title}: {
        onClick: () => void;
        icon: typeof Edit;
        color: string;
        title: string;
    }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 ${color} 
                transition-colors duration-200 hover:scale-105 transform`}
            title={title}
        >
            <Icon className="w-3.5 h-3.5"/>
        </button>
    );

    const renderActionButtons = (category: CategoryResponse) => (
        <div className="flex items-center gap-1.5">
            <ActionButton
                onClick={() => onViewSubcategories(category)}
                icon={FolderTree}
                color="text-primary dark:text-primary"
                title="Xem danh mục con"
            />
            <ActionButton
                onClick={() => onEditCategory(category)}
                icon={Edit}
                color="text-blue-600 dark:text-blue-400"
                title="Chỉnh sửa"
            />
            <ActionButton
                onClick={() => onStatusChange(category.categoryId)}
                icon={category.status ? XCircle : CheckCircle}
                color={category.status
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'}
                title={category.status ? 'Vô hiệu hóa' : 'Kích hoạt'}
            />
            <ActionButton
                onClick={() => handleDeleteClick(category)}
                icon={Trash2}
                color="text-red-600 dark:text-red-400"
                title="Xóa"
            />
        </div>
    );

    const renderMobileActions = (category: CategoryResponse) => (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === category.categoryId ? null : category.categoryId);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-secondary dark:text-highlight"/>
            </button>

            {activeDropdown === category.categoryId && (
                <div
                    id={`dropdown-${category.categoryId}`}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                    <Link
                        to={`/admin/categories/${category.categoryId}/subcategories`}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-primary"
                    >
                        <FolderTree className="w-4 h-4"/>
                        Quản lý danh mục con
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(category);
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Edit className="w-4 h-4"/>
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => {
                            onStatusChange(category.categoryId);
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        {category.status ? (
                            <>
                                <XCircle className="w-4 h-4"/>
                                Vô hiệu hóa
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4"/>
                                Kích hoạt
                            </>
                        )}
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>
                    <button
                        onClick={() => handleDeleteClick(category)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-red-600"
                    >
                        <Trash2 className="w-4 h-4"/>
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );

    if (showLoading) {
        return (
            <div
                className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    if (!categories.content.length) {
        return (
            <div className="p-8 text-center">
                <Folder className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"/>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Không tìm thấy danh mục nào
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Thử thay đổi bộ lọc hoặc tạo danh mục mới
                </p>
                <button
                    onClick={onRefresh}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                    Làm mới
                </button>
            </div>
        );
    }

    if (isMobileView) {
        return (
            <div className="bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.content.map((category) => (
                        <div key={category.categoryId}
                             className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Folder className="w-6 h-6 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-textDark dark:text-textLight">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-secondary dark:text-highlight">
                                            {category.slug}
                                        </p>
                                    </div>
                                </div>
                                {renderMobileActions(category)}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-secondary dark:text-highlight">
                                        <Info className="w-4 h-4 shrink-0"/>
                                        <span className="truncate">{category.description || 'Không có mô tả'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className={getStatusBadgeClass(category.status)}>
                                            {category.status ? 'Hoạt động' : 'Vô hiệu'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {renderSubcategoryCount(category.categoryId)}
                                        <Link
                                            to={`/admin/categories/${category.categoryId}/subcategories`}
                                            className="text-sm text-primary flex items-center gap-1"
                                        >
                                            Quản lý
                                            <ArrowRight className="w-4 h-4"/>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination
                    currentPage={categories.number}
                    totalPages={categories.totalPages}
                    onPageChange={onPageChange}
                    pageSize={categories.size}
                    totalElements={categories.totalElements}
                    onPageSizeChange={onPageSizeChange}
                />
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-secondary rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        {[
                            {icon: Folder, label: 'ID', width: 'w-16'},
                            {icon: Info, label: 'Thông tin', width: 'w-48'},
                            {icon: Shield, label: 'Mô tả', width: 'w-64'},
                            {icon: Calendar, label: 'Slug', width: 'w-48'},
                            {icon: FolderTree, label: 'Danh mục con', width: 'w-40'},
                            {icon: CheckCircle, label: 'Trạng thái', width: 'w-32'},
                            {icon: null, label: 'Thao tác', width: 'w-40'}
                        ].map((header, idx) => (
                            <th key={idx}
                                className={`py-2 px-4 text-xs font-semibold text-secondary dark:text-highlight 
                                    text-center border-r border-gray-200 dark:border-gray-700 ${header.width}
                                    ${idx === 0 ? 'rounded-tl-xl' : ''} 
                                    ${idx === 6 ? 'rounded-tr-xl border-r-0' : ''}`}>
                                <div className="flex items-center gap-1.5 justify-center">
                                    {header.icon && <header.icon className="w-3.5 h-3.5"/>}
                                    <span className="font-bold">{header.label}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {categories.content.map((category) => (
                        <tr key={category.categoryId}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                                    transition-colors duration-200 border-b border-gray-200
                                    dark:border-gray-700"
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-16">
                                <div className="text-sm font-medium text-textDark dark:text-textLight text-center">
                                    {category.categoryId}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-48">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Folder className="w-4 h-4 text-primary"/>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-textDark dark:text-textLight truncate">
                                            {category.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-64">
                                <div className="text-sm text-textDark dark:text-textLight truncate">
                                    {category.description || 'Không có mô tả'}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-48">
                                <div className="flex justify-center">
                                    <code
                                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded truncate max-w-full">
                                        {category.slug}
                                    </code>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-40">
                                <div className="flex justify-center">
                                    {renderSubcategoryCount(category.categoryId)}
                                </div>
                            </td>
                            <td className="py-1 px-1 border-r border-gray-200 dark:border-gray-700 w-32">
                                <div className="flex justify-center">
                                    <span className={getStatusBadgeClass(category.status)}>
                                        <div className="flex items-center gap-1">
                                            {category.status ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3"/>
                                                    <span>Hoạt động</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3"/>
                                                    <span>Vô hiệu</span>
                                                </>
                                            )}
                                        </div>
                                    </span>
                                </div>
                            </td>
                            <td className="py-2 px-4 w-40">
                                <div className="flex justify-center">
                                    {renderActionButtons(category)}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={categories.number}
                totalPages={categories.totalPages}
                onPageChange={onPageChange}
                pageSize={categories.size}
                totalElements={categories.totalElements}
                onPageSizeChange={onPageSizeChange}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && categoryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Xác nhận xóa
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Bạn có chắc chắn muốn xóa danh mục{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {categoryToDelete.name}
                            </span>{' '}
                            không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmation(false);
                                    setCategoryToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryDataTable;