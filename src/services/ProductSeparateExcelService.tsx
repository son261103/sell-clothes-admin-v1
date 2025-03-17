import apiConfig from '../config/apiConfig';
import {
    ProductSeparateExcelImportRequest,
    ProductSeparateExcelImportResponse,
    ProductSeparateExcelExportRequest,
    VariantSeparateExcelImportRequest,
    VariantSeparateExcelImportResponse,
    SeparateExcelImportProgressRequest,
    SeparateExcelImportProgressResponse,
    SeparateExcelErrorReport
} from '../types/productExel/product.separate.excel.types.tsx';
import { ApiResponse } from '@/types';
import { AxiosError, AxiosResponse } from 'axios';
import {PRODUCT_SEPARATE_EXCEL_ENDPOINTS} from "@/constants/ProductSeparateExcelConstant.tsx";

/**
 * Service for handling separate product and variant Excel operations
 */
class ProductSeparateExcelService {
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
     * Helper method to parse headers from response
     */
    private static parseResponseHeaders(response: AxiosResponse): Record<string, string> {
        const result: Record<string, string> = {};

        // Parse common headers
        if (response.headers['x-error-total']) result.errorTotal = response.headers['x-error-total'];
        if (response.headers['x-error-rows']) result.errorRows = response.headers['x-error-rows'];
        if (response.headers['x-error-report-url']) result.errorReportUrl = response.headers['x-error-report-url'];
        if (response.headers['x-total-imported']) result.totalImported = response.headers['x-total-imported'];

        // Parse product-specific headers
        if (response.headers['x-products-imported']) result.productsImported = response.headers['x-products-imported'];

        // Parse variant-specific headers
        if (response.headers['x-variants-imported']) result.variantsImported = response.headers['x-variants-imported'];
        if (response.headers['x-variants-with-images']) result.variantsWithImages = response.headers['x-variants-with-images'];

        return result;
    }

    /**
     * Helper method to handle file downloads
     */
    public downloadFile(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // =====================================================================
    // SHARED METHODS
    // =====================================================================

    /**
     * Gets the status of an import job
     */
    async getImportStatus(request: SeparateExcelImportProgressRequest = {}): Promise<ApiResponse<SeparateExcelImportProgressResponse>> {
        try {
            let url = PRODUCT_SEPARATE_EXCEL_ENDPOINTS.IMPORT_STATUS;
            if (request?.jobId) {
                url += `?jobId=${request.jobId}`;
            }

            const response = await apiConfig.get<ApiResponse<SeparateExcelImportProgressResponse>>(url);
            return response.data;
        } catch (err) {
            console.error("Error getting import status:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads an error report by ID
     */
    async downloadErrorReport(reportId: string): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.ERROR_REPORT(reportId),
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error downloading error report:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets a detailed error report by ID
     */
    async getErrorReportDetails(reportId: string): Promise<ApiResponse<SeparateExcelErrorReport>> {
        try {
            const response = await apiConfig.get<ApiResponse<SeparateExcelErrorReport>>(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.ERROR_REPORT(reportId)
            );
            return response.data;
        } catch (err) {
            console.error("Error getting error report details:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    // =====================================================================
    // PRODUCT METHODS
    // =====================================================================

    /**
     * Downloads the product template Excel file
     */
    async downloadProductTemplate(): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.PRODUCT.TEMPLATE,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error downloading product template:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads the full product template package (ZIP with Excel and sample thumbnails)
     */
    async downloadProductTemplatePackage(): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.PRODUCT.TEMPLATE_PACKAGE,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error downloading product template package:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Imports products from Excel file
     */
    async importProducts(request: ProductSeparateExcelImportRequest): Promise<ApiResponse<ProductSeparateExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            const response = await apiConfig.post(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.PRODUCT.IMPORT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Process response headers
            const headers = ProductSeparateExcelService.parseResponseHeaders(response);

            // Build response with additional header information
            const apiResponse = response.data as ApiResponse<ProductSeparateExcelImportResponse>;

            if (apiResponse.data) {
                if (headers.errorTotal) apiResponse.data.errorCount = parseInt(headers.errorTotal);
                if (headers.errorRows) apiResponse.data.errorRowCount = parseInt(headers.errorRows);
                if (headers.errorReportUrl) {
                    apiResponse.data.hasErrorReport = true;
                    apiResponse.data.errorReportUrl = headers.errorReportUrl;
                }
                if (headers.totalImported) apiResponse.data.totalImported = parseInt(headers.totalImported);
            }

            return apiResponse;
        } catch (err) {
            console.error("Error importing products:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Imports products from ZIP file (Excel + thumbnails)
     */
    async importProductsFromZip(request: ProductSeparateExcelImportRequest): Promise<ApiResponse<ProductSeparateExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            const response = await apiConfig.post(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.PRODUCT.IMPORT_ZIP,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Process response headers
            const headers = ProductSeparateExcelService.parseResponseHeaders(response);

            // Build response with additional header information
            const apiResponse = response.data as ApiResponse<ProductSeparateExcelImportResponse>;

            if (apiResponse.data) {
                if (headers.errorTotal) apiResponse.data.errorCount = parseInt(headers.errorTotal);
                if (headers.errorRows) apiResponse.data.errorRowCount = parseInt(headers.errorRows);
                if (headers.errorReportUrl) {
                    apiResponse.data.hasErrorReport = true;
                    apiResponse.data.errorReportUrl = headers.errorReportUrl;
                }
                if (headers.totalImported) apiResponse.data.totalImported = parseInt(headers.totalImported);
            }

            return apiResponse;
        } catch (err) {
            console.error("Error importing products from ZIP:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Exports products to Excel file
     */
    async exportProducts(request: ProductSeparateExcelExportRequest): Promise<Blob> {
        try {
            const response = await apiConfig.post(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.PRODUCT.EXPORT,
                request,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error exporting products:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    // =====================================================================
    // VARIANT METHODS
    // =====================================================================

    /**
     * Downloads the variant template Excel file for a specific product
     */
    async downloadVariantTemplate(productId: number): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.VARIANT.TEMPLATE(productId),
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error downloading variant template:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Downloads the full variant template package for a specific product (ZIP with Excel and sample images)
     */
    async downloadVariantTemplatePackage(productId: number): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.VARIANT.TEMPLATE_PACKAGE(productId),
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error downloading variant template package:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Imports variants from Excel file for a specific product
     */
    async importVariants(request: VariantSeparateExcelImportRequest): Promise<ApiResponse<VariantSeparateExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            const response = await apiConfig.post(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.VARIANT.IMPORT(request.productId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Process response headers
            const headers = ProductSeparateExcelService.parseResponseHeaders(response);

            // Build response with additional header information
            const apiResponse = response.data as ApiResponse<VariantSeparateExcelImportResponse>;

            if (apiResponse.data) {
                if (headers.errorTotal) apiResponse.data.errorCount = parseInt(headers.errorTotal);
                if (headers.errorRows) apiResponse.data.errorRowCount = parseInt(headers.errorRows);
                if (headers.errorReportUrl) {
                    apiResponse.data.hasErrorReport = true;
                    apiResponse.data.errorReportUrl = headers.errorReportUrl;
                }
                if (headers.totalImported) apiResponse.data.totalImported = parseInt(headers.totalImported);
            }

            return apiResponse;
        } catch (err) {
            console.error("Error importing variants:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Imports variants from ZIP file (Excel + images) for a specific product
     */
    async importVariantsFromZip(request: VariantSeparateExcelImportRequest): Promise<ApiResponse<VariantSeparateExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            const response = await apiConfig.post(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.VARIANT.IMPORT_ZIP(request.productId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Process response headers
            const headers = ProductSeparateExcelService.parseResponseHeaders(response);

            // Build response with additional header information
            const apiResponse = response.data as ApiResponse<VariantSeparateExcelImportResponse>;

            if (apiResponse.data) {
                if (headers.errorTotal) apiResponse.data.errorCount = parseInt(headers.errorTotal);
                if (headers.errorRows) apiResponse.data.errorRowCount = parseInt(headers.errorRows);
                if (headers.errorReportUrl) {
                    apiResponse.data.hasErrorReport = true;
                    apiResponse.data.errorReportUrl = headers.errorReportUrl;
                }
                if (headers.totalImported) apiResponse.data.totalImported = parseInt(headers.totalImported);
                if (headers.variantsWithImages) {
                    apiResponse.data.skuList = apiResponse.data.skuList || [];
                }
            }

            return apiResponse;
        } catch (err) {
            console.error("Error importing variants from ZIP:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }

    /**
     * Exports variants to Excel file for a specific product
     */
    async exportVariants(productId: number): Promise<Blob> {
        try {
            const response = await apiConfig.get(
                PRODUCT_SEPARATE_EXCEL_ENDPOINTS.VARIANT.EXPORT(productId),
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err) {
            console.error("Error exporting variants:", err);
            throw ProductSeparateExcelService.createErrorResponse(err);
        }
    }
}

export default new ProductSeparateExcelService();