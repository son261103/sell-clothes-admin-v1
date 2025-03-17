import { useState, useEffect, useRef } from 'react';
import {
    Download, Upload, FileQuestion,
    FileText, Package, FileSpreadsheet, CheckCircle, Loader2, AlertTriangle
} from 'lucide-react';

import {
    useProductExcelTemplate,
    useProductExcelImport
} from '../../hooks/productExcelHooks';

import {
    useProductSeparateExcel,
    useProductTemplate,
    useProductImport
} from '../../hooks/ProductSeparateExcelHooks';

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

// Type definitions
type ImportTypeOption = 'full' | 'basic';

interface ErrorResponseType {
    code?: string;
    message?: string;
    details?: unknown;
}

interface ImportResult {
    success?: boolean;
    message?: string;
    data?: Record<string, unknown> | null;
    warning?: string;
    error?: ErrorResponseType | string;  // Có thể là object hoặc string
    totalImported?: number;
    productIds?: number[];
}

interface ApiErrorResponse {
    response?: {
        data?: ImportResult;
        status?: number;
    };
    message?: string;
}

const ImportTab = () => {
    // State for UI components
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState<boolean>(false);
    const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [importProgress, setImportProgress] = useState<number>(0);
    const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
    const [importType, setImportType] = useState<ImportTypeOption>('full');
    const [importMessage, setImportMessage] = useState<string>('');
    const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
    const [zipAnalysisWarning, setZipAnalysisWarning] = useState<string | null>(null);

    // Refs for timer management
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Hooks
    const {
        templateInfo,
        downloadTemplate,
        downloadFullTemplate,
        downloadInstructions,
        getTemplateInfo
    } = useProductExcelTemplate();

    const {
        importProducts: importFullProducts,
        isLoading: isImportingFull
    } = useProductExcelImport();

    // Hooks for separate product import (without variants)
    const { isAnyOperationInProgress } = useProductSeparateExcel();
    const {
        downloadProductTemplate,
        downloadProductTemplatePackage
    } = useProductTemplate();
    const {
        importProducts: importBasicProducts,
        importProductsFromZip: importBasicProductsFromZip,
        isLoading: isImportingBasic,
        hasImportErrors: hasBasicImportErrors,
        importedProducts,
        errorReportUrl: basicErrorReportUrl,
        debugZipStructure
    } = useProductImport();

    // Derived state for overall importing status
    const isImporting = isImportingBasic || isImportingFull || isAnyOperationInProgress;

    // Clean up timers when component unmounts
    useEffect(() => {
        // Store the current ref values in variables that won't change
        const progressInterval = progressIntervalRef.current;
        const successTimeout = successTimeoutRef.current;

        return () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            if (successTimeout) {
                clearTimeout(successTimeout);
            }
        };
    }, []);

    // Fetch template info on initial load
    useEffect(() => {
        const fetchTemplateInfo = async () => {
            try {
                await getTemplateInfo();
            } catch (error) {
                console.error('Failed to fetch template info:', error);
            }
        };
        fetchTemplateInfo();
    }, [getTemplateInfo]);

    // Reset states when component unmounts
    useEffect(() => {
        return () => {
            setSelectedFile(null);
            setShowSuccessMessage(false);
            setImportProgress(0);
            setShowSuccessPopup(false);
            setShowErrorPopup(false);
        };
    }, []);

    // Handle template download based on type
    const handleDownloadTemplate = async () => {
        try {
            if (importType === 'full') {
                await downloadTemplate();
            } else {
                await downloadProductTemplate();
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            setErrorMessage('Không thể tải mẫu nhập liệu. Vui lòng thử lại sau.');
            setShowErrorPopup(true);
        }
    };

    // Handle full template download (with samples) based on type
    const handleDownloadFullTemplate = async () => {
        try {
            if (importType === 'full') {
                await downloadFullTemplate();
            } else {
                await downloadProductTemplatePackage();
            }
        } catch (error) {
            console.error('Error downloading full template:', error);
            setErrorMessage('Không thể tải gói mẫu. Vui lòng thử lại sau.');
            setShowErrorPopup(true);
        }
    };

    // Handle instructions download
    const handleDownloadInstructions = async () => {
        try {
            await downloadInstructions();
        } catch (error) {
            console.error('Error downloading instructions:', error);
            setErrorMessage('Không thể tải hướng dẫn. Vui lòng thử lại sau.');
            setShowErrorPopup(true);
        }
    };

    // Handle file analysis for ZIP files
    const handleAnalyzeFile = async (file: File) => {
        if (!file || !file.name.toLowerCase().endsWith('.zip')) return;

        try {
            setIsAnalyzingFile(true);
            // Phân tích cấu trúc ZIP trước khi import để kiểm tra tính hợp lệ
            if (importType === 'basic') {
                const result = await debugZipStructure(file);
                // Check if we received a warning but not a fatal error
                if (result && 'warning' in result && result.warning) {
                    if (result.message) {
                        setZipAnalysisWarning(result.message);
                        console.warn("ZIP analysis warning:", result.message);
                    }
                    // We'll continue with the import despite the warning
                }
            }
        } catch (error) {
            console.error('Error analyzing ZIP file:', error);
            // This is just a warning, not a fatal error
            setZipAnalysisWarning('Không thể phân tích đầy đủ file ZIP. Import vẫn sẽ được tiếp tục.');
        } finally {
            setIsAnalyzingFile(false);
        }
    };

    // Reset progress and set up interval for progress updates
    const setupProgressTracking = (): void => {
        setImportProgress(0);

        // Clear any existing interval
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        // Set up progress interval - increase gradually to 95%
        const intervalId = setInterval(() => {
            setImportProgress(prev => {
                // Slow down as we get closer to 95%
                const increment = prev < 30 ? 5 :
                    prev < 60 ? 3 :
                        prev < 80 ? 1 : 0.5;

                const newProgress = prev + increment;
                if (newProgress >= 95) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                    }
                    return 95;
                }
                return newProgress;
            });
        }, 300);

        progressIntervalRef.current = intervalId;
    };

    // Complete progress and show success/error UI
    const completeProgress = (success: boolean, message: string) => {
        // Clear progress interval
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        // Set progress to 100% regardless of success/failure
        setImportProgress(100);

        if (success) {
            setImportMessage(message);
            setShowSuccessPopup(true);
            setShowSuccessMessage(true);
            setShowErrorPopup(false); // Ensure error popup is hidden
        } else {
            setErrorMessage(message);
            setShowErrorPopup(true);
            setShowSuccessPopup(false); // Ensure success popup is hidden
            setShowSuccessMessage(false); // Ensure success message is hidden
        }
    };

    // Improved function to detect success message even if HTTP status is not 200
    const isSuccessMessageDetected = (result: ImportResult | null | unknown): boolean => {
        if (!result) return false;

        // If result is not an object, it's not a success
        if (typeof result !== 'object') return false;

        const resultObj = result as ImportResult;

        // Explicit success flag
        if (resultObj.success === true) return true;

        // Check for total imported products
        if (resultObj.totalImported && resultObj.totalImported > 0) return true;

        // Check for product IDs array
        if (resultObj.productIds && Array.isArray(resultObj.productIds) && resultObj.productIds.length > 0) return true;

        // Trường hợp đặc biệt: Thông báo thành công nằm trong trường error
        if (resultObj.error) {
            if (typeof resultObj.error === 'string') {
                const errorMsg = resultObj.error.toLowerCase();
                if (
                    errorMsg.includes("thành công") ||
                    errorMsg.includes("đã nhập") ||
                    errorMsg.includes("imported") ||
                    errorMsg.includes("success")
                ) {
                    console.log("Phát hiện thông báo thành công trong trường error:", resultObj.error);
                    return true;
                }
            } else if (typeof resultObj.error === 'object' && resultObj.error !== null) {
                // Nếu error là một đối tượng và có message
                const errorObject = resultObj.error as ErrorResponseType;
                if (errorObject.message && typeof errorObject.message === 'string') {
                    const errorMsg = errorObject.message.toLowerCase();
                    if (
                        errorMsg.includes("thành công") ||
                        errorMsg.includes("đã nhập") ||
                        errorMsg.includes("imported") ||
                        errorMsg.includes("success")
                    ) {
                        console.log("Phát hiện thông báo thành công trong trường error.message:", errorObject.message);
                        return true;
                    }
                }
            }
        }

        // Success message detection
        if (resultObj.message && typeof resultObj.message === 'string') {
            const message = resultObj.message.toLowerCase();
            if (
                message.includes("thành công") ||
                message.includes("đã nhập") ||
                message.includes("imported") ||
                message.includes("success")
            ) {
                return true;
            }
        }

        return false;
    };

    // Handle import button click
    const handleImportFile = async () => {
        if (!selectedFile || isImporting || isAnalyzingFile) return;

        // Start progress tracking
        setupProgressTracking();

        try {
            const isZipFile = selectedFile?.name?.toLowerCase()?.endsWith('.zip') || false;

            // Analyze ZIP file first if needed
            if (isZipFile) {
                setIsAnalyzingFile(true);
                // Brief delay to show analyzing state
                await new Promise(resolve => setTimeout(resolve, 500));
                setIsAnalyzingFile(false);
            }

            const commonOptions = {
                skipDuplicates: true,
                updateExisting: false,
                generateSlugs: true
            };

            if (importType === 'full') {
                const request = {
                    file: selectedFile,
                    options: {
                        ...commonOptions,
                        importImages: true,
                        generateSkus: true
                    }
                };
                const result = await importFullProducts(request);

                if (result !== null && isSuccessMessageDetected(result)) {
                    completeProgress(true, result.message || 'Dữ liệu sản phẩm và biến thể đã được nhập thành công.');
                } else {
                    completeProgress(false, result?.message || 'Vui lòng kiểm tra file và thử lại.');
                }
            } else {
                const request = {
                    file: selectedFile,
                    options: {
                        ...commonOptions,
                        importImages: isZipFile,
                        generateSkus: true
                    }
                };

                let result: ImportResult | null = null;

                try {
                    if (isZipFile) {
                        console.log("Sending ZIP import request...");
                        result = await importBasicProductsFromZip(request);
                        console.log("ZIP import result:", result);
                    } else {
                        result = await importBasicProducts(request);
                    }

                    // Kiểm tra trường hợp đặc biệt: thông báo thành công trong trường error
                    if (result && result.error) {
                        if (typeof result.error === 'string') {
                            const errorStr = result.error;
                            if (errorStr.includes("thành công") || errorStr.includes("Đã nhập")) {
                                // Trích xuất số sản phẩm nếu có
                                const match = errorStr.match(/(\d+) sản phẩm/);
                                const productCount = match ? match[1] : '0';

                                completeProgress(true, `Đã nhập thành công ${productCount} sản phẩm cơ bản.`);
                                return;
                            }
                        } else if (typeof result.error === 'object' && result.error !== null) {
                            const errorObj = result.error as ErrorResponseType;
                            if (errorObj.message && typeof errorObj.message === 'string') {
                                if (errorObj.message.includes("thành công") || errorObj.message.includes("Đã nhập")) {
                                    // Trích xuất số sản phẩm nếu có
                                    const match = errorObj.message.match(/(\d+) sản phẩm/);
                                    const productCount = match ? match[1] : '0';

                                    completeProgress(true, `Đã nhập thành công ${productCount} sản phẩm cơ bản.`);
                                    return;
                                }
                            }
                        }
                    }

                    // Improved success detection logic
                    if (result !== null && isSuccessMessageDetected(result)) {
                        const successMessage = result.totalImported
                            ? `Đã nhập thành công ${result.totalImported} sản phẩm cơ bản.`
                            : (importedProducts && importedProducts.length > 0)
                                ? `Đã nhập thành công ${importedProducts.length} sản phẩm cơ bản.`
                                : (result.message || "Nhập dữ liệu thành công.");

                        completeProgress(true, successMessage);
                    } else if (result !== null && result.success === false && !isSuccessMessageDetected(result)) {
                        completeProgress(false, result.message || "Lỗi khi nhập dữ liệu.");
                    } else if (hasBasicImportErrors && !isSuccessMessageDetected(result)) {
                        let errorMsg = 'Có lỗi xảy ra trong quá trình nhập. Vui lòng kiểm tra lại file.';
                        if (basicErrorReportUrl) {
                            errorMsg += ` Tải xuống báo cáo lỗi tại: ${basicErrorReportUrl}`;
                        }
                        completeProgress(false, errorMsg);
                    } else {
                        // Nếu không xác định được kết quả rõ ràng, kiểm tra thêm message
                        if (result && result.message && typeof result.message === 'string') {
                            if (result.message.toLowerCase().includes("thành công") ||
                                result.message.toLowerCase().includes("đã nhập")) {
                                completeProgress(true, result.message);
                            } else {
                                completeProgress(false, 'Không có sản phẩm nào được nhập. Vui lòng kiểm tra lại file.');
                            }
                        } else {
                            completeProgress(false, 'Không có sản phẩm nào được nhập. Vui lòng kiểm tra lại file.');
                        }
                    }
                } catch (error: unknown) {
                    console.error('Error during import operation:', error);

                    // Cải thiện logic xử lý lỗi
                    const apiError = error as ApiErrorResponse;

                    // Trường hợp đặc biệt: lỗi là "Import thành công. Đã nhập X sản phẩm."
                    if (apiError.message) {
                        const errorMessage = String(apiError.message);
                        if (errorMessage.includes("Import thành công")) {
                            console.log("Phát hiện thông báo thành công trong error message:", errorMessage);

                            // Trích xuất số lượng sản phẩm
                            const match = errorMessage.match(/(\d+) sản phẩm/);
                            const productCount = match ? match[1] : '0';
                            completeProgress(true, `Đã nhập thành công ${productCount} sản phẩm.`);
                            return;
                        }
                    }

                    // Kiểm tra message của error
                    if (apiError.message) {
                        const errorMessage = String(apiError.message).toLowerCase();
                        if (
                            errorMessage.includes("thành công") ||
                            errorMessage.includes("đã nhập") ||
                            errorMessage.includes("imported") ||
                            errorMessage.includes("success")
                        ) {
                            completeProgress(true, String(apiError.message));
                            return;
                        }
                    }

                    // Kiểm tra data trong response
                    const errorData = apiError.response?.data;
                    if (errorData) {
                        // Kiểm tra trường error trong errorData (trường hợp đặc biệt)
                        if (errorData.error) {
                            if (typeof errorData.error === 'string') {
                                const errorStr = errorData.error;
                                if (errorStr.includes("thành công") || errorStr.includes("Đã nhập")) {
                                    console.log("Phát hiện thông báo thành công trong error.response.data.error:", errorStr);

                                    // Trích xuất số sản phẩm
                                    const match = errorStr.match(/(\d+) sản phẩm/);
                                    const productCount = match ? match[1] : '0';
                                    completeProgress(true, `Đã nhập thành công ${productCount} sản phẩm.`);
                                    return;
                                }
                            } else if (typeof errorData.error === 'object' && errorData.error !== null) {
                                const errorObj = errorData.error as ErrorResponseType;
                                if (errorObj.message && typeof errorObj.message === 'string') {
                                    const errorMsg = errorObj.message;
                                    if (errorMsg.includes("thành công") || errorMsg.includes("Đã nhập")) {
                                        console.log("Phát hiện thông báo thành công trong error.response.data.error.message:", errorMsg);

                                        // Trích xuất số sản phẩm
                                        const match = errorMsg.match(/(\d+) sản phẩm/);
                                        const productCount = match ? match[1] : '0';
                                        completeProgress(true, `Đã nhập thành công ${productCount} sản phẩm.`);
                                        return;
                                    }
                                }
                            }
                        }

                        // Kiểm tra các dấu hiệu thành công khác
                        if (isSuccessMessageDetected(errorData)) {
                            const successMsg = errorData.message ||
                                `Đã nhập thành công ${errorData.totalImported || 0} sản phẩm mặc dù có lỗi kết nối.`;
                            completeProgress(true, successMsg);
                            return;
                        }
                    }

                    // Mặc định là lỗi nếu không tìm thấy chỉ báo thành công
                    completeProgress(false, 'Lỗi kết nối trong quá trình nhập dữ liệu. Vui lòng thử lại sau.');
                }
            }
        } catch (error: unknown) {
            console.error('Error in import process:', error);

            // Kiểm tra xem lỗi có phải là do API trả về "thành công" nhưng trong exception không
            const errorObj = error as { message?: string };
            if (errorObj.message &&
                (errorObj.message.includes("thành công") ||
                    errorObj.message.includes("đã nhập") ||
                    errorObj.message.includes("imported") ||
                    errorObj.message.includes("success"))) {
                // Trường hợp lỗi khi lưu log nhưng thực tế import đã thành công
                const match = errorObj.message.match(/(\d+) sản phẩm/);
                const count = match ? match[1] : "0";
                completeProgress(true, `Đã nhập thành công ${count} sản phẩm.`);
            } else {
                completeProgress(false, 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.');
            }
        }
    };

    // File selection handler with analyzation
    const handleFileSelected = (file: File | null) => {
        setSelectedFile(file);
        setZipAnalysisWarning(null); // Reset warning on new file
        setShowSuccessMessage(false); // Reset success message on new file
        setShowErrorPopup(false); // Reset error popup on new file

        if (file) {
            handleAnalyzeFile(file);
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
      ├── thumbnails/    (cho sản phẩm cơ bản)
      │   ├── thumbnail1.jpg
      │   └── thumbnail2.jpg
      └── SKU001/        (cho biến thể sản phẩm)
          ├── main.jpg
          └── image1.jpg`}
                </pre>
            </div>
            <p className="text-gray-500 dark:text-gray-400 italic text-sm mt-2">
                <strong>Lưu ý:</strong> Nếu chọn "Nhập sản phẩm đầy đủ", cần dùng cấu trúc thư mục cho biến thể sản phẩm.
                Nếu chọn "Nhập sản phẩm cơ bản", ảnh sản phẩm sẽ được lấy từ thư mục thumbnails.
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
            {/* Import Type Selection */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Chọn loại nhập:</span>
                </div>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            className="form-radio h-4 w-4 text-primary"
                            checked={importType === 'full'}
                            onChange={() => setImportType('full')}
                            disabled={isImporting || isAnalyzingFile}
                        />
                        <span className="text-sm">Nhập sản phẩm đầy đủ (với biến thể)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            className="form-radio h-4 w-4 text-primary"
                            checked={importType === 'basic'}
                            onChange={() => setImportType('basic')}
                            disabled={isImporting || isAnalyzingFile}
                        />
                        <span className="text-sm">Nhập sản phẩm cơ bản (không biến thể)</span>
                    </label>
                </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        disabled={isImporting || isAnalyzingFile}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Tải mẫu nhập liệu</span>
                    </button>
                    <button
                        onClick={handleDownloadFullTemplate}
                        disabled={isImporting || isAnalyzingFile}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Package className="h-3.5 w-3.5" />
                        <span>Tải gói mẫu đầy đủ</span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadInstructions}
                        disabled={isImporting || isAnalyzingFile}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Tải hướng dẫn</span>
                    </button>
                    <button
                        onClick={() => setShowTemplateInfoModal(true)}
                        disabled={isImporting || isAnalyzingFile}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>Thông tin mẫu</span>
                    </button>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        disabled={isImporting || isAnalyzingFile}
                        className="inline-flex justify-center h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>Trợ giúp</span>
                    </button>
                </div>
            </div>

            {/* File Upload */}
            <FileUpload
                selectedFile={selectedFile}
                setSelectedFile={handleFileSelected}
                isAnalyzingFile={isAnalyzingFile}
            />

            {/* ZIP Analysis Warning */}
            {zipAnalysisWarning && (
                <div className="border border-yellow-200 dark:border-yellow-900 rounded-md p-3 bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <h3 className="font-medium text-sm">Cảnh báo về file ZIP</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {zipAnalysisWarning}
                    </p>
                </div>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="border border-green-200 dark:border-green-900 rounded-md p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Nhập dữ liệu thành công</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {importMessage || "Dữ liệu đã được nhập vào hệ thống thành công."}
                    </p>
                </div>
            )}

            {/* Progress Bar */}
            {(isImporting || isAnalyzingFile || importProgress > 0) && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${importProgress}%` }}
                    ></div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isAnalyzingFile ? 'Đang phân tích cấu trúc file...' :
                                isImporting ? 'Đang nhập dữ liệu...' :
                                    importProgress >= 100 ? 'Hoàn thành' : 'Đang xử lý...'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {importProgress.toFixed(0)}%
                        </p>
                    </div>
                </div>
            )}

            {/* Import Button */}
            {selectedFile && !showSuccessMessage && (
                <div className="flex justify-end">
                    <button
                        onClick={handleImportFile}
                        disabled={isImporting || isAnalyzingFile}
                        className={`inline-flex justify-center h-10 px-4 text-sm rounded-md items-center gap-1.5 ${
                            isImporting || isAnalyzingFile ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                    >
                        {isImporting || isAnalyzingFile ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isAnalyzingFile ? 'Đang phân tích...' : 'Đang xử lý...'}</span>
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
                            {importMessage || (importType === 'full'
                                ? 'Tập tin chứa sản phẩm và biến thể đã được nhập thành công.'
                                : 'Tập tin chứa sản phẩm cơ bản đã được nhập thành công.')}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    setSelectedFile(null);
                                    setImportProgress(0);
                                }}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Popup Modal */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                            Đã xảy ra lỗi
                        </h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                            {errorMessage}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setShowErrorPopup(false);
                                    setImportProgress(0);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
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