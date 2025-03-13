import {
    ProductExcelImportOptions,
    ProductExcelExportRequest,
    ProductExcelImportResponse,
    ProductExcelErrorDetail,
    ProductExcelErrorReport,
    SkuFolderInfo,
    BulkSkuGenerationPreviewResponse,
    SkuGenerationPreviewResponse,
    ProductExcelBulkOperationResponse
} from '@/types';

// Modal
export interface InfoModalProps {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onClose: () => void;
}

// Error Message
export interface ErrorMessageProps {
    error: string | null;
    onClear: () => void;
}

// Tab Navigation
export interface TabNavigationProps {
    activeTab: 'import' | 'export' | 'bulk-sku';
    setActiveTab: (tab: 'import' | 'export' | 'bulk-sku') => void;
}

// File Upload
export interface FileUploadProps {
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    isAnalyzingFile: boolean;
}

// Define ZipContents interface to match what's actually provided
export interface ZipContents {
    hasExcelFile: boolean;
    hasImagesFolder: boolean;
    imageCount: number;
    excelFileName: string;
    totalSize: number;
    formattedSize?: string;
    skuFolders?: SkuFolderInfo[];
    skuList?: string[];
    skusWithoutMainImage?: string[];
}

// File Analysis
export interface FileAnalysisProps {
    selectedFile: File | null;
    isAnalyzingFile: boolean;
    zipContents: ZipContents | null;
    skuFolders: SkuFolderInfo[];
    skuList?: string[];
    skusWithoutMainImage?: string[];
}

// Import Options
export interface ImportOptionsProps {
    importOptions: ProductExcelImportOptions;
    handleImportOptionChange: (option: keyof ProductExcelImportOptions, value: boolean) => void;
}

// Define ImportStats interface for clarity and to fix the type error
export interface ImportStats {
    totalProducts: number;
    totalVariants: number;
    errorCount: number;
    errorRowCount: number;
    hasErrorReport: boolean;
    totalImported?: number;
}

// Define ProgressInfo interface to match what's actually provided
export interface ProgressInfo {
    percentComplete: number;
    processedItems: number;
    totalItems: number;
    inProgress: boolean;
    jobId: string;
    startTime: string;
    estimatedEndTime: string;
    currentStatus: string;
    errors: string[];
    message?: string;
}

// Import Results
export interface ImportResultsProps {
    importResult: ProductExcelImportResponse | null;
    importStats: ImportStats | null;
    progressInfo: ProgressInfo | null;
    errorReport: ProductExcelErrorReport | null;
    errorDetails: ProductExcelErrorDetail[];
    errorReportGeneratedAt?: string;
    handleFetchErrorReport: () => void;
    handleDownloadErrorReport: () => void;
}

// Export Options
export interface ExportOptionsProps {
    exportOptions: ProductExcelExportRequest;
    handleExportOptionChange: <K extends keyof ProductExcelExportRequest>(
        option: K,
        value: ProductExcelExportRequest[K]
    ) => void;
}

// SKU Generation
export interface SkuGenerationFormProps {
    productName: string;
    size: string;
    color: string;
    handleProductNameChange: (value: string) => void;
    handleSizeChange: (value: string) => void;
    handleColorChange: (value: string) => void;
    handleGenerateSkuPreview: () => void;
    isLoading: boolean;
}

export interface SkuPreviewCardProps {
    skuPreview: SkuGenerationPreviewResponse | null;
    isLoading: boolean;
}

// Bulk SKU Generation
export interface BulkSkuGenerationFormProps {
    productName: string;
    sizes: string[];
    colors: string[];
    handleProductNameChange: (value: string) => void;
    handleSizesChange: (values: string[]) => void;
    handleColorsChange: (values: string[]) => void;
    handleGenerateBulkSkuPreview: () => void;
    isLoading: boolean;
}

export interface BulkSkuPreviewCardProps {
    bulkSkuPreview: BulkSkuGenerationPreviewResponse | null;
    isLoading: boolean;
}

export interface BulkSkuPreviewTableProps {
    skus: Array<{
        sku: string;
        size: string;
        color: string;
        folderPath: string;
    }>;
}

// Bulk Operations
export interface BulkOperationResultProps {
    bulkOperationResult: ProductExcelBulkOperationResponse | null;
    processingTimeMs?: number;
}