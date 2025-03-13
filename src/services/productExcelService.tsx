import apiConfig from '../config/apiConfig';
import { PRODUCT_EXCEL_ENDPOINTS } from '../constants/productExcelConstant';
import {
    ProductExcelImportRequest,
    ProductExcelImportResponse,
    ProductExcelExportRequest,
    ProductExcelImportProgressRequest,
    ProductExcelImportProgressResponse,
    ProductExcelZipInfoRequest,
    ProductExcelZipInfoResponse,
    SkuGenerationPreviewRequest,
    SkuGenerationPreviewResponse,
    ProductExcelTemplateResponse,
    ProductExcelBulkOperationResponse,
    ProductExcelErrorReport,
    BulkSkuGenerationPreviewRequest,
    BulkSkuGenerationPreviewResponse,
    ProductExcelBulkOperationRequest,
    SkuFolderInfo
} from '@/types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';
import JSZip from 'jszip';

// Define formatFileSize function directly in this file to avoid import issues
const formatFileSize = (bytes: number, decimals = 2): string => {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

class ProductExcelService {
    private static createErrorResponse(err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
            return {
                success: false,
                message: err.response.data.message || err.message,
                errorCode: err.response.data.errorCode
            };
        }
        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
            errorCode: 'UNKNOWN_ERROR'
        };
    }

    /**
     * Downloads the Excel template for product import
     */
    async downloadTemplate(): Promise<Blob> {
        try {
            const response = await apiConfig.get(PRODUCT_EXCEL_ENDPOINTS.TEMPLATE, {
                responseType: 'blob'
            });
            return response.data;
        } catch (err) {
            console.error("Error downloading template:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads the full template package (ZIP with Excel and sample images)
     */
    async downloadFullTemplate(): Promise<Blob> {
        try {
            const response = await apiConfig.get(PRODUCT_EXCEL_ENDPOINTS.FULL_TEMPLATE, {
                responseType: 'blob'
            });
            return response.data;
        } catch (err) {
            console.error("Error downloading full template:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads the instruction text for product import
     */
    async downloadInstructions(): Promise<Blob> {
        try {
            const response = await apiConfig.get(PRODUCT_EXCEL_ENDPOINTS.INSTRUCTIONS, {
                responseType: 'blob'
            });
            return response.data;
        } catch (err) {
            console.error("Error downloading instructions:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets information about the current template
     */
    async getTemplateInfo(): Promise<ApiResponse<ProductExcelTemplateResponse>> {
        try {
            const response = await apiConfig.get<ApiResponse<ProductExcelTemplateResponse>>(
                PRODUCT_EXCEL_ENDPOINTS.TEMPLATE_INFO
            );
            return response.data;
        } catch (err) {
            console.error("Error getting template info:", err);
            // Return a default response when server returns an error
            return {
                success: false,
                message: 'Failed to get template info',
                data: {
                    version: '1.0',
                    lastUpdated: new Date().toISOString().slice(0, 10),
                    supportedFeatures: [
                        'Nhập sản phẩm cơ bản',
                        'Nhập biến thể sản phẩm',
                        'Tự động tạo SKU'
                    ],
                    includesCategories: true,
                    includesBrands: true,
                    includesVariants: true,
                    templateUrl: PRODUCT_EXCEL_ENDPOINTS.TEMPLATE
                }
            };
        }
    }

    /**
     * Imports products from Excel file or ZIP file containing Excel and images
     * @param request Import request containing the file and options
     */
    async importProducts(request: ProductExcelImportRequest): Promise<ApiResponse<ProductExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            try {
                const response = await apiConfig.post<ApiResponse<ProductExcelImportResponse>>(
                    PRODUCT_EXCEL_ENDPOINTS.IMPORT,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                return response.data;
            } catch (error) {
                // Check if this is an error with an Excel error report
                if (error instanceof AxiosError &&
                    error.response?.status === 400 &&
                    error.response.headers['content-type']?.includes('spreadsheetml.sheet')) {

                    // This is an error report Excel file
                    const errorBlob = new Blob([error.response.data as unknown as BlobPart], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });

                    const errorMessage = error.response.headers['x-error-message'] || 'Import failed with errors';

                    const errorResponse: ProductExcelImportResponse = {
                        success: false,
                        message: errorMessage,
                        totalProducts: 0,
                        totalVariants: 0,
                        errorCount: -1, // Unknown
                        errorRowCount: -1, // Unknown
                        hasErrorReport: true,
                        errorReportUrl: URL.createObjectURL(errorBlob),
                        importedProducts: [],
                        importedVariants: []
                    };

                    return {
                        success: false,
                        data: errorResponse,
                        message: errorMessage
                    };
                }

                throw error; // Re-throw if it's not an error report
            }
        } catch (err) {
            console.error("Error importing products:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets the status of an import job
     * @param request Optional request containing the job ID
     */
    async getImportStatus(request: ProductExcelImportProgressRequest = {}): Promise<ApiResponse<ProductExcelImportProgressResponse>> {
        try {
            let url = PRODUCT_EXCEL_ENDPOINTS.IMPORT_STATUS;
            if (request?.jobId) {
                url += `?jobId=${request.jobId}`;
            }

            const response = await apiConfig.get<ApiResponse<ProductExcelImportProgressResponse>>(url);
            return response.data;
        } catch (err) {
            console.error("Error getting import status:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Exports products to Excel file based on filter criteria
     * @param request Export request containing filter criteria
     */
    async exportProducts(request: ProductExcelExportRequest = {}): Promise<Blob> {
        try {
            const params = new URLSearchParams();

            if (request.categoryId !== undefined) params.append('categoryId', String(request.categoryId));
            if (request.brandId !== undefined) params.append('brandId', String(request.brandId));
            if (request.categoryIds?.length) params.append('categoryIds', request.categoryIds.join(','));
            if (request.brandIds?.length) params.append('brandIds', request.brandIds.join(','));
            if (request.status !== undefined) params.append('status', String(request.status));
            if (request.includeVariants !== undefined) params.append('includeVariants', String(request.includeVariants));
            if (request.includeImages !== undefined) params.append('includeImages', String(request.includeImages));
            if (request.dateFrom) params.append('dateFrom', request.dateFrom);
            if (request.dateTo) params.append('dateTo', request.dateTo);
            if (request.fileFormat) params.append('fileFormat', request.fileFormat);

            const response = await apiConfig.get(
                `${PRODUCT_EXCEL_ENDPOINTS.EXPORT}?${params.toString()}`,
                {
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (err) {
            console.error("Error exporting products:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets information about a ZIP file before import
     * @param request ZIP info request containing the file
     */
    async getZipInfo(request: ProductExcelZipInfoRequest): Promise<ApiResponse<ProductExcelZipInfoResponse>> {
        try {
            // If API call fails, process ZIP file locally using JSZip
            try {
                // First try to use the server API
                const formData = new FormData();
                formData.append('file', request.file);

                const response = await apiConfig.post<ApiResponse<ProductExcelZipInfoResponse>>(
                    PRODUCT_EXCEL_ENDPOINTS.ZIP_INFO,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 10000 // 10 second timeout
                    }
                );

                // Process the response to add formatted size
                if (response.data.success && response.data.data) {
                    this.enrichZipInfoResponse(response.data.data);
                    return response.data;
                }

                // If the server response wasn't successful, throw an error to trigger local processing
                throw new Error('Server API returned unsuccessful response');
            } catch (err) {
                console.warn("Server ZIP analysis failed, falling back to client-side analysis:", err);

                // Process ZIP locally
                const zipInfo = await this.analyzeZipFile(request.file);
                return {
                    success: true,
                    message: 'ZIP file analyzed successfully (client-side)',
                    data: zipInfo
                };
            }
        } catch (err) {
            console.error("Error analyzing ZIP file:", err);

            // Return a fallback response with default values
            return {
                success: false,
                message: 'Failed to analyze ZIP file: ' + (err instanceof Error ? err.message : 'Unknown error'),
                data: {
                    hasExcelFile: false,
                    hasImagesFolder: false,
                    imageCount: 0,
                    excelFileName: '',
                    totalSize: 0,
                    formattedSize: '0 B',
                    skuFolders: [],
                    skuList: [],
                    skusWithoutMainImage: []
                }
            };
        }
    }

    /**
     * Helper method to ensure ZIP info response has complete data
     */
    private enrichZipInfoResponse(data: ProductExcelZipInfoResponse) {
        if (data.totalSize) {
            data.formattedSize = formatFileSize(data.totalSize);
        }

        // Ensure arrays are initialized
        if (!data.skuFolders) {
            data.skuFolders = [];
        }
        if (!data.skuList) {
            data.skuList = [];
        }
        if (!data.skusWithoutMainImage) {
            data.skusWithoutMainImage = [];
        }

        // Set default values for required fields if they're missing
        if (data.hasExcelFile === undefined) {
            data.hasExcelFile = false;
        }
        if (data.hasImagesFolder === undefined) {
            data.hasImagesFolder = false;
        }
        if (data.imageCount === undefined) {
            data.imageCount = 0;
        }
        if (data.totalSize === undefined) {
            data.totalSize = 0;
            data.formattedSize = '0 B';
        }
    }

    /**
     * Analyze a ZIP file client-side to extract structure information
     * This uses recursive scanning to find Excel files and image folders at any level
     */
    private async analyzeZipFile(file: File): Promise<ProductExcelZipInfoResponse> {
        try {
            console.log(`Analyzing ZIP file locally: ${file.name} (${formatFileSize(file.size)})`);
            const zip = new JSZip();

            // Read the ZIP file
            const zipContents = await zip.loadAsync(file);

            let hasExcelFile = false;
            let excelFileName = '';
            let hasImagesFolder = false;
            let imageCount = 0;
            let totalSize = 0;

            // Store SKU folders info
            const skuFolders: SkuFolderInfo[] = [];
            const skuList: string[] = [];
            const skusWithoutMainImage: string[] = [];

            // Map to store SKU folder paths for later reference
            const skuPaths: Map<string, string> = new Map();

            // Track Excel files
            const excelFiles: string[] = [];

            // Track image directories
            const imageDirs: string[] = [];

            // First pass: scan for Excel files and potential image directories
            console.log("Scanning ZIP contents...");
            await Promise.all(
                Object.keys(zipContents.files).map(async (path) => {
                    const zipEntry = zipContents.files[path];

                    if (zipEntry.dir) {
                        // Check if this looks like an images directory
                        if (
                            path.toLowerCase().includes('images/') ||
                            path.toLowerCase().includes('image/')
                        ) {
                            imageDirs.push(path);
                        }

                        // Check if this might be an SKU folder inside images dir
                        const pathParts = path.split('/');
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            if (
                                pathParts[i].toLowerCase() === 'images' ||
                                pathParts[i].toLowerCase() === 'image'
                            ) {
                                const potentialSku = pathParts[i+1];
                                if (potentialSku && !skuList.includes(potentialSku)) {
                                    skuList.push(potentialSku);
                                    skuPaths.set(potentialSku, path);
                                }
                            }
                        }
                        return;
                    }

                    // Get file size
                    const fileData = await zipEntry.async('uint8array');
                    totalSize += fileData.length;

                    // Check if it's an Excel file (at any level)
                    if (path.toLowerCase().endsWith('.xlsx') || path.toLowerCase().endsWith('.xls')) {
                        excelFiles.push(path);
                        hasExcelFile = true;
                    }

                    // Check if it's an image file
                    if (
                        path.toLowerCase().endsWith('.jpg') ||
                        path.toLowerCase().endsWith('.jpeg') ||
                        path.toLowerCase().endsWith('.png') ||
                        path.toLowerCase().endsWith('.webp') ||
                        path.toLowerCase().endsWith('.gif')
                    ) {
                        // Extract directory path
                        const dirPath = path.substring(0, path.lastIndexOf('/'));
                        if (!imageDirs.includes(dirPath)) {
                            imageDirs.push(dirPath);
                        }

                        imageCount++;

                        // Check if it's in an SKU folder structure (detect image/SKU001/file.jpg pattern)
                        const pathParts = path.split('/');

                        // Look for images/SKUxxx pattern at any position
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            // Check if current part might be "images" and next part might be an SKU
                            if (
                                pathParts[i].toLowerCase() === 'images' ||
                                pathParts[i].toLowerCase() === 'image' ||
                                i === 0 // Also check SKUs at root level
                            ) {
                                const potentialSku = pathParts[i+1];

                                // Skip if we've already processed this SKU
                                if (potentialSku && !skuList.includes(potentialSku)) {
                                    skuList.push(potentialSku);
                                    skuPaths.set(potentialSku, pathParts.slice(0, i+2).join('/'));
                                }
                            }
                        }
                    }
                })
            );

            // Second pass: analyze SKU folders
            console.log(`Found ${skuList.length} potential SKU folders`);
            for (const sku of skuList) {
                const skuPath = skuPaths.get(sku);
                if (!skuPath) continue;

                // Check if it has a main image
                let hasMainImage = false;
                const mainImagePaths = [
                    `${skuPath}/main.jpg`,
                    `${skuPath}/main.jpeg`,
                    `${skuPath}/main.png`,
                    `${skuPath}main.jpg`,    // For cases without trailing slash
                    `${skuPath}main.jpeg`,
                    `${skuPath}main.png`
                ];

                for (const mainPath of mainImagePaths) {
                    if (zipContents.files[mainPath]) {
                        hasMainImage = true;
                        break;
                    }
                }

                if (!hasMainImage) {
                    skusWithoutMainImage.push(sku);
                }

                // Count secondary images
                let secondaryImageCount = 0;
                const imageNames: string[] = [];

                for (const path in zipContents.files) {
                    if (
                        path.startsWith(skuPath) &&
                        !path.endsWith('/') &&
                        !mainImagePaths.includes(path) &&
                        (path.toLowerCase().endsWith('.jpg') ||
                            path.toLowerCase().endsWith('.jpeg') ||
                            path.toLowerCase().endsWith('.png') ||
                            path.toLowerCase().endsWith('.webp') ||
                            path.toLowerCase().endsWith('.gif'))
                    ) {
                        secondaryImageCount++;
                        const imageName = path.split('/').pop();
                        if (imageName) imageNames.push(imageName);
                    }
                }

                // Add to skuFolders info
                skuFolders.push({
                    sku,
                    hasMainImage,
                    secondaryImageCount,
                    imageNames
                });
            }

            // Select the Excel file (prefer product_import.xlsx if available)
            if (excelFiles.length > 0) {
                // Sort files to prioritize product_import.xlsx or files at the root
                excelFiles.sort((a, b) => {
                    if (a.toLowerCase().includes('product_import')) return -1;
                    if (b.toLowerCase().includes('product_import')) return 1;
                    if (a.split('/').length < b.split('/').length) return -1;
                    if (a.split('/').length > b.split('/').length) return 1;
                    return 0;
                });

                excelFileName = excelFiles[0].split('/').pop() || excelFiles[0];
            }

            // Determine if it has an images folder
            hasImagesFolder = imageDirs.length > 0 || skuFolders.length > 0;

            console.log(`ZIP analysis complete: hasExcel=${hasExcelFile}, hasImages=${hasImagesFolder}, imageCount=${imageCount}`);

            return {
                hasExcelFile,
                hasImagesFolder,
                imageCount,
                excelFileName,
                totalSize,
                formattedSize: formatFileSize(totalSize),
                skuFolders,
                skuList,
                skusWithoutMainImage
            };
        } catch (error) {
            console.error('Error in client-side ZIP analysis:', error);
            return {
                hasExcelFile: false,
                hasImagesFolder: false,
                imageCount: 0,
                excelFileName: '',
                totalSize: 0,
                formattedSize: '0 B',
                skuFolders: [],
                skuList: [],
                skusWithoutMainImage: []
            };
        }
    }

    /**
     * Generates a preview of SKU based on product attributes
     * @param request SKU generation request
     */
    async generateSkuPreview(request: SkuGenerationPreviewRequest): Promise<ApiResponse<SkuGenerationPreviewResponse>> {
        try {
            const response = await apiConfig.post<ApiResponse<SkuGenerationPreviewResponse>>(
                PRODUCT_EXCEL_ENDPOINTS.SKU_GENERATION_PREVIEW,
                request
            );
            return response.data;
        } catch (err) {
            console.error("Error generating SKU preview:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Generates multiple SKUs based on product name, sizes, and colors
     * @param request Bulk SKU generation request
     */
    async generateBulkSkuPreview(request: BulkSkuGenerationPreviewRequest): Promise<ApiResponse<BulkSkuGenerationPreviewResponse>> {
        try {
            const response = await apiConfig.post<ApiResponse<BulkSkuGenerationPreviewResponse>>(
                PRODUCT_EXCEL_ENDPOINTS.BULK_SKU_GENERATION_PREVIEW,
                request
            );
            return response.data;
        } catch (err) {
            console.error("Error generating bulk SKU preview:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Performs bulk operations on products
     * @param operation Type of operation (delete, activate, deactivate)
     * @param productIds Array of product IDs
     */
    async performBulkOperation(
        operation: 'delete' | 'activate' | 'deactivate',
        productIds: number[]
    ): Promise<ApiResponse<ProductExcelBulkOperationResponse>> {
        try {
            const request: ProductExcelBulkOperationRequest = { productIds };

            const response = await apiConfig.post<ApiResponse<ProductExcelBulkOperationResponse>>(
                `${PRODUCT_EXCEL_ENDPOINTS.BULK_OPERATION}/${operation}`,
                request
            );
            return response.data;
        } catch (err) {
            console.error("Error performing bulk operation:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets a detailed error report from a report URL
     * @param reportUrl URL of the error report
     */
    async getErrorReport(reportUrl: string): Promise<ApiResponse<ProductExcelErrorReport>> {
        try {
            const response = await apiConfig.get<ApiResponse<ProductExcelErrorReport>>(reportUrl);
            return response.data;
        } catch (err) {
            console.error("Error getting error report:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads the error report as an Excel file
     * @param reportUrl URL of the error report
     */
    async downloadErrorReport(reportUrl: string): Promise<Blob> {
        try {
            const response = await apiConfig.get(reportUrl, {
                responseType: 'blob'
            });
            return response.data;
        } catch (err) {
            console.error("Error downloading error report:", err);
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Helper method to handle the download of a file blob
     * @param blob The blob data to download
     * @param filename The name to give the downloaded file
     */
    downloadFile(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

export default new ProductExcelService();