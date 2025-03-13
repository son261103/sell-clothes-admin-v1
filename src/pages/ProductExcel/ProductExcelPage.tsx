import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FileSpreadsheet, ArrowLeft, HelpCircle, FileText } from 'lucide-react';

import { useProductExcelTemplate } from '../../hooks/productExcelHooks';

import TabNavigation from '../../components/product-excel/TabNavigation';
import ImportTab from '../../components/product-excel/ImportTab';
import ExportTab from '../../components/product-excel/ExportTab';
import BulkSkuTab from '../../components/product-excel/BulkSkuTab';
import InfoModal from '../../components/product-excel/InfoModal';

const ProductExcelPage: React.FC = () => {
    // State
    const [activeTab, setActiveTab] = useState<'import' | 'export' | 'bulk-sku'>('import');
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Hooks
    const { getTemplateInfo, downloadInstructions } = useProductExcelTemplate();

    // Fetch template info on initial load
    useEffect(() => {
        getTemplateInfo();
    }, [getTemplateInfo]);

    // Render help modal content
    const renderHelpContent = () => (
        <div className="space-y-4">
            <h4 className="font-medium">Hướng dẫn nhập/xuất Excel</h4>
            <p>
                Tính năng này cho phép bạn nhập và xuất dữ liệu sản phẩm qua tập tin Excel,
                cũng như tạo mã SKU tự động cho sản phẩm.
            </p>

            <h5 className="font-medium mt-3">Nhập Excel</h5>
            <ol className="list-decimal pl-5 space-y-1">
                <li>Tải mẫu Excel từ nút "Tải mẫu nhập liệu"</li>
                <li>Điền thông tin sản phẩm theo hướng dẫn</li>
                <li>Tải lên tập tin Excel hoặc ZIP</li>
                <li>Xác nhận việc nhập sản phẩm</li>
            </ol>

            <h5 className="font-medium mt-3">Xuất Excel</h5>
            <ol className="list-decimal pl-5 space-y-1">
                <li>Chọn tab "Xuất Excel"</li>
                <li>Cấu hình các tùy chọn xuất</li>
                <li>Nhấn nút "Xuất Excel"</li>
                <li>Tập tin sẽ được tải xuống tự động</li>
            </ol>

            <h5 className="font-medium mt-3">Tạo mã SKU</h5>
            <ol className="list-decimal pl-5 space-y-1">
                <li>Chọn tab "Tạo mã SKU"</li>
                <li>Điền thông tin sản phẩm, kích thước và màu sắc</li>
                <li>Nhấn nút "Tạo mã SKU"</li>
                <li>Có thể chuyển sang chế độ hàng loạt để tạo nhiều SKU cùng lúc</li>
            </ol>

            <button
                onClick={downloadInstructions}
                className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/90"
            >
                <FileText className="h-4 w-4" />
                <span>Tải hướng dẫn chi tiết</span>
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b"
                data-aos="fade-down"
            >
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-primary"/> Quản lý nhập xuất Excel
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Quản lý nhập và xuất dữ liệu sản phẩm qua Excel và tạo mã SKU tự động
                    </p>
                </div>
                <div className="w-full sm:w-auto flex gap-2">
                    <Link
                        to="/admin/products"
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <ArrowLeft className="h-3.5 w-3.5"/>
                        <span>Quay lại</span>
                    </Link>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="inline-flex w-full sm:w-auto justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <HelpCircle className="h-3.5 w-3.5"/>
                        <span>Hướng dẫn</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm overflow-hidden">
                {/* Tabs */}
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="p-4">
                    {/* Import Tab Content */}
                    {activeTab === 'import' && <ImportTab />}

                    {/* Export Tab Content */}
                    {activeTab === 'export' && <ExportTab />}

                    {/* Bulk SKU Tab Content */}
                    {activeTab === 'bulk-sku' && <BulkSkuTab />}
                </div>
            </div>

            {/* Help Modal */}
            <InfoModal
                isOpen={showHelpModal}
                title="Hướng dẫn nhập/xuất Excel"
                content={renderHelpContent()}
                onClose={() => setShowHelpModal(false)}
            />
        </div>
    );
};

export default ProductExcelPage;