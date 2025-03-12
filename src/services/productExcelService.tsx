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
    ProductExcelErrorReport
} from '../types';
import { ApiResponse } from '@/types';
import { AxiosError } from 'axios';

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

    private static wrapResponse<T>(data: T): ApiResponse<T> {
        return {
            success: true,
            data,
            message: 'Operation successful'
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
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Imports products from Excel file
     * @param request Import request containing the file and options
     */
    async importProducts(request: ProductExcelImportRequest): Promise<ApiResponse<ProductExcelImportResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            if (request.options) {
                formData.append('options', JSON.stringify(request.options));
            }

            const response = await apiConfig.post<ProductExcelImportResponse>(
                PRODUCT_EXCEL_ENDPOINTS.IMPORT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets the status of an import job
     * @param request Optional request containing the job ID
     */
    async getImportStatus(request: ProductExcelImportProgressRequest | undefined = undefined): Promise<ApiResponse<ProductExcelImportProgressResponse>> {
        try {
            let url = PRODUCT_EXCEL_ENDPOINTS.IMPORT_STATUS;
            if (request?.jobId) {
                url += `?jobId=${request.jobId}`;
            }

            const response = await apiConfig.get<ProductExcelImportProgressResponse>(url);
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Exports products to Excel file based on filter criteria
     * @param request Export request containing filter criteria
     */
    async exportProducts(request: ProductExcelExportRequest): Promise<Blob> {
        try {
            const params = new URLSearchParams();

            if (request.categoryId !== undefined) params.append('categoryId', String(request.categoryId));
            if (request.brandId !== undefined) params.append('brandId', String(request.brandId));
            if (request.categoryIds?.length) params.append('categoryIds', request.categoryIds.join(','));
            if (request.brandIds?.length) params.append('brandIds', request.brandIds.join(','));
            if (request.status !== undefined) params.append('status', String(request.status));
            params.append('includeVariants', String(request.includeVariants));
            params.append('includeImages', String(request.includeImages));
            if (request.dateFrom) params.append('dateFrom', request.dateFrom);
            if (request.dateTo) params.append('dateTo', request.dateTo);
            params.append('fileFormat', request.fileFormat);

            const response = await apiConfig.get(
                `${PRODUCT_EXCEL_ENDPOINTS.EXPORT}?${params.toString()}`,
                {
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets information about a ZIP file before import
     * @param request ZIP info request containing the file
     */
    async getZipInfo(request: ProductExcelZipInfoRequest): Promise<ApiResponse<ProductExcelZipInfoResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            const response = await apiConfig.post<ProductExcelZipInfoResponse>(
                PRODUCT_EXCEL_ENDPOINTS.ZIP_INFO,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Generates a preview of SKU based on product attributes
     * @param request SKU generation request
     */
    async generateSkuPreview(request: SkuGenerationPreviewRequest): Promise<ApiResponse<SkuGenerationPreviewResponse>> {
        try {
            const response = await apiConfig.post<SkuGenerationPreviewResponse>(
                PRODUCT_EXCEL_ENDPOINTS.SKU_GENERATION_PREVIEW,
                request
            );
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets information about the current template
     */
    async getTemplateInfo(): Promise<ApiResponse<ProductExcelTemplateResponse>> {
        try {
            const response = await apiConfig.get<ProductExcelTemplateResponse>(
                PRODUCT_EXCEL_ENDPOINTS.TEMPLATE_INFO
            );
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
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
            const response = await apiConfig.post<ProductExcelBulkOperationResponse>(
                `${PRODUCT_EXCEL_ENDPOINTS.BULK_OPERATION}/${operation}`,
                { productIds }
            );
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }

    /**
     * Gets a detailed error report from a report URL
     * @param reportUrl URL of the error report
     */
    async getErrorReport(reportUrl: string): Promise<ApiResponse<ProductExcelErrorReport>> {
        try {
            const response = await apiConfig.get<ProductExcelErrorReport>(reportUrl);
            return ProductExcelService.wrapResponse(response.data);
        } catch (err) {
            throw ProductExcelService.createErrorResponse(err);
        }
    }
}

export default new ProductExcelService();