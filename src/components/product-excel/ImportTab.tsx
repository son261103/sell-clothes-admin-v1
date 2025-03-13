import React, { useState, useEffect } from 'react';
import {
    Download, Upload, FileQuestion,
    FileText, Package, FileSpreadsheet, CheckCircle, Loader2
} from 'lucide-react';

import {
    useProductExcelTemplate,
    useProductExcelImport
} from '../../hooks/productExcelHooks';

import FileUpload from './FileUpload';
import InfoModal from './InfoModal';

// Fallback template info for when API fails
const fallbackTemplateInfo = {
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    supportedFeatures: [
        'Nhập sản phẩm cơ bản',
        'Nhập biến thể sản phẩm',
        'Tự động tạo SKU',
        'Tự động tạo URL Slug',
        'Nhập hàng loạt hình ảnh'
    ],
    includesCategories: true,
    includesBrands: true,
    includesVariants: true
};

const ImportTab: React.FC = () => {
    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Hooks
    const {
        templateInfo,
        downloadTemplate,
        downloadFullTemplate,
        downloadInstructions,
        getTemplateInfo
    } = useProductExcelTemplate();

    const {
        importProducts
    } = useProductExcelImport();

    // Fetch template info on initial load
    useEffect(() => {
        const fetchTemplateInfo = async () => {
            try {
                await getTemplateInfo();
            } catch (error) {
                console.error('Failed to fetch template info:', error);
                // We'll use the fallback values as defined above
            }
        };

        fetchTemplateInfo();
    }, [getTemplateInfo]);

    // Track success popup visibility
    useEffect(() => {
        if (showSuccessPopup) {
            // Auto-close the popup after 5 seconds
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);

    // Reset states when component unmounts
    useEffect(() => {
        return () => {
            setSelectedFile(null);
            setShowSuccessMessage(false);
            setIsImporting(false);
            setImportProgress(0);
            setShowSuccessPopup(false);
        };
    }, []);

    // Handle template download
    const handleDownloadTemplate = async () => {
        await downloadTemplate();
    };

    // Handle full template download (with samples)
    const handleDownloadFullTemplate = async () => {
        await downloadFullTemplate();
    };

    // Handle instructions download
    const handleDownloadInstructions = async () => {
        await downloadInstructions();
    };

    // Handle import button click
    const handleImportFile = async () => {
        if (!selectedFile || isImporting) return;

        // Set loading state to prevent multiple submissions
        setIsImporting(true);
        setImportProgress(0);

        try {
            // Call the API to import the file
            const request = {
                file: selectedFile,
                options: {
                    skipDuplicates: true,
                    updateExisting: false,
                    importImages: true,
                    generateSlugs: true,
                    generateSkus: true
                }
            };

            // Simulate progress updates (in production, you might get these from your API)
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 300);

            await importProducts(request);

            // Ensure progress reaches 100% when complete
            clearInterval(progressInterval);
            setImportProgress(100);

            // Show success popup
            setShowSuccessPopup(true);

            // Show success message
            setShowSuccessMessage(true);

            // Reset file selection
            setTimeout(() => {
                setSelectedFile(null);
                // Hide success message after a delay
                setTimeout(() => {
                    setShowSuccessMessage(false);
                    setImportProgress(0);
                }, 5000);
            }, 2000);
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Có lỗi xảy ra khi nhập dữ liệu. Vui lòng thử lại sau.');
        } finally {
            // Reset loading state
            setIsImporting(false);
        }
    };

    // Render template info modal content
    const renderTemplateInfoContent = () => (
        <div className="space-y-4">
            <p>
                Mẫu nhập liệu Excel cho phép bạn nhập sản phẩm hàng loạt vào hệ thống một cách dễ dàng.
            </p>
            {(templateInfo || fallbackTemplateInfo) && (
                <div className="space-y-2">
                    <p><strong>Phiên bản:</strong> {templateInfo?.version || fallbackTemplateInfo.version}</p>
                    <p><strong>Cập nhật lần cuối:</strong> {templateInfo?.lastUpdated ? new Date(templateInfo.lastUpdated).toLocaleDateString('vi-VN') : new Date(fallbackTemplateInfo.lastUpdated).toLocaleDateString('vi-VN')}</p>

                    <p><strong>Tính năng hỗ trợ:</strong></p>
                    <ul className="list-disc pl-5">
                        {(templateInfo?.supportedFeatures || fallbackTemplateInfo.supportedFeatures).map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center">
                            <span className={(templateInfo?.includesCategories || fallbackTemplateInfo.includesCategories) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                {(templateInfo?.includesCategories || fallbackTemplateInfo.includesCategories) ? "✓" : "✗"}
                            </span>
                            <span className="ml-2">Danh mục sản phẩm</span>
                        </div>

                        <div className="flex items-center">
                            <span className={(templateInfo?.includesBrands || fallbackTemplateInfo.includesBrands) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                {(templateInfo?.includesBrands || fallbackTemplateInfo.includesBrands) ? "✓" : "✗"}
                            </span>
                            <span className="ml-2">Thương hiệu</span>
                        </div>

                        <div className="flex items-center">
                            <span className={(templateInfo?.includesVariants || fallbackTemplateInfo.includesVariants) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                {(templateInfo?.includesVariants || fallbackTemplateInfo.includesVariants) ? "✓" : "✗"}
                            </span>
                            <span className="ml-2">Biến thể sản phẩm</span>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                Tải mẫu Excel này và thực hiện theo hướng dẫn trong tập tin để nhập sản phẩm vào hệ thống.
            </p>
            <div className="pt-3 flex flex-col gap-2">
                <h4 className="font-medium text-sm">Tài nguyên tải xuống:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Tải mẫu Excel</span>
                    </button>
                    <button
                        onClick={handleDownloadFullTemplate}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <Package className="h-4 w-4" />
                        <span>Tải gói mẫu đầy đủ</span>
                    </button>
                    <button
                        onClick={handleDownloadInstructions}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Tải hướng dẫn</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // Render import help modal content
    const renderHelpContent = () => (
        <div className="space-y-4">
            <h4 className="font-medium">Hướng dẫn nhập Excel</h4>
            <ol className="list-decimal pl-5 space-y-2">
                <li>Tải mẫu Excel từ nút "Tải mẫu nhập liệu"</li>
                <li>Điền thông tin sản phẩm theo hướng dẫn trong tập tin</li>
                <li>Nếu cần nhập hình ảnh, hãy đóng gói tập tin Excel và thư mục hình ảnh vào một file ZIP</li>
                <li>Tải lên tập tin Excel đã điền hoặc file ZIP</li>
                <li>Kiểm tra và xác nhận việc nhập sản phẩm</li>
            </ol>
            <h4 className="font-medium mt-4">Cấu trúc file ZIP</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                <pre>
{`your-import.zip
  ├── product-import.xlsx
  └── images/
      ├── SKU001/
      │   ├── main.jpg
      │   └── image1.jpg
      └── SKU002/
          ├── main.jpg
          └── image1.jpg`}
                </pre>
            </div>
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                Đảm bảo tên thư mục hình ảnh trùng với SKU sản phẩm. Hình ảnh chính nên được đặt tên là "main.jpg".
            </p>

            <div className="pt-3 flex flex-col gap-2">
                <h4 className="font-medium text-sm">Tài nguyên tải xuống:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Tải mẫu Excel</span>
                    </button>
                    <button
                        onClick={handleDownloadFullTemplate}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <Package className="h-4 w-4" />
                        <span>Tải gói mẫu đầy đủ</span>
                    </button>
                    <button
                        onClick={handleDownloadInstructions}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Tải hướng dẫn</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5"/>
                        <span>Tải mẫu nhập liệu</span>
                    </button>
                    <button
                        onClick={handleDownloadFullTemplate}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5"
                    >
                        <Package className="h-3.5 w-3.5"/>
                        <span>Tải gói mẫu đầy đủ</span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadInstructions}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <FileText className="h-3.5 w-3.5"/>
                        <span>Tải hướng dẫn</span>
                    </button>
                    <button
                        onClick={() => setShowTemplateInfoModal(true)}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5"
                    >
                        <FileQuestion className="h-3.5 w-3.5"/>
                        <span>Thông tin mẫu</span>
                    </button>
                </div>
            </div>

            {/* File Upload */}
            <FileUpload
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                isAnalyzingFile={false}
            />

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="border border-green-200 dark:border-green-900 rounded-md p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Nhập dữ liệu thành công</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Dữ liệu đã được gửi để nhập vào hệ thống thành công. Quy trình đang được xử lý.
                    </p>
                </div>
            )}

            {/* Progress Bar - visible during import */}
            {isImporting && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${importProgress}%` }}
                    ></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {importProgress}% hoàn thành
                    </p>
                </div>
            )}

            {/* Import Button - shown only when a file is selected */}
            {selectedFile && !showSuccessMessage && (
                <div className="flex justify-end">
                    <button
                        onClick={handleImportFile}
                        disabled={isImporting}
                        className={`inline-flex justify-center h-10 px-4 text-sm rounded-md items-center gap-1.5 ${
                            isImporting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                <span>Nhập dữ liệu</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Template Info Modal */}
            <InfoModal
                isOpen={showTemplateInfoModal}
                title="Thông tin mẫu nhập liệu"
                content={renderTemplateInfoContent()}
                onClose={() => setShowTemplateInfoModal(false)}
            />

            {/* Help Modal */}
            <InfoModal
                isOpen={showHelpModal}
                title="Hướng dẫn nhập/xuất Excel"
                content={renderHelpContent()}
                onClose={() => setShowHelpModal(false)}
            />

            {/* Success Popup Modal */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                            Nhập dữ liệu thành công!
                        </h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                            Tập tin đã được nhập vào hệ thống thành công.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportTab;