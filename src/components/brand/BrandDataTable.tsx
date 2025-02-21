import React, { useState, useEffect } from 'react';
import {
    MoreVertical, Edit, Trash2, CheckCircle, XCircle,
    Building2, ShoppingBag, Shield, Info, RefreshCw
} from 'lucide-react';
import type {BrandPageResponse, BrandResponse} from '@/types';
import Pagination from '../common/Pagination';

interface BrandDataTableProps {
    brands: BrandPageResponse;
    onDeleteBrand: (id: number) => void;
    onEditBrand: (brand: BrandResponse) => void;
    onStatusChange: (id: number) => void;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    isMobileView: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    forceRefresh?: number; // Thêm prop này để buộc component cập nhật
}

const BrandDataTable: React.FC<BrandDataTableProps> = ({
                                                           brands,
                                                           onDeleteBrand,
                                                           onEditBrand,
                                                           onStatusChange,
                                                           isLoading,
                                                           onRefresh,
                                                           isMobileView,
                                                           onPageChange,
                                                           onPageSizeChange,
                                                           forceRefresh = 0,
                                                       }) => {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<BrandResponse | null>(null);
    const [showLoading, setShowLoading] = useState(false);
    const [localRefreshCounter, setLocalRefreshCounter] = useState(0);

    // Thêm timestamp vào URL hình ảnh để tránh cache
    const getImageUrl = (url: string | undefined) => {
        if (!url) return undefined;

        // Thêm timestamp hiện tại để đảm bảo ảnh luôn tải mới
        const timestamp = new Date().getTime();
        // Nếu URL đã có tham số query, thêm timestamp vào sau
        if (url.includes('?')) {
            return `${url}&t=${timestamp}&v=${forceRefresh + localRefreshCounter}`;
        }
        // Nếu không, thêm timestamp làm tham số query đầu tiên
        return `${url}?t=${timestamp}&v=${forceRefresh + localRefreshCounter}`;
    };

    // Cập nhật counter khi brands hoặc forceRefresh thay đổi
    useEffect(() => {
        setLocalRefreshCounter(prev => prev + 1);
    }, [brands, forceRefresh]);

    const handleDeleteClick = (brand: BrandResponse) => {
        setBrandToDelete(brand);
        setShowDeleteConfirmation(true);
        setActiveDropdown(null);
    };

    const confirmDelete = () => {
        if (brandToDelete) {
            onDeleteBrand(brandToDelete.brandId);
            setShowDeleteConfirmation(false);
            setBrandToDelete(null);
        }
    };

    const refreshImage = () => {
        // Tăng counter để tải lại tất cả hình ảnh
        setLocalRefreshCounter(prev => prev + 1);
    };

    const handleEditBrand = (brand: BrandResponse) => {
        onEditBrand(brand);
    };

    useEffect(() => {
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

    useEffect(() => {
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

    const renderActionButtons = (brand: BrandResponse) => (
        <div className="flex items-center gap-1.5">
            <ActionButton
                onClick={() => handleEditBrand(brand)}
                icon={Edit}
                color="text-blue-600 dark:text-blue-400"
                title="Chỉnh sửa"
            />
            <ActionButton
                onClick={() => onStatusChange(brand.brandId)}
                icon={brand.status ? XCircle : CheckCircle}
                color={brand.status
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'}
                title={brand.status ? 'Vô hiệu hóa' : 'Kích hoạt'}
            />
            <ActionButton
                onClick={() => handleDeleteClick(brand)}
                icon={Trash2}
                color="text-red-600 dark:text-red-400"
                title="Xóa"
            />
            {brand.logoUrl && (
                <ActionButton
                    onClick={refreshImage}
                    icon={RefreshCw}
                    color="text-gray-600 dark:text-gray-400"
                    title="Làm mới ảnh"
                />
            )}
        </div>
    );

    const renderMobileActions = (brand: BrandResponse) => (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === brand.brandId ? null : brand.brandId);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-secondary dark:text-highlight"/>
            </button>

            {activeDropdown === brand.brandId && (
                <div
                    id={`dropdown-${brand.brandId}`}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditBrand(brand);
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        <Edit className="w-4 h-4"/>
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => {
                            onStatusChange(brand.brandId);
                            setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                    >
                        {brand.status ? (
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
                    {brand.logoUrl && (
                        <button
                            onClick={() => {
                                refreshImage();
                                setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 text-textDark dark:text-textLight"
                        >
                            <RefreshCw className="w-4 h-4"/>
                            Làm mới ảnh
                        </button>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>
                    <button
                        onClick={() => handleDeleteClick(brand)}
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
            <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-secondary rounded-xl shadow-lg">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    if (!brands.content.length) {
        return (
            <div className="p-8 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"/>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Không tìm thấy thương hiệu nào
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Thử thay đổi bộ lọc hoặc tạo thương hiệu mới
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
                    {brands.content.map((brand) => (
                        <div key={`${brand.brandId}-${localRefreshCounter}`}
                             className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {brand.logoUrl ? (
                                            <img
                                                key={`${brand.brandId}-img-${localRefreshCounter}-${forceRefresh}`}
                                                src={getImageUrl(brand.logoUrl)}
                                                alt={`${brand.name} logo`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-logo.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-gray-400"/>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-textDark dark:text-textLight">
                                            {brand.name}
                                        </h3>
                                        <div className="mt-1">
                                            <span className={getStatusBadgeClass(brand.status)}>
                                                {brand.status ? 'Hoạt động' : 'Vô hiệu'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {renderMobileActions(brand)}
                            </div>

                            <div className="mt-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {brand.description || 'Không có mô tả'}
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <div className="text-gray-500 dark:text-gray-400">
                                        0 sản phẩm
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination
                    currentPage={brands.number}
                    totalPages={brands.totalPages}
                    onPageChange={onPageChange}
                    pageSize={brands.size}
                    totalElements={brands.totalElements}
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
                            {icon: Building2, label: 'ID', width: 'w-16'},
                            {icon: Building2, label: 'Logo', width: 'w-24'},
                            {icon: Info, label: 'Thông tin', width: 'w-48'},
                            {icon: Shield, label: 'Mô tả', width: 'w-64'},
                            {icon: ShoppingBag, label: 'Sản phẩm', width: 'w-32'},
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
                    {brands.content.map((brand) => (
                        <tr key={`${brand.brandId}-${localRefreshCounter}`}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                                    transition-colors duration-200 border-b border-gray-200
                                    dark:border-gray-700"
                        >
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-16">
                                <div className="text-sm font-medium text-textDark dark:text-textLight text-center">
                                    {brand.brandId}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-24">
                                <div className="flex justify-center items-center">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {brand.logoUrl ? (
                                            <img
                                                key={`${brand.brandId}-img-${localRefreshCounter}-${forceRefresh}`}
                                                src={getImageUrl(brand.logoUrl)}
                                                alt={`${brand.name} logo`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-logo.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-gray-400"/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-48">
                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-textDark dark:text-textLight truncate">
                                            {brand.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-64">
                                <div className="text-sm text-textDark dark:text-textLight truncate">
                                    {brand.description || 'Không có mô tả'}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-r border-gray-200 dark:border-gray-700 w-32">
                                <div className="text-sm text-textDark dark:text-textLight text-center">
                                    0 sản phẩm
                                </div>
                            </td>
                            <td className="py-1 px-1 border-r border-gray-200 dark:border-gray-700 w-32">
                                <div className="flex justify-center">
                                    <span className={getStatusBadgeClass(brand.status)}>
                                        <div className="flex items-center gap-1">
                                            {brand.status ? (
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
                                    {renderActionButtons(brand)}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={brands.number}
                totalPages={brands.totalPages}
                onPageChange={onPageChange}
                pageSize={brands.size}
                totalElements={brands.totalElements}
                onPageSizeChange={onPageSizeChange}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && brandToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Xác nhận xóa
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Bạn có chắc chắn muốn xóa thương hiệu{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {brandToDelete.name}
                            </span>{' '}
                            không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmation(false);
                                    setBrandToDelete(null);
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

export default BrandDataTable;